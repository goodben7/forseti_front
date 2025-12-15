import { metaObject } from '@/config/site.config';
import UserListTable from './table';

export const metadata = {
    ...metaObject('Liste des utilisateurs'),
};

export default function UserListPage() {
    return (
        <div className="@container">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Liste des utilisateurs
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Gérez tous les utilisateurs de la plateforme
                </p>
            </div>

            <UserListTable />
        </div>
    );
}
