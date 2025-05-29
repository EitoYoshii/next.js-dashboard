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
  password: z.coerce.number(),
  role: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true});
const UpdateInvoice = FormSchema.omit({id: true, date: true});
const CreateUser = UserSchema.omit({});
const UpdateUser = UserSchema.omit({});



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
    id: formData.get('ID'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });

  if (!validatedFields.success){
    return{
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create User.',
    };
  }
  
  const { name, id, email, password, role } = validatedFields.data;
  // const hashedPassword = await bcrypt.hash(password, 10);
  
  try{
  await sql`
    INSERT INTO users (id, name, email, password, role)
    VALUES (${id}, ${name}, ${email}, ${password}, ${role})
  `;
  } catch(error){
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
