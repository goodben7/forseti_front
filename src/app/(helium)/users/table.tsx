'use client';

import React, { useState } from 'react';
import { usersData } from '@/data/users-data';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { userListColumns, type UserDataType } from './columns';
import TablePagination from '@core/components/table/pagination';
import { Input, Button } from 'rizzui';
import { PiMagnifyingGlassBold } from 'react-icons/pi';

export default function UserListTable() {
    const [searchTerm, setSearchTerm] = useState('');

    const { table, setData } = useTanStackTable<UserDataType>({
        tableData: usersData,
        columnConfig: userListColumns,
        options: {
            initialState: {
                pagination: {
                    pageIndex: 0,
                    pageSize: 10,
                },
            },
            enableColumnResizing: false,
        },
    });

    // Filtrer les données basé sur la recherche
    const filteredData = usersData.filter((user) =>
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );

    // Mettre à jour les données lorsque le terme de recherche change
    React.useEffect(() => {
        setData(filteredData);
    }, [searchTerm, setData, filteredData]);

    return (
        <>
            {/* Barre de recherche */}
            <div className="mb-4 flex items-center justify-between gap-3">
                <Input
                    type="search"
                    placeholder="Rechercher par nom, email ou téléphone..."
                    value={searchTerm}
                    onClear={() => setSearchTerm('')}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
                    clearable
                    className="w-full max-w-md"
                />
                <Button className="bg-[#D4AF37] hover:bg-[#b8952b]">
                    Ajouter un utilisateur
                </Button>
            </div>

            {/* Tableau */}
            <Table
                table={table}
                variant="modern"
                classNames={{
                    container: 'border border-muted rounded-md',
                    rowClassName: 'last:border-0',
                }}
            />

            {/* Pagination */}
            <TablePagination table={table} className="py-4" />
        </>
    );
}
