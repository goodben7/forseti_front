import { metaObject } from '@/config/site.config';
import UserListTable from './table';
import { Title } from 'rizzui';
import Breadcrumb from '@core/ui/breadcrumb';

export const metadata = {
    ...metaObject('Liste des utilisateurs'),
};

export default function UserListPage() {
    const pageHeader = {
        title: 'Liste des utilisateurs',
        breadcrumb: [
            {
                href: '/',
                name: 'Tableau de bord',
            },
            {
                name: 'Utilisateurs & rôles',
            },
            {
                name: 'Liste des utilisateurs',
            },
        ],
    };

    return (
        <div className="@container">
            <header className="mb-4 @container xs:-mt-2 lg:mb-5">
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
                </div>
            </header>
            <UserListTable />
        </div>
    );
}
