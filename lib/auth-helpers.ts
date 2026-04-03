// ─────────────────────────────────────────────────────────────────────────────
// lib/auth-helpers.ts
// Persist auth data to both localStorage (for api-client) and cookies
// (for middleware route guards). Call after login / register.
// ─────────────────────────────────────────────────────────────────────────────

import { tokenStore } from '@/lib/api-client';
import type { AuthResponse } from '@/types';

export function persistAuth(auth: AuthResponse) {
  // localStorage — used by api-client for Authorization header
  tokenStore.setTokens(auth.accessToken, auth.refreshToken);

  // Cookies — readable by Next.js Edge Middleware
  const maxAge = 7 * 24 * 60 * 60; // 7 days (matches refresh token)
  document.cookie = `access_token=${auth.accessToken}; path=/; max-age=${maxAge}; SameSite=Strict`;
  document.cookie = `user_role=${auth.role};             path=/; max-age=${maxAge}; SameSite=Strict`;
}

export function clearAuth() {
  tokenStore.clear();
  document.cookie = 'access_token=; path=/; max-age=0';
  document.cookie = 'user_role=;      path=/; max-age=0';
}
