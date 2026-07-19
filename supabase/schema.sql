-- Run this in the Supabase SQL editor (Dashboard → SQL Editor).
create table if not exists public.headlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  brief text not null,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.headlines enable row level security;

create policy "Users can read own headlines"
  on public.headlines for select
  using (auth.uid() = user_id);

create policy "Users can insert own headlines"
  on public.headlines for insert
  with check (auth.uid() = user_id);

create index if not exists headlines_user_created_idx
  on public.headlines (user_id, created_at desc);
