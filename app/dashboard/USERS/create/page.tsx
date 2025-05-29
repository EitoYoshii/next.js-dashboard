import Form from '@/app/ui/users/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchUsers } from '@/app/lib/data';
import { Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Create',
};

export default async function Page() {
  const users = await fetchUsers();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Users', href: '/dashboard/USERS' },
          {
            label: 'Create User',
            href: '/dashboard/USERS/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}