create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'User',
  email text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.category_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  categories text[] not null default array['Food', 'Gas', 'Coffee', 'Shopping', 'Bills', 'Transport'],
  icons jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  label text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.category_settings enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "Profiles are owner-only" on public.profiles;
create policy "Profiles are owner-only"
  on public.profiles
  for all
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Category settings are owner-only" on public.category_settings;
create policy "Category settings are owner-only"
  on public.category_settings
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Expenses are owner-only" on public.expenses;
create policy "Expenses are owner-only"
  on public.expenses
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists expenses_user_created_idx
  on public.expenses (user_id, created_at desc);
