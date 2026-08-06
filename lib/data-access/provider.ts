import { supabase } from "@/lib/supabase/client";

export type DataProviderMode = "local" | "supabase";

export class DataAccessError extends Error {
  constructor(
    message: string,
    readonly operation: "read" | "write" | "remove",
    readonly key: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DataAccessError";
  }
}

function isBrowser() {
  return typeof window !== "undefined";
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getDataProviderMode(): DataProviderMode {
  return process.env.NEXT_PUBLIC_DATA_PROVIDER === "supabase"
    ? "supabase"
    : "local";
}

export function readLocalData<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  return safeParse<T>(window.localStorage.getItem(key), fallback);
}

export function writeLocalData<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeLocalData(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

async function getUserId(): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new DataAccessError(
      "Nao foi possivel identificar o usuario autenticado.",
      "read",
      "auth",
      error,
    );
  }

  return data.user?.id ?? null;
}

export async function readData<T>(key: string, fallback: T): Promise<T> {
  const localValue = readLocalData<T>(key, fallback);

  if (getDataProviderMode() === "local" || !supabase) {
    return localValue;
  }

  const userId = await getUserId();
  if (!userId) return localValue;

  const { data, error } = await supabase
    .from("user_app_data")
    .select("data")
    .eq("user_id", userId)
    .eq("data_key", key)
    .maybeSingle();

  if (error) {
    throw new DataAccessError(
      "Falha ao carregar os dados da nuvem.",
      "read",
      key,
      error,
    );
  }

  if (!data) return localValue;

  const remoteValue = (data.data as T) ?? fallback;
  writeLocalData(key, remoteValue);
  return remoteValue;
}

export async function writeData<T>(key: string, value: T): Promise<void> {
  // O cache local e atualizado primeiro para preservar o trabalho do usuario.
  writeLocalData(key, value);

  if (getDataProviderMode() === "local" || !supabase) return;

  const userId = await getUserId();
  if (!userId) return;

  const { error } = await supabase.from("user_app_data").upsert(
    {
      user_id: userId,
      data_key: key,
      data: value as never,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,data_key" },
  );

  if (error) {
    throw new DataAccessError(
      "Os dados foram salvos neste dispositivo, mas nao sincronizaram com a nuvem.",
      "write",
      key,
      error,
    );
  }
}

export async function removeData(key: string): Promise<void> {
  removeLocalData(key);

  if (getDataProviderMode() === "local" || !supabase) return;

  const userId = await getUserId();
  if (!userId) return;

  const { error } = await supabase
    .from("user_app_data")
    .delete()
    .eq("user_id", userId)
    .eq("data_key", key);

  if (error) {
    throw new DataAccessError(
      "O dado foi removido deste dispositivo, mas nao da nuvem.",
      "remove",
      key,
      error,
    );
  }
}
