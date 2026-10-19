-- WhatsApp: vínculo do número, códigos de vínculo, mensagens processadas e configurações do app
create table if not exists public.whatsapp_links (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text not null unique check (phone ~ '^[0-9]{8,15}$'),
  linked_at timestamptz not null default now()
);
alter table public.whatsapp_links enable row level security;
create policy "wa_links_select_own" on public.whatsapp_links for select to authenticated using (user_id = (select auth.uid()));
create policy "wa_links_delete_own" on public.whatsapp_links for delete to authenticated using (user_id = (select auth.uid()));

create table if not exists public.whatsapp_link_codes (
  code text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '15 minutes'
);
alter table public.whatsapp_link_codes enable row level security;

create table if not exists public.whatsapp_messages (
  wa_id text primary key,
  phone text not null,
  created_at timestamptz not null default now()
);
alter table public.whatsapp_messages enable row level security;

create table if not exists public.app_settings (
  key text primary key,
  value text not null
);
alter table public.app_settings enable row level security;
create policy "app_settings_read" on public.app_settings for select to authenticated using (true);

create or replace function public.whatsapp_create_link_code() returns text
language plpgsql security definer set search_path to 'public' as $$
declare _code text; _uid uuid := auth.uid();
begin
  if _uid is null then raise exception 'not authenticated'; end if;
  delete from public.whatsapp_link_codes where user_id = _uid or expires_at < now();
  loop
    _code := upper(substr(translate(encode(extensions.gen_random_bytes(8), 'base64'), '+/=0O1IL', ''), 1, 6));
    exit when length(_code) = 6 and not exists (select 1 from public.whatsapp_link_codes where code = _code);
  end loop;
  insert into public.whatsapp_link_codes(code, user_id) values (_code, _uid);
  return _code;
end $$;
revoke all on function public.whatsapp_create_link_code() from public, anon;
grant execute on function public.whatsapp_create_link_code() to authenticated;
