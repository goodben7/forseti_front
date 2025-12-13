import type { Metadata } from "next";
import { inter, lexendDeca } from "@/app/fonts";
import cn from "@core/utils/class-names";
import NextProgress from "@core/components/next-progress";
import { ThemeProvider, JotaiProvider } from "@/app/shared/theme-provider";
import GlobalDrawer from "@/app/shared/drawer-views/container";
import GlobalModal from "@/app/shared/modal-views/container";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import AuthProvider from '@/app/api/auth/[...nextauth]/auth-provider';

import "./globals.css";

import { metaObject } from "@/config/site.config";

export const metadata: Metadata = {
  ...metaObject(),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html
      // 💡 Prevent next-themes hydration warning
      suppressHydrationWarning
    >
      <body
        // to prevent any warning that is caused by third party extensions like Grammarly
        suppressHydrationWarning
        className={cn(inter.variable, lexendDeca.variable, "font-inter")}
      >
        <AuthProvider session={session}>
          <ThemeProvider>
            <NextProgress />
            <JotaiProvider>
              {children}
              <GlobalDrawer />
              <GlobalModal />
            </JotaiProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
