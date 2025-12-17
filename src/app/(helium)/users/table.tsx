'use client';

import React, { useState } from 'react';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { userListColumns, type UserDataType } from './columns';
import TablePagination from '@core/components/table/pagination';
import { Input, Password, Button, Select, Title, ActionIcon, Text, Badge, Tooltip, type ModalSize } from 'rizzui';
import { PiMagnifyingGlassBold, PiFunnel, PiXBold, PiKeyBold, PiLockKey } from 'react-icons/pi';
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

const USER_DETAILS_QUERY = `
    query User($id: ID!) {
        user(id: $id) {
            id
            email
            displayName
            phone
            personType
            confirmed
            locked
            deleted
            createdAt
            profile {
                label
            }
        }
    }
`;

const UPDATE_USER_MUTATION = `
    mutation UpdateUser($input: updateUserInput!) {
        updateUser(input: $input) {
            user {
                id
                email
                phone
                displayName
                updatedAt
            }
            clientMutationId
        }
    }
`;

const DELETE_USER_MUTATION = `
    mutation DeleteUser($input: deleteUserInput!) {
        deleteUser(input: $input) {
            clientMutationId
        }
    }
`;

const CHANGE_PASSWORD_MUTATION = `
    mutation ChangePassword($input: changePasswordUserInput!) {
        changePasswordUser(input: $input) {
            user {
                id
                email
                displayName
            }
            clientMutationId
        }
    }
`;

const TOGGLE_LOCK_MUTATION = `
    mutation ToggleLock($input: toggleLockUserInput!) {
        toggleLockUser(input: $input) {
            user {
                id
                email
                locked
            }
            clientMutationId
        }
    }
`;

const CREATE_USER_MUTATION = `
    mutation CreateUser($input: createUserInput!) {
        createUser(input: $input) {
            user {
                id
                email
                phone
                displayName
                profile {
                    id
                }
                createdAt
            }
            clientMutationId
        }
    }
`;

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

type UserDetailsViewProps = {
    user: UserDataType;
    onUserUpdated?: (user: UserDataType) => void;
};

type CreateUserFormProps = {
    onCreated: (user: UserDataType) => void;
    onCancel: () => void;
};

function UserDetailsView({ user, onUserUpdated }: UserDetailsViewProps) {
    const { closeModal } = useModal();
    const [details, setDetails] = useState<UserDataType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [isConfirmToggleOpen, setIsConfirmToggleOpen] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [toggleError, setToggleError] = useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        async function fetchDetails() {
            try {
                setDetailsError(null);
                setIsLoading(true);

                const result = await graphqlClient
                    .query(USER_DETAILS_QUERY, { id: user.iri })
                    .toPromise();

                if (result.error) {
                    throw result.error;
                }

                const node = result.data?.user;

                if (!node || !isMounted) {
                    return;
                }

                const iri: string = node.id;
                const parts = iri.split('/');
                const lastPart = parts[parts.length - 1] || iri;
                const displayId = lastPart;

                const nextUser: UserDataType = {
                    iri,
                    id: displayId,
                    displayName: node.displayName ?? '',
                    email: node.email ?? '',
                    phone: node.phone ?? '',
                    personType: node.personType ?? '',
                    isConfirmed: Boolean(node.confirmed),
                    locked: Boolean(node.locked),
                    deleted: Boolean(node.deleted),
                    createdAt: node.createdAt ?? user.createdAt,
                    profile: node.profile?.label ?? '',
                };

                setDetails(nextUser);
            } catch (error: any) {
                console.error(
                    'Erreur lors du chargement du détail utilisateur',
                    error
                );
                const message =
                    error?.message ||
                    'Impossible de charger le détail de cet utilisateur.';
                setDetailsError(message);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchDetails();

        return () => {
            isMounted = false;
        };
    }, [user.iri, user.createdAt]);

    const currentUser = details ?? user;
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    const handleConfirmToggleLock = async () => {
        setToggleError(null);

        try {
            setIsToggling(true);

            const result = await graphqlClient
                .mutation(TOGGLE_LOCK_MUTATION, {
                    input: {
                        id: currentUser.iri,
                    },
                })
                .toPromise();

            if (result.error) {
                throw result.error;
            }

            const node = result.data?.toggleLockUser?.user;

            const nextLocked =
                typeof node?.locked === 'boolean'
                    ? Boolean(node.locked)
                    : !currentUser.locked;

            const updatedUser: UserDataType = {
                ...currentUser,
                locked: nextLocked,
            };

            setDetails(updatedUser);

            if (onUserUpdated) {
                onUserUpdated(updatedUser);
            }

            toast.success(
                nextLocked
                    ? 'Compte verrouillé avec succès.'
                    : 'Compte déverrouillé avec succès.'
            );

            setIsConfirmToggleOpen(false);
        } catch (error: any) {
            console.error(
                "Erreur lors de la mise à jour de l'état de verrouillage",
                error
            );
            const message =
                error?.message ||
                "Impossible de mettre à jour l'état de verrouillage de cet utilisateur.";
            setToggleError(message);
            toast.error(message);
        } finally {
            setIsToggling(false);
        }
    };

    const createdAtDate = new Date(currentUser.createdAt);
    const createdAtDisplay = createdAtDate.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });

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
                    onClick={() => closeModal()}
                    className="p-0 text-gray-500 hover:!text-gray-900"
                >
                    <PiXBold className="h-5 w-5" />
                </ActionIcon>
            </div>
            <div className="space-y-5 px-5 pb-6 pt-5 md:px-7 md:pb-7 md:pt-6">
                {isLoading && (
                    <Text className="text-xs text-gray-500">
                        Chargement des détails de l’utilisateur...
                    </Text>
                )}
                {detailsError && (
                    <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {detailsError}
                    </div>
                )}
                <div className="space-y-6">
                    <div className="flex items-center justify-end gap-2">
                        <Tooltip
                            size="sm"
                            content="Modifier le mot de passe"
                            placement="top"
                            color="invert"
                        >
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsChangePasswordOpen(true)}
                            >
                                <PiKeyBold className="h-4 w-4" />
                            </Button>
                        </Tooltip>
                        <Tooltip
                            size="sm"
                            content={
                                currentUser.locked
                                    ? 'Déverrouiller le compte'
                                    : 'Verrouiller le compte'
                            }
                            placement="top"
                            color="invert"
                        >
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setIsConfirmToggleOpen(true);
                                    setToggleError(null);
                                }}
                            >
                                <PiLockKey className="h-4 w-4" />
                            </Button>
                        </Tooltip>
                    </div>
                    {isConfirmToggleOpen && (
                        <div className="mt-3 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                            <Text className="text-sm font-semibold text-gray-900">
                                {currentUser.locked
                                    ? 'Déverrouiller ce compte ?'
                                    : 'Verrouiller ce compte ?'}
                            </Text>
                            <Text className="text-xs text-gray-600">
                                {currentUser.locked
                                    ? 'L’utilisateur pourra à nouveau se connecter.'
                                    : "L’utilisateur ne pourra plus se connecter tant que le compte est verrouillé."}
                            </Text>
                            {toggleError && (
                                <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                                    {toggleError}
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsConfirmToggleOpen(false);
                                        setToggleError(null);
                                    }}
                                    disabled={isToggling}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-[#D4AF37] hover:bg-[#b8952b]"
                                    onClick={handleConfirmToggleLock}
                                    isLoading={isToggling}
                                    disabled={isToggling}
                                >
                                    Confirmer
                                </Button>
                            </div>
                        </div>
                    )}
                    <ChangePasswordPanel
                        isOpen={isChangePasswordOpen}
                        onClose={() => setIsChangePasswordOpen(false)}
                        user={currentUser}
                    />
                    <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/60 p-4 md:p-5">
                        <Text className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                            Informations générales
                        </Text>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1 md:col-span-2">
                                <Text className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                                    Identifiant
                                </Text>
                                <Text className="truncate font-mono text-sm font-semibold text-gray-900">
                                    {currentUser.id}
                                </Text>
                            </div>
                            <div className="space-y-1">
                                <Text className="text-xs font-medium text-gray-500">
                                    Nom complet
                                </Text>
                                <Text className="text-sm text-gray-900">
                                    {currentUser.displayName || 'N/A'}
                                </Text>
                            </div>
                            <div className="space-y-1">
                                <Text className="text-xs font-medium text-gray-500">
                                    Email
                                </Text>
                                <Text className="text-sm text-gray-900">
                                    {currentUser.email || 'N/A'}
                                </Text>
                            </div>
                            <div className="space-y-1">
                                <Text className="text-xs font-medium text-gray-500">
                                    Téléphone
                                </Text>
                                <Text className="text-sm text-gray-900">
                                    {currentUser.phone || 'N/A'}
                                </Text>
                            </div>
                            <div className="space-y-1">
                                <Text className="text-xs font-medium text-gray-500">
                                    Profil
                                </Text>
                                <Text className="text-sm text-gray-900">
                                    {currentUser.profile || 'N/A'}
                                </Text>
                            </div>
                            <div className="space-y-1">
                                <Text className="text-xs font-medium text-gray-500">
                                    Type de personne
                                </Text>
                                <Text className="text-sm text-gray-900">
                                    {currentUser.personType || 'N/A'}
                                </Text>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-lg border border-gray-100 bg-white p-4 md:p-5">
                        <Text className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                            Statut du compte
                        </Text>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                                <Text className="text-xs font-medium text-gray-500">
                                    Confirmé
                                </Text>
                                <Badge
                                    size="sm"
                                    rounded="pill"
                                    color={currentUser.isConfirmed ? 'success' : 'warning'}
                                    className="px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]"
                                >
                                    {currentUser.isConfirmed ? 'Oui' : 'Non'}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <Text className="text-xs font-medium text-gray-500">
                                    Verrouillé
                                </Text>
                                <Badge
                                    size="sm"
                                    rounded="pill"
                                    color={currentUser.locked ? 'danger' : 'success'}
                                    className="px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]"
                                >
                                    {currentUser.locked ? 'Oui' : 'Non'}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <Text className="text-xs font-medium text-gray-500">
                                    Supprimé
                                </Text>
                                <Badge
                                    size="sm"
                                    rounded="pill"
                                    color={currentUser.deleted ? 'danger' : 'success'}
                                    className="px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]"
                                >
                                    {currentUser.deleted ? 'Oui' : 'Non'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Text className="text-xs font-medium text-gray-500">
                            Date de création
                        </Text>
                        <Text className="text-sm text-gray-900">
                            {createdAtDisplay}
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreateUserForm({ onCreated, onCancel }: CreateUserFormProps) {
    const [email, setEmail] = useState('');
    const [plainPassword, setPlainPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [profile, setProfile] = useState('');
    const [availableProfiles, setAvailableProfiles] = useState<
        { label: string; value: string }[]
    >([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        async function fetchProfiles() {
            try {
                const result = await graphqlClient
                    .query(
                        `
                            query Profiles($page: Int, $itemsPerPage: Int) {
                                profiles(page: $page, itemsPerPage: $itemsPerPage) {
                                    collection {
                                        id
                                        label
                                    }
                                    paginationInfo {
                                        itemsPerPage
                                        lastPage
                                        totalCount
                                        currentPage
                                        hasNextPage
                                    }
                                }
                            }
                        `,
                        {
                            page: 1,
                            itemsPerPage: 100,
                        }
                    )
                    .toPromise();

                if (result.error) {
                    throw result.error;
                }

                const collection = result.data?.profiles?.collection ?? [];

                const options = collection
                    .filter((item: any) => item && item.id && item.label)
                    .map((item: any) => ({
                        label: item.label as string,
                        value: item.id as string,
                    }));

                setAvailableProfiles(options);
            } catch (error) {
                console.error('Erreur lors du chargement des profils', error);
            }
        }

        fetchProfiles();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!email || !plainPassword || !confirmPassword || !displayName) {
            setError('Email, mot de passe et nom complet sont obligatoires.');
            return;
        }

        if (plainPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        try {
            setIsSubmitting(true);

            const clientMutationId = `create-user-${Date.now()}`;

            const result = await graphqlClient
                .mutation(CREATE_USER_MUTATION, {
                    input: {
                        email,
                        plainPassword,
                        phone,
                        displayName,
                        profile,
                        clientMutationId,
                    },
                })
                .toPromise();

            if (result.error) {
                throw result.error;
            }

            const node = result.data?.createUser?.user;

            if (!node) {
                throw new Error("La réponse de l'API ne contient pas l'utilisateur créé.");
            }

            const iri: string = node.id;
            const parts = iri.split('/');
            const lastPart = parts[parts.length - 1] || iri;
            const displayId = lastPart;

            const selectedProfileLabel =
                availableProfiles.find((option) => option.value === profile)?.label ??
                '';

            const createdUser: UserDataType = {
                iri,
                id: displayId,
                displayName: node.displayName ?? displayName,
                email: node.email ?? email,
                phone: node.phone ?? phone,
                personType: '',
                isConfirmed: true,
                locked: false,
                deleted: false,
                createdAt: node.createdAt ?? new Date().toISOString(),
                profile: selectedProfileLabel,
            };

            onCreated(createdUser);
            toast.success('Utilisateur créé avec succès.');
        } catch (error: any) {
            console.error("Erreur lors de la création de l'utilisateur", error);
            const message =
                error?.message ||
                "Impossible de créer l'utilisateur. Veuillez vérifier les informations saisies.";
            setError(message);
            toast.error(message);
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
                    Ajouter un utilisateur
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
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2">
                        <Input
                            type="email"
                            label="Email"
                            labelClassName="font-medium text-gray-1000 dark:text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@exemple.com"
                            required
                        />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <Input
                            label="Nom complet"
                            labelClassName="font-medium text-gray-1000 dark:text-white"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Nom et prénom"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Password
                            label="Mot de passe"
                            labelClassName="font-medium text-gray-1000 dark:text-white"
                            value={plainPassword}
                            onChange={(e) => setPlainPassword(e.target.value)}
                            placeholder="Mot de passe"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <Password
                            label="Confirmer le mot de passe"
                            labelClassName="font-medium text-gray-1000 dark:text-white"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmer le mot de passe"
                            required
                        />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <Input
                            label="Téléphone"
                            labelClassName="font-medium text-gray-1000 dark:text-white"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+33 6 12 34 56 78"
                        />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <Select
                            label="Profil"
                            placeholder="Sélectionner un profil"
                            dropdownClassName="!z-[1] h-auto"
                            selectClassName="w-full"
                            options={availableProfiles}
                            value={profile}
                            onChange={(value: string) => setProfile(value)}
                            getOptionValue={(option) => option.value}
                            displayValue={(selected) =>
                                availableProfiles.find(
                                    (option) => option.value === selected
                                )?.label ?? ''
                            }
                            inPortal={false}
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
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
                        Créer
                    </Button>
                </div>
            </form>
        </div>
    );
}

type ChangePasswordPanelProps = {
    isOpen: boolean;
    onClose: () => void;
    user: UserDataType;
};

function ChangePasswordPanel({ isOpen, onClose, user }: ChangePasswordPanelProps) {
    const [actualPassword, setActualPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!actualPassword || !newPassword || !confirmPassword) {
            setError('Tous les champs sont obligatoires.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        try {
            setIsSubmitting(true);

            const result = await graphqlClient
                .mutation(CHANGE_PASSWORD_MUTATION, {
                    input: {
                        id: user.iri,
                        actualPassword,
                        newPassword,
                    },
                })
                .toPromise();

            if (result.error) {
                throw result.error;
            }

            toast.success('Mot de passe mis à jour avec succès.');
            setActualPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (error: any) {
            console.error('Erreur lors du changement de mot de passe', error);
            const message =
                error?.message ||
                'Impossible de changer le mot de passe pour cet utilisateur.';
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 md:p-5">
            <div className="flex items-center justify-between">
                <Title as="h4" className="text-sm font-semibold">
                    Modifier le mot de passe
                </Title>
                <ActionIcon
                    size="sm"
                    variant="text"
                    onClick={onClose}
                    className="p-0 text-gray-500 hover:!text-gray-900"
                >
                    <PiXBold className="h-5 w-5" />
                </ActionIcon>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Text className="text-xs text-gray-500">
                    Saisissez le mot de passe actuel et le nouveau mot de passe pour cet
                    utilisateur.
                </Text>
                <div className="space-y-3">
                    <Password
                        label="Mot de passe actuel"
                        labelClassName="font-medium text-gray-1000 dark:text-white"
                        value={actualPassword}
                        onChange={(e) => setActualPassword(e.target.value)}
                        placeholder="Mot de passe actuel"
                        required
                    />
                    <Password
                        label="Nouveau mot de passe"
                        labelClassName="font-medium text-gray-1000 dark:text-white"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nouveau mot de passe"
                        required
                    />
                    <Password
                        label="Confirmer le nouveau mot de passe"
                        labelClassName="font-medium text-gray-1000 dark:text-white"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmez le nouveau mot de passe"
                        required
                    />
                </div>
                {error && (
                    <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {error}
                    </div>
                )}
                <div className="flex justify-end gap-3 pt-1">
                    <Button variant="outline" type="button" onClick={onClose}>
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

    React.useEffect(() => {
        let isMounted = true;

        async function fetchDetailsForEdit() {
            try {
                const result = await graphqlClient
                    .query(USER_DETAILS_QUERY, { id: user.iri })
                    .toPromise();

                if (result.error) {
                    throw result.error;
                }

                const node = result.data?.user;

                if (!node || !isMounted) {
                    return;
                }

                const iri: string = node.id;
                const parts = iri.split('/');
                const lastPart = parts[parts.length - 1] || iri;
                const displayId = lastPart;

                const nextUser: UserDataType = {
                    iri,
                    id: displayId,
                    displayName: node.displayName ?? '',
                    email: node.email ?? '',
                    phone: node.phone ?? '',
                    personType: node.personType ?? '',
                    isConfirmed: Boolean(node.confirmed),
                    locked: Boolean(node.locked),
                    deleted: Boolean(node.deleted),
                    createdAt: node.createdAt ?? user.createdAt,
                    profile: node.profile?.label ?? '',
                };

                setFormData(nextUser);
            } catch (error) {
            } finally {
                if (!isMounted) {
                }
            }
        }

        fetchDetailsForEdit();

        return () => {
            isMounted = false;
        };
    }, [user.iri, user.createdAt]);

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
                            {formData.id}
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

    const profileOptions = React.useMemo(
        () => {
            const labels = Array.from(
                new Set(
                    rawUsers
                        .map((user) => user.profile)
                        .filter((profile): profile is string => Boolean(profile))
                )
            );

            return [
                { label: 'Tous les profils', value: '' },
                ...labels.map((label) => ({ label, value: label })),
            ];
        },
        [rawUsers]
    );

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
                handleViewUser: (user: UserDataType) => {
                    openModal({
                        view: (
                            <UserDetailsView
                                user={user}
                                onUserUpdated={(updatedUser) => {
                                    setRawUsers((prev) =>
                                        prev.map((u) =>
                                            u.iri === updatedUser.iri ? updatedUser : u
                                        )
                                    );
                                }}
                            />
                        ),
                        size: 'lg' as ModalSize,
                    });
                },
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
                                                input: {
                                                    id: updatedUser.iri,
                                                    email: updatedUser.email,
                                                    phone: updatedUser.phone,
                                                    displayName: updatedUser.displayName,
                                                },
                                            })
                                            .toPromise();

                                        if (result.error) {
                                            throw result.error;
                                        }

                                        const node = result.data?.updateUser?.user;

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
                                                      phone: node.phone ?? updatedUser.phone,
                                                      personType: updatedUser.personType,
                                                      isConfirmed: updatedUser.isConfirmed,
                                                      locked: updatedUser.locked,
                                                      deleted: updatedUser.deleted,
                                                      createdAt: updatedUser.createdAt,
                                                      profile: updatedUser.profile,
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
                handleDeleteUser: async (user: UserDataType) => {
                    try {
                        setError(null);

                        const result = await graphqlClient
                            .mutation(DELETE_USER_MUTATION, {
                                input: {
                                    id: user.iri,
                                    clientMutationId: '',
                                },
                            })
                            .toPromise();

                        if (result.error) {
                            throw result.error;
                        }

                        setRawUsers((prev) =>
                            prev.map((u) =>
                                u.iri === user.iri ? { ...u, deleted: true } : u
                            )
                        );

                        toast.success('Utilisateur supprimé avec succès.');
                    } catch (error: any) {
                        console.error(
                            'Erreur lors de la suppression de l’utilisateur',
                            error
                        );
                        const message =
                            error?.message ||
                            'Impossible de supprimer cet utilisateur.';
                        setError(message);
                        toast.error(message);
                    }
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
                    <Button
                        className="bg-[#D4AF37] hover:bg-[#b8952b]"
                        onClick={() =>
                            openModal({
                                view: (
                                    <CreateUserForm
                                        onCreated={(user) => {
                                            setRawUsers((prev) => [...prev, user]);
                                            closeModal();
                                        }}
                                        onCancel={closeModal}
                                    />
                                ),
                                size: 'lg' as ModalSize,
                            })
                        }
                    >
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
