-- Aplicada em 19/10/2026.
create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default ((now() at time zone 'America/Sao_Paulo'))::date,
  waist_cm numeric check (waist_cm between 30 and 250),
  hip_cm numeric check (hip_cm between 30 and 250),
  neck_cm numeric check (neck_cm between 15 and 80),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
alter table public.body_measurements enable row level security;
create policy "own_select" on public.body_measurements for select to authenticated using (auth.uid() = user_id);
create policy "own_insert" on public.body_measurements for insert to authenticated with check (auth.uid() = user_id);
create policy "own_update" on public.body_measurements for update to authenticated using (auth.uid() = user_id);
create policy "own_delete" on public.body_measurements for delete to authenticated using (auth.uid() = user_id);
create index if not exists idx_body_measurements_user_date on public.body_measurements (user_id, date desc);
