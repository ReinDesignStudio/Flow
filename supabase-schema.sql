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

create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  members uuid[] not null default array[]::uuid[],
  categories text[] not null default array['Groceries', 'Bills', 'Rent', 'Gas', 'Food', 'Kids', 'Savings', 'Emergency', 'Others'],
  icons jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.circle_members (
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  category_id text,
  circle_id uuid references public.circles(id) on delete set null,
  created_by_user_id uuid references auth.users(id) on delete set null,
  expense_visibility text not null default 'personal' check (expense_visibility in ('personal', 'circle')),
  label text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expenses
  add column if not exists category_id text,
  add column if not exists circle_id uuid references public.circles(id) on delete set null,
  add column if not exists created_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists expense_visibility text not null default 'personal' check (expense_visibility in ('personal', 'circle'));

alter table public.profiles enable row level security;
alter table public.category_settings enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
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

drop policy if exists "Circle members can view circles" on public.circles;
create policy "Circle members can view circles"
  on public.circles
  for select
  to authenticated
  using ((select auth.uid()) = created_by_user_id or (select auth.uid()) = any(members));

drop policy if exists "Circle owners can manage circles" on public.circles;
create policy "Circle owners can manage circles"
  on public.circles
  for all
  to authenticated
  using ((select auth.uid()) = created_by_user_id or (select auth.uid()) = any(members))
  with check ((select auth.uid()) = created_by_user_id or (select auth.uid()) = any(members));

drop policy if exists "Circle memberships are visible to members" on public.circle_members;
create policy "Circle memberships are visible to members"
  on public.circle_members
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.circle_members peer
      where peer.circle_id = circle_members.circle_id
      and peer.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can join circles" on public.circle_members;
create policy "Users can join circles"
  on public.circle_members
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Expenses are owner-only" on public.expenses;
create policy "Expenses are owner-only"
  on public.expenses
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Circle expenses are shared with members" on public.expenses;
create policy "Circle expenses are shared with members"
  on public.expenses
  for select
  to authenticated
  using (
    expense_visibility = 'circle'
    and exists (
      select 1 from public.circle_members
      where circle_members.circle_id = expenses.circle_id
      and circle_members.user_id = (select auth.uid())
    )
  );

create index if not exists expenses_user_created_idx
  on public.expenses (user_id, created_at desc);

create index if not exists expenses_circle_created_idx
  on public.expenses (circle_id, created_at desc);
