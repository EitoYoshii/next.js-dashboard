import Form from '@/app/ui/users/edit-form';
import  { fetchUsersById }  from '@/app/lib/data';
import { Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Edit',
};



export default async function Page(props: {params: Promise<{ id: string }> }) {
    const resolvedParams = await props.params;
    const id = resolvedParams.id;
    const user = await fetchUsersById(id);
    console.log(user.id);

  return (
    <main>
      <Form user={user} />
    </main>
  );
}