"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { loadThemeMode, saveThemeMode, type AppThemeMode } from "@/lib/theme-storage";

export type AppAuthUser = {
  uid: string;
  id: string;
  email?: string | null;
  provider: "supabase" | "local";
  raw?: any;
};

type AuthContextValue = {
  user: AppAuthUser | null;
  loading: boolean;
  provider: "supabase" | "local" | "none";
};

type ThemeContextValue = {
  theme: AppThemeMode;
  setTheme: (theme: AppThemeMode) => void;
  toggleTheme: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const ThemeContext = createContext<ThemeContextValue | null>(null);

function normalizeSupabaseUser(user: any): AppAuthUser | null {
  if (!user?.id) return null;

  return {
    uid: user.id,
    id: user.id,
    email: user.email || null,
    provider: "supabase",
    raw: user,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<AuthContextValue["provider"]>("none");

  useEffect(() => {
    let active = true;

    if (!supabase) {
      setProvider("local");
      setLoading(false);
      return;
    }

    const client = supabase;

    async function boot() {
      const { data, error } = await client.auth.getSession();
      if (!active) return;

      if (error) {
        console.error("Falha ao restaurar a sessao do usuario.", error);
        setUser(null);
        setProvider("local");
      } else {
        const normalized = normalizeSupabaseUser(data.session?.user);
        setUser(normalized);
        setProvider(normalized ? "supabase" : "local");
      }

      setLoading(false);
    }

    void boot();

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const nextUser = normalizeSupabaseUser(session?.user);
      setUser(nextUser);
      setProvider(nextUser ? "supabase" : "local");
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ user, loading, provider }),
    [user, loading, provider],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = loadThemeMode();
    setThemeState(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    saveThemeMode(theme);
  }, [theme, mounted]);

  function setTheme(nextTheme: AppThemeMode) {
    setThemeState(nextTheme);
  }

  function toggleTheme() {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return ctx;
}