-- =============================================================
-- Migrazione 001 — Auth + GDPR
-- Esegui nel SQL Editor di Supabase (progetto → SQL Editor → New query)
-- =============================================================

-- ── Tabella profiles (estende auth.users 1:1) ────────────────
create table if not exists public.profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  email           text        not null,
  role            text        not null default 'user' check (role in ('admin', 'user')),
  gdpr_consent_at timestamptz,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now()
);

comment on column public.profiles.deleted_at
  is 'Soft-delete GDPR Art. 17: l''account è disabilitato, dati eliminati fisicamente entro 30 gg';

-- ── Tabella access_logs (log accessi GDPR-compliant) ─────────
create table if not exists public.access_logs (
  id          bigserial   primary key,
  user_id     uuid        references public.profiles(id) on delete set null,
  ip_hash     text,       -- SHA-256 troncato a 16 char: non reversibile (GDPR)
  user_agent  text,
  created_at  timestamptz not null default now()
);

comment on table public.access_logs
  is 'Log accessi — IP conservato come hash non reversibile (GDPR art. 32)';

-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.access_logs enable row level security;

-- Ogni utente può leggere/aggiornare il proprio profilo
create policy "profiles_own_rw" on public.profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

-- Funzione SECURITY DEFINER per leggere il ruolo senza ricorsione RLS
-- (le subquery su profiles dentro le policy causano infinite recursion → 500)
create or replace function public.get_my_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- Admin può leggere tutti i profili (usa la funzione per evitare ricorsione)
create policy "profiles_admin_select" on public.profiles
  for select using (public.get_my_role() = 'admin');

-- Utenti autenticati possono inserire il proprio log accesso
create policy "access_logs_own_insert" on public.access_logs
  for insert with check (user_id = auth.uid());

-- Admin può leggere tutti i log
create policy "access_logs_admin_select" on public.access_logs
  for select using (public.get_my_role() = 'admin');

-- ── Trigger: crea profilo automaticamente al signup ──────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_count int;
begin
  select count(*) into existing_count from public.profiles;
  insert into public.profiles (id, email, role, gdpr_consent_at)
  values (
    new.id,
    new.email,
    -- Primo utente → admin
    case when existing_count = 0 then 'admin' else 'user' end,
    (new.raw_user_meta_data->>'gdpr_consent_at')::timestamptz
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Indici per le query admin ────────────────────────────────
create index if not exists access_logs_user_id_idx  on public.access_logs(user_id);
create index if not exists access_logs_created_idx  on public.access_logs(created_at desc);
create index if not exists profiles_role_idx        on public.profiles(role);
create index if not exists profiles_deleted_idx     on public.profiles(deleted_at) where deleted_at is not null;
