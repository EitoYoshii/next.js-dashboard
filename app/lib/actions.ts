'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import  bcrypt from 'bcryptjs';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require'});

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
      invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
      .number()
      .gt(0, { message: 'Please enter an amount greater than $0.'}),
    status: z.enum(['pending', 'paid'],{
      invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const UserSchema = z.object({
  name: z.string(),
  id: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string(),
});

const UpdateShema = z.object({
  name: z.string().min(1, { message: '名前は必須です' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください' }),
  role: z.string().min(1, { message: '役職は必須です' }),
});


const CreateInvoice = FormSchema.omit({ id: true, date: true});
const UpdateInvoice = FormSchema.omit({id: true, date: true});
const CreateUser = UserSchema.omit({});
const UpdateUser = UpdateShema.omit({});


export type updateUserState = {
  errors?: {
    name?: string[];
    email?: string[];
    role?: string[];
  };
  message?: string | null;
};


export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type userState = {
  errors?: {
    name?: string[];
    id?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
  }
  message?: string | null;
}

export async function createInvoice(prevState: State, formData: FormData) {
  
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success){
    return{
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  try{
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch(error){
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function createUser(prevState: userState, formData: FormData) {
  
  const validatedFields = CreateUser.safeParse({
    name: formData.get('name'),
    id: formData.get('id'),
    email: formData.get('email'),
    password: formData.get('password') as string,
    role: formData.get('role'),
  });

  console.log('validateFields',validatedFields);

  if (!validatedFields.success){
    return{
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create User.',
    };
  }
  
  const { name, id, email, password, role } = validatedFields.data;
  console.log('form values', {name, id, email, password, role});

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('hashedPassword', hashedPassword);  

  try{
  await sql`
    INSERT INTO users (id, name, email, password, role)
    VALUES (${id}, ${name}, ${email}, ${hashedPassword}, ${role})
    ON CONFLICT (id) DO NOTHING;
  `;
  } catch(error){
    console.error('DB Error', error);
    return {
      message: 'Database Error: Failed to Create User.',
    };
  }

    revalidatePath('/dashboard/USERS');
    redirect('/dashboard/USERS');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
 ) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }    

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try{
        await sql`
        UPDATE invoices
        SET customer_id=${customerId}, amount=${amountInCents}, status=${status}
        WHERE id = ${id}
        `;
    } catch(error){
        return { message: 'Database Error: Failed to Update Invoice.'};
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices')
}

export async function updateUser(
  id: string,
  prevState: userState,
  formData: FormData,
 ) {
    console.log('updateUser called');
    const validatedFields = UpdateUser.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
    });
  console.log('updateUser called with ID:', id);
  if (!validatedFields.success) {
    console.log('zod validation errors:',validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update User.',
    };
  }    

    const { name, email, role } = validatedFields.data;

    try{
        await sql`
        UPDATE users
        SET name=${name}, email=${email}, role=${role}
        WHERE id = ${id}
        `;
    } catch(error){
        return { message: 'Database Error: Failed to Update User.'};
    }

    revalidatePath('/dashboard/USERS');
    redirect('/dashboard/USERS')
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function deleteUsers(id: string) {
  await sql`DELETE FROM users WHERE id = ${id}`;
  revalidatePath('/dashboard/USERS');
}
