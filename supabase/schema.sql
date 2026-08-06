-- CP Focus - Supabase schema inicial
-- Execute este SQL no Supabase SQL Editor.

create table if not exists public.user_app_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  data_key text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, data_key)
);

alter table public.user_app_data enable row level security;

drop policy if exists "user_app_data_select_own" on public.user_app_data;
create policy "user_app_data_select_own"
on public.user_app_data
for select
using (auth.uid() = user_id);

drop policy if exists "user_app_data_insert_own" on public.user_app_data;
create policy "user_app_data_insert_own"
on public.user_app_data
for insert
with check (auth.uid() = user_id);

drop policy if exists "user_app_data_update_own" on public.user_app_data;
create policy "user_app_data_update_own"
on public.user_app_data
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_app_data_delete_own" on public.user_app_data;
create policy "user_app_data_delete_own"
on public.user_app_data
for delete
using (auth.uid() = user_id);

create index if not exists user_app_data_user_id_idx
on public.user_app_data (user_id);

create index if not exists user_app_data_data_key_idx
on public.user_app_data (data_key);