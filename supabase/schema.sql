-- LAMED+ cloud schema (Supabase / Postgres).
-- Run once in the SQL editor of a fresh project, then set VITE_SUPABASE_URL and
-- VITE_SUPABASE_ANON_KEY. The anon key is public by design; every table below is
-- protected by row level security.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.progress (
  user_id uuid primary key references auth.users on delete cascade,
  snapshot jsonb not null,
  app_version text,
  updated_at timestamptz not null default now()
);

-- Opt-in product analytics: anonymous id only, never an email or a name.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete set null,
  anon_id text,
  name text not null,
  props jsonb not null default '{}'::jsonb,
  locale text,
  app_version text,
  created_at timestamptz not null default now()
);

create index if not exists events_name_created_idx on public.events (name, created_at desc);

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.events enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "own progress" on public.progress;
create policy "own progress" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Anyone may append an event; nobody may read events with the anon key.
drop policy if exists "append events" on public.events;
create policy "append events" on public.events
  for insert to anon, authenticated with check (true);

-- Every new account starts on the free plan.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

-- Self-service deletion: the browser cannot remove its own auth user, so a
-- security-definer function does it. It only ever touches the caller's rows.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from public.progress where user_id = uid;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
