-- =============================================================
-- Migrazione 002 — Search Logs (tracciamento ricerche utente)
-- Esegui nel SQL Editor di Supabase dopo 001_auth_gdpr.sql
-- =============================================================

create table if not exists public.search_logs (
  id         bigserial   primary key,
  user_id    uuid        references public.profiles(id) on delete set null,
  query      text        not null,
  result_id  text,       -- ID evento selezionato (opzionale)
  result_type text,      -- 'static' | 'wiki' | 'epoch'
  created_at timestamptz not null default now()
);

comment on table public.search_logs
  is 'Log ricerche utente — query, risultato selezionato, timestamp';

alter table public.search_logs enable row level security;

-- Utente può inserire le proprie ricerche
create policy "search_logs_own_insert" on public.search_logs
  for insert with check (user_id = auth.uid());

-- Admin può leggere tutti i log
create policy "search_logs_admin_select" on public.search_logs
  for select using (public.get_my_role() = 'admin');

create index if not exists search_logs_user_id_idx  on public.search_logs(user_id);
create index if not exists search_logs_created_idx  on public.search_logs(created_at desc);
create index if not exists search_logs_query_idx    on public.search_logs(query);
