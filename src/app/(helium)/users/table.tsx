'use client';

import React, { useState } from 'react';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { userListColumns, type UserDataType } from './columns';
import TablePagination from '@core/components/table/pagination';
import { Input, Button, Select, Title, ActionIcon, Text, type ModalSize } from 'rizzui';
import { PiMagnifyingGlassBold, PiFunnel, PiXBold } from 'react-icons/pi';
import { FilterDrawerView } from '@core/components/controlled-table/table-filter';
import ToggleColumns from '@core/components/table-utils/toggle-columns';
import { graphqlClient } from '@/lib/graphql-client';
import { useModal } from '@/app/shared/modal-views/use-modal';
import toast from 'react-hot-toast';

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

const UPDATE_USER_MUTATION = `
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
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

type UserEditFormProps = {
    user: UserDataType;
    onSave: (user: UserDataType) => Promise<void>;
    onCancel: () => void;
};

function UserEditForm({ user, onSave, onCancel }: UserEditFormProps) {
    const [formData, setFormData] = useState<UserDataType>(user);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleChange = (field: keyof UserDataType, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            await onSave(formData);
        } catch (error: any) {
            const message =
                error?.message ||
                'Une erreur est survenue lors de la mise à jour de l’utilisateur.';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="block">
            <div className="flex items-center justify-between border-b border-gray-200 p-5 md:p-7">
                <Title
                    as="h3"
                    className="font-lexend text-lg font-semibold md:text-xl"
                >
                    Détails de l’utilisateur
                </Title>
                <ActionIcon
                    size="sm"
                    variant="text"
                    onClick={onCancel}
                    className="p-0 text-gray-500 hover:!text-gray-900"
                >
                    <PiXBold className="h-5 w-5" />
                </ActionIcon>
            </div>
            <form
                onSubmit={handleSubmit}
                className="space-y-6 px-5 pb-6 pt-5 md:px-7 md:pb-7 md:pt-6"
            >
                <div className="space-y-1">
                    <Title as="h4" className="text-base font-semibold">
                        Informations de contact
                    </Title>
                    <Text className="text-xs text-gray-500">
                        Modifie les informations principales de cet utilisateur.
                    </Text>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2">
                        <Text className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                            Identifiant
                        </Text>
                        <Text className="truncate text-sm font-medium text-gray-900">
                            {user.id}
                        </Text>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <Input
                            label="Nom complet"
                            labelClassName="font-medium text-gray-1000 dark:text-white"
                            value={formData.displayName}
                            onChange={(e) =>
                                handleChange('displayName', e.target.value)
                            }
                            placeholder="Nom et prénom"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Input
                            type="email"
                            label="Email"
                            labelClassName="font-medium text-gray-1000 dark:text-white"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="email@exemple.com"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Input
                            label="Téléphone"
                            labelClassName="font-medium text-gray-1000 dark:text-white"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="+33 6 12 34 56 78"
                        />
                    </div>
                </div>

                {submitError && (
                    <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {submitError}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-1">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        className="bg-[#D4AF37] hover:bg-[#b8952b]"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        Enregistrer
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function UserListTable() {
    const [rawUsers, setRawUsers] = useState<UserDataType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [profileFilter, setProfileFilter] = useState('');
    const [lockedFilter, setLockedFilter] = useState<'all' | 'locked' | 'unlocked'>('all');
    const [openFilters, setOpenFilters] = useState(false);
    const { openModal, closeModal } = useModal();

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
            meta: {
                handleEditUser: (user: UserDataType) => {
                    openModal({
                        view: (
                            <UserEditForm
                                user={user}
                                onSave={async (updatedUser) => {
                                    try {
                                        setError(null);

                                        const result = await graphqlClient
                                            .mutation(UPDATE_USER_MUTATION, {
                                                id: updatedUser.iri,
                                                input: {
                                                    email: updatedUser.email,
                                                    displayName: updatedUser.displayName,
                                                    phone: updatedUser.phone,
                                                },
                                            })
                                            .toPromise();

                                        if (result.error) {
                                            throw result.error;
                                        }

                                        const node = result.data?.updateUser;

                                        const nextUser: UserDataType = node
                                            ? (() => {
                                                  const nextIri: string = node.id;
                                                  const nextParts = nextIri.split('/');
                                                  const nextLast =
                                                      nextParts[nextParts.length - 1] ||
                                                      nextIri;
                                                  const nextDisplayId = nextLast;
                                                  return {
                                                      iri: nextIri,
                                                      id: nextDisplayId,
                                                      displayName:
                                                          node.displayName ?? '',
                                                      email: node.email ?? '',
                                                      phone: updatedUser.phone,
                                                      personType: updatedUser.personType,
                                                      isConfirmed: updatedUser.isConfirmed,
                                                      locked: Boolean(node.locked),
                                                      deleted: Boolean(node.deleted),
                                                      createdAt:
                                                          node.createdAt ??
                                                          updatedUser.createdAt,
                                                      profile:
                                                          node.profile?.label ??
                                                          updatedUser.profile,
                                                  };
                                              })()
                                            : updatedUser;

                                        setRawUsers((prev) =>
                                            prev.map((u) =>
                                                u.id === nextUser.id ? nextUser : u
                                            )
                                        );

                                        toast.success('Utilisateur mis à jour avec succès.');
                                        closeModal();
                                    } catch (error: any) {
                                        console.error(
                                            'Erreur lors de la mise à jour de l’utilisateur',
                                            error
                                        );
                                        const message =
                                            error?.message ||
                                            'Impossible de mettre à jour cet utilisateur.';
                                        setError(message);
                                        toast.error(message);
                                        throw new Error(message);
                                    }
                                }}
                                onCancel={closeModal}
                            />
                        ),
                        size: 'lg' as ModalSize,
                    });
                },
            },
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
                        const iri: string = node.id;
                        const parts = iri.split('/');
                        const lastPart = parts[parts.length - 1] || iri;
                        const displayId = lastPart;
                        return {
                            iri,
                            id: displayId,
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
