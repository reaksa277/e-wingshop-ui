import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { findUserByEmail, type MockUser } from './mock-users';
import { z } from 'zod';
import type { Role } from './permissions';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          throw new Error(parsed.error.issues[0].message);
        }

        const { email, password } = parsed.data;

        const user = findUserByEmail(email);

        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          branchId: user.branchId,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const mockUser = user as MockUser;
        token.id = mockUser.id;
        token.role = mockUser.role;
        token.branchId = mockUser.branchId ?? null;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.branchId = token.branchId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
