"use client";

// ─────────────────────────────────────────────────────────────────────────────
// lib/auth-context.tsx
// Provides current user + role to any component in the tree.
// Wrap with <Providers> (which already includes QueryClientProvider).
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useCurrentUser } from "@/hooks/use-users";
import { tokenStore } from "@/lib/api-client";
import { getRoleName } from "@/lib/role-utils";
import type { RoleName, UserResponse } from "@/types";

interface AuthContextValue {
  user:        UserResponse | undefined;
  isLoading:   boolean;
  isLoggedIn:  boolean;
  role:        RoleName | undefined;
  isOwner:     boolean;
  isAdmin:     boolean;
  isStaff:     boolean;
  canManage:   boolean;   // OWNER or ADMIN
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

  const role       = getRoleName(user?.role) as RoleName | undefined;
  const isLoggedIn = !!tokenStore.getAccess() && !!user;

  const value: AuthContextValue = {
    user,
    isLoading,
    isLoggedIn,
    role,
    isOwner:    role === "SUPERADMIN",
    isAdmin:    role === "MANAGER",
    isStaff:    role === "STAFF",
    canManage:  role === "SUPERADMIN" || role === "MANAGER",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
