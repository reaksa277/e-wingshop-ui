/**
 * lib/auth.ts
 * NextAuth v5 — credentials provider calls Spring Boot directly
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { apiPost, setAccessToken } from './api-client';
import type { Role } from './permissions';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId?: string | null;
  image?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  userId: number | string;
  email: string;
  fullName: string;
  role: string;
  expiresIn?: number;
}

// ─── NextAuth ─────────────────────────────────────────────────────────────────

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Call Spring Boot — single source of truth
        const result = await apiPost<LoginResponse>(
          '/auth/login',
          { email: credentials.email, password: credentials.password },
          true // noAuth — no Bearer token on login
        );

        if (!result.success) {
          console.error('[AUTHORIZE] Backend login failed:', result);
          return null;
        }

        if (!result.data) {
          console.error('[AUTHORIZE] No data in response:', result);
          return null;
        }

        const { accessToken, expiresIn = 86400, userId, email, fullName, role } = result.data;

        // Store JWT in httpOnly cookie for API calls
        await setAccessToken(accessToken, expiresIn);

        return {
          id:       String(userId),
          email:    email,
          name:     fullName,
          role:     role,
          branchId: null,
          image:    undefined,
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
        token.id       = user.id || token.id;
        token.role     = (user as any).role || token.role;
        token.branchId = (user as any).branchId ?? token.branchId ?? null;
        token.email    = user.email || token.email;
        token.name     = user.name || token.name;
      }
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id       = (token.id as string) || '';
        session.user.role     = (token.role as Role) || 'viewer';
        session.user.branchId = (token.branchId as string | null) ?? null;
        session.user.email    = (token.email as string) || '';
        session.user.name     = (token.name as string) || '';
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/login',
    error:  '/error',
  },

  secret: process.env.NEXTAUTH_SECRET,
});