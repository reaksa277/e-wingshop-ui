import { DefaultSession } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
import type { Role } from './permissions';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      branchId: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    branchId: string | null;
  }
}
