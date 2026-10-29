-- Endereços do cliente (base para frete futuro).

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'Casa',
  zip_code text not null,
  street text not null,
  number text not null,
  complement text not null default '',
  neighborhood text not null,
  city text not null,
  state text not null check (char_length(state) = 2),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);
create index addresses_user_default_idx on public.addresses (user_id, is_default);

alter table public.addresses enable row level security;

create policy "addresses_select_own"
  on public.addresses for select
  to authenticated
  using (user_id = auth.uid());

create policy "addresses_insert_own"
  on public.addresses for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "addresses_update_own"
  on public.addresses for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "addresses_delete_own"
  on public.addresses for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.addresses to authenticated;

create or replace function public.ensure_single_default_address()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_default then
    update public.addresses
    set is_default = false, updated_at = now()
    where user_id = new.user_id
      and id <> new.id
      and is_default = true;
  end if;
  return new;
end;
$$;

create trigger addresses_single_default
  before insert or update of is_default on public.addresses
  for each row
  when (new.is_default = true)
  execute function public.ensure_single_default_address();
