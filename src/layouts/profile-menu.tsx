"use client";

import { Title, Text, Avatar, Button, Popover } from "rizzui";
import cn from "@core/utils/class-names";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { graphqlClient } from "@/lib/graphql-client";
import { GET_CURRENT_USER_QUERY } from "@/graphql/auth.graphql";

const USER_BY_EMAIL_QUERY = `
  query UserByEmail($email: String) {
    users(first: 1, email: $email) {
      edges {
        node {
          id
          email
          displayName
        }
      }
      totalCount
    }
  }
`;

type CurrentUser = {
  id: string;
  email: string;
  username: string;
};

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
  username = false,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
  username?: boolean;
}) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [displayName, setDisplayName] = useState<string>("Utilisateur");
  const { data: session } = useSession();

  useEffect(() => {
    let isMounted = true;

    async function fetchCurrentUser() {
      try {
        const result = await graphqlClient
          .query(GET_CURRENT_USER_QUERY, {})
          .toPromise();

        if (result.error) {
          console.error("GET_CURRENT_USER_QUERY error", result.error);
          return;
        }

        const me = result.data?.me;

        if (!me || !isMounted) {
          return;
        }

        setCurrentUser({
          id: me.id,
          email: me.email,
          username: me.username,
        });
      } catch (error) {
        console.error("Error while fetching current user", error);
      } finally {
        if (!isMounted) {
        }
      }
    }

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const sessionEmail = session?.user?.email || "";

  const rawEmail = currentUser?.email || sessionEmail || "";

  useEffect(() => {
    let isMounted = true;

    async function fetchDisplayName() {
      if (!rawEmail) {
        if (isMounted) {
          setDisplayName("Utilisateur");
        }
        return;
      }

      try {
        const result = await graphqlClient
          .query(USER_BY_EMAIL_QUERY, { email: rawEmail })
          .toPromise();

        if (result.error) {
          console.error("USER_BY_EMAIL_QUERY error", result.error);
          return;
        }

        const node = result.data?.users?.edges?.[0]?.node;

        if (node?.displayName && isMounted) {
          setDisplayName(node.displayName);
        } else if (isMounted) {
          setDisplayName("Utilisateur");
        }
      } catch (error) {
        console.error("Error while fetching display name", error);
      }
    }

    fetchDisplayName();

    return () => {
      isMounted = false;
    };
  }, [rawEmail]);

  const displayEmail = rawEmail;

  return (
    <ProfileMenuPopover>
      <Popover.Trigger>
        <button
          className={cn(
            "w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10",
            buttonClassName
          )}
        >
          <Avatar
            src="https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp"
            name={displayName}
            className={cn("!h-9 w-9 sm:!h-10 sm:!w-10", avatarClassName)}
          />
          {!!username && (
            <span className="username hidden text-gray-200 dark:text-gray-700 md:inline-flex">
              Bonjour, {displayName}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Content className="z-[9999] p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100">
        <DropdownMenu name={displayName} email={displayEmail} />
      </Popover.Content>
    </ProfileMenuPopover>
  );
}

function ProfileMenuPopover({ children }: React.PropsWithChildren<{}>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      {children}
    </Popover>
  );
}

type DropdownMenuProps = {
  name: string;
  email: string;
};

function DropdownMenu({ name, email }: DropdownMenuProps) {
  return (
    <div className="w-64 text-left rtl:text-right">
      <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
        <Avatar
          src="https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp"
          name={name}
        />
        <div className="ms-3">
          <Title
            as="h6"
            className="font-semibold"
          >
            {name}
          </Title>
          {email && <Text className="text-gray-600">{email}</Text>}
        </div>
      </div>

      <div className="border-t border-gray-300 px-6 pb-6 pt-5">
        <Button
          className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0"
          variant="text"
          onClick={() => signOut()}
        >
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
