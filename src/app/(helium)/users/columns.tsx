'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Text, Badge, ActionIcon, Tooltip } from 'rizzui';
import DateCell from '@core/ui/date-cell';
import { PiLockKey } from 'react-icons/pi';
import PencilIcon from '@core/components/icons/pencil';
import DeletePopover from '@core/components/delete-popover';

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
        cell: ({ row }) => {
            const iri = row.original.id;
            const shortId = iri.split('/').pop() ?? iri;
            return (
                <Text className="text-sm font-medium">{shortId}</Text>
            );
        },
    }),
    columnHelper.accessor('displayName', {
        id: 'displayName',
        size: 200,
        header: 'Nom',
        cell: ({ row }) => (
            <Text className="text-sm font-semibold text-gray-900 dark:text-gray-700">
                {row.original.displayName || 'N/A'}
            </Text>
        ),
    }),
    columnHelper.accessor('email', {
        id: 'email',
        size: 250,
        header: 'Email',
        cell: ({ row }) => (
            <Text className="text-sm text-gray-600">
                {row.original.email || 'N/A'}
            </Text>
        ),
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
                {row.original.profile || 'N/A'}
            </Badge>
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
    columnHelper.accessor('createdAt', {
        id: 'createdAt',
        size: 180,
        header: 'Date de création',
        cell: ({ row }) => (
            <DateCell
                date={new Date(row.original.createdAt)}
                dateFormat="DD/MM/YYYY"
                timeFormat="HH:mm"
            />
        ),
    }),
    columnHelper.display({
        id: 'actions',
        size: 140,
        header: 'Actions',
        cell: ({ row }) => (
            <div className="flex items-center justify-end gap-3 pe-4">
                <Tooltip
                    size="sm"
                    content="Modifier l’utilisateur"
                    placement="top"
                    color="invert"
                >
                    <ActionIcon size="sm" variant="outline">
                        <PencilIcon className="h-4 w-4" />
                    </ActionIcon>
                </Tooltip>
                <DeletePopover
                    title="Supprimer l’utilisateur"
                    description={`Voulez-vous vraiment supprimer l’utilisateur #${
                        row.original.id.split('/').pop() ?? row.original.id
                    } ?`}
                    onDelete={() => {}}
                />
            </div>
        ),
    }),
];
