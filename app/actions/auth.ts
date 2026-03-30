/**
 * app/actions/auth.ts
 * Server actions for login / logout / register
 */

'use server';

import { signIn, signOut } from '@/lib/auth';
import { removeAccessToken } from '@/lib/api-client';
import { apiPost } from '@/lib/api-client';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role:     z.enum(['superadmin', 'manager', 'staff', 'viewer']).optional(),
  branchId: z.string().optional().nullable(),
});

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginWithBackend(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email:    formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  try {
    // signIn → authorize() → calls backend, stores JWT cookie, builds session
    await signIn('credentials', { email, password, redirect: false });
  } catch (error: any) {
    // Re-throw Next.js internals (NEXT_REDIRECT etc.)
    if (error?.message === 'NEXT_REDIRECT') throw error;

    // Log the actual error for debugging
    console.error('[AUTH] Login error:', {
      type: error?.type,
      name: error?.name,
      message: error?.message,
      error,
    });

    // NextAuth credential failure
    if (error?.type === 'CredentialsSignin' || error?.name === 'CredentialsSignin') {
      return { success: false, error: 'Invalid email or password' };
    }

    return { success: false, error: 'An unexpected error occurred' };
  }

  redirect('/dashboard');
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutWithBackend() {
  try {
    await apiPost('/auth/logout', {});
  } catch {
    // Best-effort — always clear local state
  } finally {
    await removeAccessToken();
    await signOut({ redirect: false });
  }
  redirect('/auth/login');
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerWithBackend(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name:     formData.get('name'),
    email:    formData.get('email'),
    password: formData.get('password'),
    role:     formData.get('role'),
    branchId: formData.get('branchId'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const result = await apiPost('/auth/register', {
    ...parsed.data,
    role: parsed.data.role ?? 'staff',
  });

  if (!result.success) {
    return { success: false, error: result.error ?? 'Registration failed' };
  }

  return { success: true, message: 'Registration successful. Please login.' };
}