'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Text, Badge } from 'rizzui';
import DateCell from '@core/ui/date-cell';
import { PiCheckCircle, PiXCircle, PiLockKey, PiTrash } from 'react-icons/pi';

export interface UserDataType {
    id: string;
    displayName: string;
    email: string;
    phone: string;
    personType: string;
    isConfirmed: boolean;
    locked: boolean;
    deleted: boolean;
    createdAt: string;
    profile: string;
}

const columnHelper = createColumnHelper<UserDataType>();

export const userListColumns = [
    columnHelper.accessor('id', {
        id: 'id',
        size: 80,
        header: 'ID',
        cell: ({ row }) => (
            <Text className="text-sm font-medium">#{row.original.id}</Text>
        ),
    }),
    columnHelper.accessor('displayName', {
        id: 'displayName',
        size: 200,
        header: 'Nom',
        cell: ({ row }) => (
            <Text className="text-sm font-semibold text-gray-900 dark:text-gray-700">
                {row.original.displayName}
            </Text>
        ),
    }),
    columnHelper.accessor('email', {
        id: 'email',
        size: 250,
        header: 'Email',
        cell: ({ row }) => (
            <Text className="text-sm text-gray-600">
                {row.original.email}
            </Text>
        ),
    }),
    columnHelper.accessor('phone', {
        id: 'phone',
        size: 180,
        header: 'Téléphone',
        cell: ({ row }) => (
            <Text className="text-sm text-gray-600">
                {row.original.phone}
            </Text>
        ),
    }),
    columnHelper.accessor('personType', {
        id: 'personType',
        size: 150,
        header: 'Type',
        cell: ({ row }) => (
            <Badge
                variant="flat"
                color={
                    row.original.personType === 'Manager'
                        ? 'info'
                        : row.original.personType === 'Consultant'
                            ? 'warning'
                            : 'secondary'
                }
                className="font-medium"
            >
                {row.original.personType}
            </Badge>
        ),
    }),
    columnHelper.accessor('isConfirmed', {
        id: 'isConfirmed',
        size: 120,
        header: 'Confirmé',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                {row.original.isConfirmed ? (
                    <>
                        <PiCheckCircle className="h-5 w-5 text-green-600" />
                        <Text className="text-sm">Oui</Text>
                    </>
                ) : (
                    <>
                        <PiXCircle className="h-5 w-5 text-red-600" />
                        <Text className="text-sm">Non</Text>
                    </>
                )}
            </div>
        ),
    }),
    columnHelper.accessor('locked', {
        id: 'locked',
        size: 120,
        header: 'Verrouillé',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                {row.original.locked ? (
                    <>
                        <PiLockKey className="h-5 w-5 text-orange-600" />
                        <Text className="text-sm">Oui</Text>
                    </>
                ) : (
                    <Text className="text-sm text-gray-500">Non</Text>
                )}
            </div>
        ),
    }),
    columnHelper.accessor('deleted', {
        id: 'deleted',
        size: 120,
        header: 'Supprimé',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                {row.original.deleted ? (
                    <>
                        <PiTrash className="h-5 w-5 text-red-600" />
                        <Text className="text-sm">Oui</Text>
                    </>
                ) : (
                    <Text className="text-sm text-gray-500">Non</Text>
                )}
            </div>
        ),
    }),
    columnHelper.accessor('createdAt', {
        id: 'createdAt',
        size: 180,
        header: 'Date de création',
        cell: ({ row }) => <DateCell date={new Date(row.original.createdAt)} />,
    }),
    columnHelper.accessor('profile', {
        id: 'profile',
        size: 150,
        header: 'Profil',
        cell: ({ row }) => (
            <Badge
                variant="flat"
                color={
                    row.original.profile === 'Administrateur'
                        ? 'danger'
                        : row.original.profile === 'Gestionnaire'
                            ? 'success'
                            : 'primary'
                }
                className="font-medium"
            >
                {row.original.profile}
            </Badge>
        ),
    }),
];
