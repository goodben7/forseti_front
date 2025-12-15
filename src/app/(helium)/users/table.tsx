'use client';

import React, { useState } from 'react';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { userListColumns, type UserDataType } from './columns';
import TablePagination from '@core/components/table/pagination';
import { Input, Button, Select, Title } from 'rizzui';
import { PiMagnifyingGlassBold, PiFunnel } from 'react-icons/pi';
import { FilterDrawerView } from '@core/components/controlled-table/table-filter';
import ToggleColumns from '@core/components/table-utils/toggle-columns';
import { graphqlClient } from '@/lib/graphql-client';

const USERS_QUERY = `
    query Users($first: Int, $after: String) {
        users(first: $first, after: $after) {
            edges {
                node {
                    id
                    email
                    displayName
                    locked
                    deleted
                    createdAt
                    profile {
                        label
                    }
                }
                cursor
            }
            pageInfo {
                hasNextPage
                endCursor
            }
            totalCount
        }
    }
`;

const profileOptions = [
    { label: 'Tous les profils', value: '' },
    { label: 'Administrateur', value: 'Administrateur' },
    { label: 'Gestionnaire', value: 'Gestionnaire' },
    { label: 'Utilisateur', value: 'Utilisateur' },
    { label: 'Consultant', value: 'Consultant' },
];

const lockedOptions = [
    { label: 'Tous', value: 'all' },
    { label: 'Verrouillé', value: 'locked' },
    { label: 'Non verrouillé', value: 'unlocked' },
];

export default function UserListTable() {
    const [rawUsers, setRawUsers] = useState<UserDataType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [profileFilter, setProfileFilter] = useState('');
    const [lockedFilter, setLockedFilter] = useState<'all' | 'locked' | 'unlocked'>('all');
    const [openFilters, setOpenFilters] = useState(false);

    const { table, setData } = useTanStackTable<UserDataType>({
        tableData: rawUsers,
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

    React.useEffect(() => {
        const filteredData = rawUsers.filter((user) => {
            const matchesSearch =
                user.displayName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                user.email
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                user.phone.includes(searchTerm);

            const matchesProfile = profileFilter ? user.profile === profileFilter : true;

            const matchesLocked =
                lockedFilter === 'all'
                    ? true
                    : lockedFilter === 'locked'
                        ? user.locked
                        : !user.locked;

            return matchesSearch && matchesProfile && matchesLocked;
        });

        setData(filteredData);
    }, [searchTerm, profileFilter, lockedFilter, rawUsers, setData]);

    React.useEffect(() => {
        async function fetchUsers() {
            try {
                setError(null);
                const result = await graphqlClient
                    .query(USERS_QUERY, { first: 100, after: null })
                    .toPromise();

                if (result.error) {
                    console.error('GraphQL Users error', result.error);
                    setError('Une erreur est survenue lors du chargement des utilisateurs.');
                    return;
                }

                if (!result.data?.users?.edges) {
                    setRawUsers([]);
                    return;
                }

                const apiUsers: UserDataType[] = result.data.users.edges.map(
                    (edge: any) => {
                        const node = edge.node;
                        return {
                            id: node.id,
                            displayName: node.displayName ?? '',
                            email: node.email ?? '',
                            phone: '',
                            personType: '',
                            isConfirmed: true,
                            locked: Boolean(node.locked),
                            deleted: Boolean(node.deleted),
                            createdAt: node.createdAt ?? new Date().toISOString(),
                            profile: node.profile?.label ?? '',
                        };
                    }
                );

                setRawUsers(apiUsers);
            } catch (error) {
                console.error('Erreur lors du chargement des utilisateurs', error);
                setError('Impossible de charger les utilisateurs. Veuillez réessayer.');
            }
        }

        fetchUsers();
    }, []);

    return (
        <>
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
                <div className="flex items-center gap-3">
                    <Button className="bg-[#D4AF37] hover:bg-[#b8952b]">
                        Ajouter un utilisateur
                    </Button>
                    <Button
                        variant="outline"
                        className="h-9 pe-3 ps-2.5"
                        onClick={() => setOpenFilters(true)}
                    >
                        <PiFunnel className="me-1.5 h-[18px] w-[18px]" strokeWidth={1.7} />
                        Filtres
                    </Button>
                    <ToggleColumns table={table} />
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <FilterDrawerView
                drawerTitle="Filtres du tableau"
                isOpen={openFilters}
                setOpenDrawer={setOpenFilters}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Title as="h6" className="text-sm font-semibold">
                            Profil
                        </Title>
                        <Select
                            dropdownClassName="!z-[1] h-auto"
                            selectClassName="w-full"
                            placeholder="Tous les profils"
                            options={profileOptions}
                            value={profileFilter}
                            onChange={(value: string) => setProfileFilter(value)}
                            getOptionValue={(option) => option.value}
                            displayValue={(selected) =>
                                profileOptions.find((option) => option.value === selected)?.label ??
                                ''
                            }
                            inPortal={false}
                        />
                    </div>
                    <div className="space-y-2">
                        <Title as="h6" className="text-sm font-semibold">
                            Statut de verrouillage
                        </Title>
                        <Select
                            dropdownClassName="!z-[1] h-auto"
                            selectClassName="w-full"
                            placeholder="Tous"
                            options={lockedOptions}
                            value={lockedFilter}
                            onChange={(value: 'all' | 'locked' | 'unlocked') =>
                                setLockedFilter(value)
                            }
                            getOptionValue={(option) => option.value}
                            displayValue={(selected) =>
                                lockedOptions.find((option) => option.value === selected)?.label ??
                                ''
                            }
                            inPortal={false}
                        />
                    </div>
                </div>
            </FilterDrawerView>

            <Table
                table={table}
                variant="modern"
                classNames={{
                    container: 'border border-muted rounded-md',
                    rowClassName: 'last:border-0',
                }}
            />

            <TablePagination table={table} className="py-4" />
        </>
    );
}
