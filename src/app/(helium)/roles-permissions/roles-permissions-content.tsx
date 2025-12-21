'use client';

import { useEffect, useState } from 'react';
import { Title, Button, Input, ActionIcon, Dropdown } from 'rizzui';
import Breadcrumb from '@core/ui/breadcrumb';
import { PiPlusBold, PiMagnifyingGlassBold, PiDotsThreeBold, PiXBold } from 'react-icons/pi';
import { graphqlClient } from '@/lib/graphql-client';
import { useModal } from '@/app/shared/modal-views/use-modal';

const PROFILES_QUERY = `
  query Profiles($page: Int, $itemsPerPage: Int) {
    profiles(page: $page, itemsPerPage: $itemsPerPage) {
      collection {
        id
        _id
        label
        personType
        active
        permission
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
`;

const PERMISSIONS_QUERY = `
  query Permissions($page: Int, $itemsPerPage: Int) {
    permissions(page: $page, itemsPerPage: $itemsPerPage) {
      collection {
        id
        role
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
`;

const PROFILE_BY_ID_QUERY = `
  query ProfileById($id: ID!) {
    profile(id: $id) {
      id
      _id
      label
      personType
      permission
      active
      createdAt
      updatedAt
    }
  }
`;

const permissionLabelMap: { [key: string]: string } = {
    ROLE_USER_DETAILS: "Consulter les détails d'un utilisateur .....",
};

type ProfileNode = {
    id?: string;
    _id?: string;
    label?: string;
    personType?: string;
    active?: boolean;
    permission?: any;
};

type RoleCard = {
    id: string;
    name: string;
    permissionsCount: number;
    color: string;
};

const roleColors = ['#2465FF', '#F5A623', '#11A849', '#8B5CF6', '#EC4899'];

type ProfileDetails = {
    id: string;
    label?: string;
    personType?: string;
    permission?: any;
};

export default function RolesPermissionsContent() {
    const pageHeader = {
        title: 'Rôles & permissions',
        breadcrumb: [
            {
                href: '/',
                name: 'Tableau de bord',
            },
            {
                name: 'Utilisateurs & rôles',
            },
            {
                name: 'Rôles & permissions',
            },
        ],
    };

    const [roles, setRoles] = useState<RoleCard[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { openModal } = useModal();

    useEffect(() => {
        let isMounted = true;

        async function fetchProfiles() {
            try {
                setError(null);
                setIsLoading(true);

                const result = await graphqlClient
                    .query(PROFILES_QUERY, { page: 1, itemsPerPage: 20 })
                    .toPromise();

                if (result.error) {
                    throw result.error;
                }

                const collection: ProfileNode[] = result.data?.profiles?.collection ?? [];

                if (!isMounted) {
                    return;
                }

                const nextRoles: RoleCard[] = collection.map((item: ProfileNode, index: number) => {
                    const permissionsValue = (item as any).permission;

                    let permissionsCount = 0;

                    if (Array.isArray(permissionsValue)) {
                        permissionsCount = permissionsValue.length;
                    } else if (typeof permissionsValue === 'number') {
                        permissionsCount = permissionsValue;
                    } else if (
                        permissionsValue &&
                        typeof permissionsValue === 'object' &&
                        'length' in permissionsValue
                    ) {
                        permissionsCount = (permissionsValue as { length?: number }).length ?? 0;
                    }

                    const id = item.id || item._id || `${index}-${item.label || 'profil'}`;

                    return {
                        id,
                        name: item.label || 'Profil',
                        permissionsCount,
                        color: roleColors[index % roleColors.length],
                    };
                });

                setRoles(nextRoles);
            } catch (e) {
                console.error('Error while fetching profiles', e);
                if (isMounted) {
                    setError('Impossible de charger les profils');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchProfiles();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="@container">
            <header className="mb-6 @container xs:-mt-2 lg:mb-7">
                <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between">
                    <div>
                        <Title
                            as="h2"
                            className="mb-2 text-[22px] lg:text-2xl 4xl:text-[26px]"
                        >
                            {pageHeader.title}
                        </Title>
                        <Breadcrumb
                            separator=""
                            separatorVariant="circle"
                            className="flex-wrap"
                        >
                            {pageHeader.breadcrumb.map((item) => (
                                <Breadcrumb.Item
                                    key={item.name}
                                    {...(item.href && { href: item.href })}
                                >
                                    {item.name}
                                </Breadcrumb.Item>
                            ))}
                        </Breadcrumb>
                    </div>
                    <Button
                        size="sm"
                        className="mt-5 w-full text-xs capitalize @lg:w-auto sm:text-sm lg:mt-0"
                    >
                        <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
                        Ajouter un rôle
                    </Button>
                </div>
            </header>

            <section className="space-y-6">
                <div className="flex justify-start">
                    <Input
                        type="search"
                        placeholder="Rechercher un rôle..."
                        className="w-full @lg:max-w-sm"
                        inputClassName="shadow-sm"
                        prefix={<PiMagnifyingGlassBold className="h-auto w-4" />}
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                {isLoading && roles.length === 0 && !error && (
                    <p className="text-sm text-gray-500">Chargement des profils...</p>
                )}

                {!isLoading && roles.length === 0 && !error && (
                    <p className="text-sm text-gray-500">Aucun profil trouvé.</p>
                )}

                <div className="grid grid-cols-1 gap-6 @[36.65rem]:grid-cols-2 @[56rem]:grid-cols-3 @[78.5rem]:grid-cols-4 @[100rem]:grid-cols-5">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="flex flex-col justify-between rounded-lg border border-muted bg-white p-6 shadow-sm dark:bg-gray-50"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="grid h-10 w-10 place-content-center rounded-lg text-white"
                                            style={{
                                                backgroundColor: role.color,
                                            }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <path
                                                    d="M7 6.5H16.75C18.8567 6.5 19.91 6.5 20.6667 7.00559C20.9943 7.22447 21.2755 7.50572 21.4944 7.83329C21.935 8.49268 21.9916 8.96506 21.9989 10.5M12 6.5L11.3666 5.23313C10.8418 4.18358 10.3622 3.12712 9.19926 2.69101C8.6899 2.5 8.10802 2.5 6.94427 2.5C5.1278 2.5 4.21956 2.5 3.53806 2.88032C3.05227 3.15142 2.65142 3.55227 2.38032 4.03806C2 4.71956 2 5.6278 2 7.44427V10.5C2 15.214 2 17.5711 3.46447 19.0355C4.8215 20.3926 6.44493 20.4927 10.5 20.5H11"
                                                    stroke="currentColor"
                                                    strokeWidth="1.3"
                                                    strokeLinecap="round"
                                                />
                                                <path
                                                    d="M15.59 18.9736C14.9612 19.3001 13.3126 19.9668 14.3167 20.801C14.8072 21.2085 15.3536 21.4999 16.0404 21.4999H19.9596C20.6464 21.4999 21.1928 21.2085 21.6833 20.801C22.6874 19.9668 21.0388 19.3001 20.41 18.9736C18.9355 18.208 17.0645 18.208 15.59 18.9736Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.3"
                                                />
                                                <path
                                                    d="M20 14.4378C20 15.508 19.1046 16.3756 18 16.3756C16.8954 16.3756 16 15.508 16 14.4378C16 13.3676 16.8954 12.5 18 12.5C19.1046 12.5 20 13.3676 20 14.4378Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.3"
                                                />
                                            </svg>
                                        </span>
                                        <Title
                                            as="h3"
                                            className="text-base font-semibold text-gray-900"
                                        >
                                            {role.name}
                                        </Title>
                                    </div>
                                    <Dropdown placement="bottom-end" className="ml-auto">
                                        <Dropdown.Trigger>
                                            <ActionIcon
                                                as="span"
                                                variant="text"
                                                className="h-auto w-auto p-1"
                                            >
                                                <PiDotsThreeBold className="h-5 w-5" />
                                            </ActionIcon>
                                        </Dropdown.Trigger>
                                        <Dropdown.Menu className="!z-10">
                                            <Dropdown.Item className="text-xs sm:text-sm">
                                                Modifier
                                            </Dropdown.Item>
                                            <Dropdown.Item className="text-xs sm:text-sm">
                                                Voir détails
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase text-gray-600">
                                    {role.permissionsCount} PERMISSIONS
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        openModal({
                                            view: <EditRole profileId={role.id} />,
                                            customSize: '700px',
                                            size: 'xl',
                                        })
                                    }
                                >
                                    Gérer les permissions
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function EditRole({ profileId }: { profileId: string }) {
    const { closeModal } = useModal();
    const [profile, setProfile] = useState<ProfileDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [permissionLabels, setPermissionLabels] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        let isMounted = true;

        async function fetchProfile() {
            try {
                setError(null);
                setIsLoading(true);

                const [profileResult, permissionsResult] = await Promise.all([
                    graphqlClient
                        .query(PROFILE_BY_ID_QUERY, { id: profileId })
                        .toPromise(),
                    graphqlClient
                        .query(PERMISSIONS_QUERY, { page: 1, itemsPerPage: 100 })
                        .toPromise(),
                ]);

                if (profileResult.error) {
                    throw profileResult.error;
                }

                if (permissionsResult.error) {
                    throw permissionsResult.error;
                }

                const profileNode = profileResult.data?.profile;

                if (!profileNode || !isMounted) {
                    return;
                }

                setProfile({
                    id: profileNode.id,
                    label: profileNode.label,
                    personType: profileNode.personType,
                    permission: profileNode.permission,
                });

                const permissionsCollection: any[] =
                    permissionsResult.data?.permissions?.collection ?? [];

                const labels: { [key: string]: string } = {};

                permissionsCollection.forEach((item) => {
                    if (item?.role) {
                        labels[String(item.role)] = item.label ?? String(item.role);
                    }
                });

                if (isMounted) {
                    setPermissionLabels(labels);
                }
            } catch (e) {
                console.error('Error while fetching profile by id', e);
                if (isMounted) {
                    setError('Impossible de charger les permissions');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [profileId]);

    let permissions: string[] = [];

    if (Array.isArray(profile?.permission)) {
        permissions = (profile?.permission as any[]).map((p) => String(p));
    } else if (profile?.permission != null) {
        permissions = [String(profile.permission)];
    }

    return (
        <div className="grid grid-cols-1 gap-6 p-6 @container">
            <div className="col-span-full flex items-center justify-between">
                <Title as="h4" className="font-semibold">
                    Modifier les permissions
                </Title>
                <ActionIcon size="sm" variant="text" onClick={closeModal}>
                    <PiXBold className="h-auto w-5" />
                </ActionIcon>
            </div>

            <div className="grid gap-4 divide-y divide-y-reverse divide-gray-200">
                {isLoading && (
                    <div className="py-4 text-sm text-gray-500">
                        Chargement des permissions...
                    </div>
                )}

                {!isLoading && error && (
                    <div className="py-4 text-sm text-red-500">{error}</div>
                )}

                {!isLoading && !error && (
                    <div className="py-4 space-y-2">
                        {permissions.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                Aucune permission définie pour ce profil.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {permissions.map((permission) => (
                                    <span
                                        key={permission}
                                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                                    >
                                        {permissionLabels[permission] ??
                                            permissionLabelMap[permission] ??
                                            permission}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="col-span-full flex items-center justify-end gap-4">
                <Button
                    variant="outline"
                    onClick={closeModal}
                    className="w-full @xl:w-auto"
                >
                    Fermer
                </Button>
            </div>
        </div>
    );
}
