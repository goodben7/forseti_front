'use strict';

import HeliumLayout from '@/layouts/helium/helium-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <HeliumLayout>{children}</HeliumLayout>;
}
