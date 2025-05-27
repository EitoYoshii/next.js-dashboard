import { DefaultSession } from 'next-auth';
import { JWT} from 'next-auth/jwt';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      name: string;
      email: string;
      role: string;
    };
  }

  interface User {
    role: string;
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    id: string;
    role: string;
  }
}
