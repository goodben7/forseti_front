import { metaObject } from '@/config/site.config';
import RolesPermissionsContent from './roles-permissions-content.tsx';

export const metadata = {
    ...metaObject('Rôles & permissions'),
};

export default function RolesPermissionsPage() {
    return <RolesPermissionsContent />;
}
