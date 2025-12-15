'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

function AuthTokenSync({ children }: { children: React.ReactNode }) {
  const { data } = useSession();
  const accessToken =
    (data?.user as any)?.accessToken as string | undefined;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
    }
  }, [accessToken]);

  return <>{children}</>;
}

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}): React.ReactNode {
  return (
    <SessionProvider session={session}>
      <AuthTokenSync>{children}</AuthTokenSync>
    </SessionProvider>
  );
}
