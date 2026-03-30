/**
 * lib/api-client.ts
 * Base HTTP client for Spring Boot API
 * Base URL: http://localhost:8080/api/v1
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';
const TOKEN_COOKIE = 'access_token';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

// ─── Token helpers ────────────────────────────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

export async function setAccessToken(token: string, expiresInSeconds: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiresInSeconds,
    path: '/',
  });
}

export async function removeAccessToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

// ─── URL builder ──────────────────────────────────────────────────────────────

function buildUrl(endpoint: string, params?: QueryParams): string {
  const url = new URL(
    endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
  );
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined) url.searchParams.append(k, String(v));
    });
  }
  return url.toString();
}

// ─── Response handler ─────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  // 204 No Content
  if (res.status === 204) return { success: true, status: 204 };

  let data: any;
  try {
    data = await res.json();
  } catch {
    return { success: false, error: 'Failed to parse response', status: res.status };
  }

  console.log('[API Response]', { status: res.status, ok: res.ok, data });

  if (!res.ok) {
    return {
      success: false,
      error: data?.message || data?.error || `Request failed (${res.status})`,
      status: res.status,
    };
  }

  return { success: true, data: data as T, status: res.status };
}

// ─── Auth header ──────────────────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  endpoint: string,
  options: {
    body?: unknown;
    params?: QueryParams;
    headers?: Record<string, string>;
    noAuth?: boolean;
  } = {}
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.noAuth ? {} : await authHeaders()),
      ...options.headers,
    };

    const url = buildUrl(endpoint, options.params);
    console.log(`[API] ${method} ${url}`, options.body);

    const res = await fetch(url, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
    });

    const result = await handleResponse<T>(res);

    // Auto-redirect on 401
    if (result.status === 401) {
      await removeAccessToken();
      redirect('/auth/login?error=session_expired');
    }

    return result;
  } catch (error: any) {
    // Re-throw Next.js redirect — never swallow it
    if (error?.message === 'NEXT_REDIRECT') throw error;

    console.error(`[API] ${method} ${endpoint}`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const apiGet = <T>(endpoint: string, params?: QueryParams) =>
  request<T>('GET', endpoint, { params });

export const apiPost = <T>(endpoint: string, body?: unknown, noAuth = false) =>
  request<T>('POST', endpoint, { body, noAuth });

export const apiPut = <T>(endpoint: string, body?: unknown) =>
  request<T>('PUT', endpoint, { body });

export const apiPatch = <T>(endpoint: string, body?: unknown) =>
  request<T>('PATCH', endpoint, { body });

export const apiDelete = <T>(endpoint: string) =>
  request<T>('DELETE', endpoint);