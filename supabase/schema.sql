-- Run this in the Supabase SQL editor (Dashboard → SQL Editor).
-- Idempotent: safe to run multiple times.

-- === headlines ===========================================================
create table if not exists public.headlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  brief text not null,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.headlines enable row level security;

drop policy if exists "Users can read own headlines" on public.headlines;
create policy "Users can read own headlines"
  on public.headlines for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own headlines" on public.headlines;
create policy "Users can insert own headlines"
  on public.headlines for insert
  with check (auth.uid() = user_id);

create index if not exists headlines_user_created_idx
  on public.headlines (user_id, created_at desc);

-- === swipes ==============================================================
create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'email',
  title text not null default 'Untitled',
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.swipes enable row level security;

drop policy if exists "Users can read own swipes" on public.swipes;
create policy "Users can read own swipes"
  on public.swipes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own swipes" on public.swipes;
create policy "Users can insert own swipes"
  on public.swipes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own swipes" on public.swipes;
create policy "Users can delete own swipes"
  on public.swipes for delete
  using (auth.uid() = user_id);

create index if not exists swipes_user_created_idx
  on public.swipes (user_id, created_at desc);

-- === profiles (subscription state) ======================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  subscribed boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Writes to profiles happen only via the service-role key (Stripe webhook),
-- which bypasses RLS — so no insert/update policies for users.

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: create profile rows for any users who signed up before
-- this trigger existed.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
