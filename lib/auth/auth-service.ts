import type { AuthResponse, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase nao configurado.");
  }

  return supabase;
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const client = requireSupabase();
  return client.auth.signInWithPassword({ email: email.trim(), password });
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const client = requireSupabase();
  return client.auth.signUp({ email: email.trim(), password });
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
