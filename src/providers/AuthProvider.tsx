"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "@/components/ui/toast";
import type { LinkedAccount } from "@/lib/accountLinking";
import type { PublicUser } from "@/lib/auth";

interface AuthContextType {
  user: PublicUser | null;
  linkedProviders: LinkedAccount[];
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  initialUser: PublicUser | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<PublicUser | null>(initialUser);
  const [linkedProviders, setLinkedProviders] = useState<LinkedAccount[]>([]);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
    setLinkedProviders(data.linkedProviders);
  }, []);

  // page.tsx only provides the user itself server-side; linked providers are
  // fetched lazily on mount so the initial paint never blocks on the extra query.
  useEffect(() => {
    if (initialUser) refresh();
  }, [initialUser, refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setLinkedProviders([]);
    toast.dismiss(); // clear any still-visible toast so it doesn't stack with this one
    toast.success("Atsijungėte.");
  }, []);

  const value = useMemo(
    () => ({ user, linkedProviders, refresh, logout }),
    [user, linkedProviders, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
