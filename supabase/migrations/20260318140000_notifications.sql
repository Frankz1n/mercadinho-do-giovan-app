-- Tokens de push + status ready_for_pickup

alter type public.order_status add value if not exists 'ready_for_pickup' after 'awaiting_pickup';

create table public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null default 'unknown',
  updated_at timestamptz not null default now()
);

create index device_tokens_user_id_idx on public.device_tokens (user_id);

alter table public.device_tokens enable row level security;

create policy "device_tokens_select_own"
  on public.device_tokens for select
  to authenticated
  using (user_id = auth.uid());

create policy "device_tokens_insert_own"
  on public.device_tokens for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "device_tokens_update_own"
  on public.device_tokens for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "device_tokens_delete_own"
  on public.device_tokens for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.device_tokens to authenticated;

-- Realtime para toast de novo pedido no painel admin
alter publication supabase_realtime add table public.orders;
