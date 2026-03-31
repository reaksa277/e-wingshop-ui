import { ApiError } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

// ── Token storage helpers ─────────────────────────────────────────────────────

export const tokenStore = {
  getAccess:    () => (typeof window !== "undefined" ? localStorage.getItem("access_token")  : null),
  getRefresh:   () => (typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem("access_token",  access);
    localStorage.setItem("refresh_token", refresh);
  },
  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?:    HttpMethod;
  body?:      unknown;
  params?:    Record<string, string | number | boolean | undefined | null>;
  auth?:      boolean;   // default true
  signal?:    AbortSignal;
}

let isRefreshing   = false;
let refreshQueue:  Array<(token: string) => void> = [];

async function performRefresh(): Promise<string | null> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
    });
    if (!res.ok) { tokenStore.clear(); return null; }
    const data = await res.json();
    tokenStore.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    tokenStore.clear();
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params, auth = true, signal } = options;

  // Build URL with query params
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) {
    const token = tokenStore.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const makeRequest = () =>
    fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

  let response = await makeRequest();

  // ── Auto-refresh on 401 ───────────────────────────────────────────────────
  if (response.status === 401 && auth) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await performRefresh();
      isRefreshing = false;
      refreshQueue.forEach((cb) => cb(newToken ?? ""));
      refreshQueue = [];

      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await makeRequest();
      } else {
        tokenStore.clear();
        if (typeof window !== "undefined") window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    } else {
      // Queue subsequent calls while refresh is in flight
      await new Promise<void>((resolve) => {
        refreshQueue.push((token) => {
          if (token) headers["Authorization"] = `Bearer ${token}`;
          resolve();
        });
      });
      response = await makeRequest();
    }
  }

  // ── Parse response ────────────────────────────────────────────────────────
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const err = data as ApiError;
    throw Object.assign(new Error(err.message ?? "Request failed"), {
      status:  response.status,
      details: err.details,
      apiError: err,
    });
  }

  return data as T;
}

// ── Convenience methods ───────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, params?: RequestOptions["params"], signal?: AbortSignal) =>
    apiRequest<T>(path, { method: "GET", params, signal }),

  post: <T>(path: string, body?: unknown, params?: RequestOptions["params"]) =>
    apiRequest<T>(path, { method: "POST", body, params }),

  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, params?: RequestOptions["params"]) =>
    apiRequest<T>(path, { method: "PATCH", body, params }),

  delete: <T>(path: string, params?: RequestOptions["params"]) =>
    apiRequest<T>(path, { method: "DELETE", params }),

  postPublic: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body, auth: false }),
};
