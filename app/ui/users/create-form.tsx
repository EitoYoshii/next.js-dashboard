'use client'

import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { createUser, userState } from '@/app/lib/actions';

export default function Form(){
    const initialState: userState = { message: null, errors: {} };
    const[state, formAction] = useActionState(createUser, initialState);
  
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Enter User Name
          </label>
          <div className='relative mt-2 rounded-md'>
             <div className="relative">
              <input
               id="name"
               name="name"
               type="text"
               placeholder="Enter Name"
               className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
            </div>        
          </div>
        </div>
        {/* ID */}
        <div className="mb-4">
          <label htmlFor="id" className="mb-2 block text-sm font-medium">
            Enter an ID
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="ID"
                name="id"
                type="text"
                placeholder="Enter ID (uuid format)"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>    
        {/* E-mail */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Enter E-mail
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="text"
                placeholder="Enter e-mail"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>  
        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Enter Password
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter Password (6ケタ以上)"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>  
        {/* Role */}  
        <div className="mb-4">
          <label htmlFor="role" className="mb-2 block text-sm font-medium">
            Choose Role
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <select
                id="role"
                name="roel"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                defaultValue=""
              >
                <option value="" disabled>
                    Select a Role
                </option>
                <option>
                    user
                </option>
                <option>
                    admin
                </option>
              </select>
            </div>
          </div>
        </div>                
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/USERS"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create User</Button>
      </div>
    </form>
  );
}
