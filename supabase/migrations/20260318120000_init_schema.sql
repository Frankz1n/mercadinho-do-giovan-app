-- Mercadinho do Giovan — schema inicial (auth profiles, catálogo, pedidos, RLS, RPCs)

create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'admin');
create type public.order_status as enum ('awaiting_pickup', 'completed', 'cancelled');
create type public.cart_item_kind as enum ('product', 'basket');
create type public.product_visual as enum (
  'rice', 'milk', 'beans', 'eggs', 'produce', 'cleaning', 'coffee', 'pasta'
);

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text not null default '',
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table public.categories (
  id text primary key,
  name text not null,
  visual public.product_visual not null
);

create table public.products (
  id text primary key default ('product-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  category_id text not null references public.categories (id),
  name text not null,
  description text not null default '',
  unit_label text not null,
  price_cents integer not null check (price_cents >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_featured boolean not null default false,
  visual public.product_visual not null,
  image_url text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.baskets (
  id text primary key,
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  image_url text not null default '',
  is_active boolean not null default true
);

create table public.basket_components (
  basket_id text not null references public.baskets (id) on delete cascade,
  product_id text not null references public.products (id),
  quantity integer not null check (quantity > 0),
  primary key (basket_id, product_id)
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.baskets enable row level security;
alter table public.basket_components enable row level security;

create policy "categories_read_all"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "products_read_active"
  on public.products for select
  to anon, authenticated
  using (is_active or public.is_admin());

create policy "products_admin_insert"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

create policy "products_admin_update"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using (public.is_admin());

create policy "baskets_read_active"
  on public.baskets for select
  to anon, authenticated
  using (is_active or public.is_admin());

create policy "basket_components_read"
  on public.basket_components for select
  to anon, authenticated
  using (true);

grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.baskets to anon, authenticated;
grant select on public.basket_components to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null references public.profiles (id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  status public.order_status not null default 'awaiting_pickup',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  item_ref text not null,
  kind public.cart_item_kind not null,
  name text not null,
  unit_label text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0)
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);
create index order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "orders_select_own_or_admin"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "orders_admin_update"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items_select_own_or_admin"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant update on public.orders to authenticated;

-- ---------------------------------------------------------------------------
-- Helpers + RPCs
-- ---------------------------------------------------------------------------

create or replace function public.generate_order_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  suffix text;
  candidate text;
  attempt integer;
begin
  for attempt in 1..40 loop
    suffix := '';
    for i in 1..6 loop
      suffix := suffix || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    candidate := 'MG-' || suffix;
    if not exists (select 1 from public.orders where code = candidate) then
      return candidate;
    end if;
  end loop;
  return 'MG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
end;
$$;

create or replace function public.place_order(
  p_items jsonb,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_item jsonb;
  v_kind text;
  v_ref text;
  v_qty integer;
  v_product public.products%rowtype;
  v_component record;
  v_needed integer;
  v_stock_map jsonb := '{}'::jsonb;
  v_product_id text;
  v_delta integer;
  v_subtotal integer := 0;
  v_order_id uuid;
  v_code text;
  v_now timestamptz := now();
  v_order public.orders%rowtype;
  v_items jsonb;
begin
  if v_user_id is null then
    raise exception 'Faça login para fechar o pedido.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Adicione itens ao carrinho antes de fechar o pedido.';
  end if;

  select * into v_profile from public.profiles where id = v_user_id;
  if not found then
    raise exception 'Perfil não encontrado.';
  end if;

  -- Aggregate stock needs (products + basket components)
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_kind := v_item->>'kind';
    v_ref := v_item->>'id';
    v_qty := greatest(coalesce((v_item->>'quantity')::int, 0), 0);

    if v_qty <= 0 then
      raise exception 'Quantidade inválida no pedido.';
    end if;

    v_subtotal := v_subtotal + coalesce((v_item->>'line_total_cents')::int, 0);

    if v_kind = 'product' then
      v_stock_map := jsonb_set(
        v_stock_map,
        array[v_ref],
        to_jsonb(coalesce((v_stock_map->>v_ref)::int, 0) + v_qty)
      );
    elsif v_kind = 'basket' then
      for v_component in
        select product_id, quantity
        from public.basket_components
        where basket_id = v_ref
      loop
        v_needed := v_component.quantity * v_qty;
        v_stock_map := jsonb_set(
          v_stock_map,
          array[v_component.product_id],
          to_jsonb(
            coalesce((v_stock_map->>v_component.product_id)::int, 0) + v_needed
          )
        );
      end loop;
    else
      raise exception 'Tipo de item inválido: %', v_kind;
    end if;
  end loop;

  -- Lock and decrement stock
  for v_product_id, v_delta in
    select key, value::int from jsonb_each_text(v_stock_map)
  loop
    select * into v_product
    from public.products
    where id = v_product_id and is_active
    for update;

    if not found then
      raise exception 'Produto indisponível: %', v_product_id;
    end if;

    if v_product.stock_quantity < v_delta then
      raise exception 'Estoque insuficiente para %.', v_product.name;
    end if;

    update public.products
    set
      stock_quantity = stock_quantity - v_delta,
      updated_at = v_now
    where id = v_product_id;
  end loop;

  v_code := public.generate_order_code();
  v_order_id := gen_random_uuid();

  insert into public.orders (
    id, code, user_id, customer_name, customer_email, customer_phone,
    status, subtotal_cents, notes, created_at, updated_at, completed_at
  ) values (
    v_order_id,
    v_code,
    v_user_id,
    v_profile.name,
    v_profile.email,
    v_profile.phone,
    'awaiting_pickup',
    v_subtotal,
    nullif(trim(coalesce(p_notes, '')), ''),
    v_now,
    v_now,
    null
  )
  returning * into v_order;

  insert into public.order_items (
    order_id, item_ref, kind, name, unit_label, quantity, unit_price_cents, line_total_cents
  )
  select
    v_order_id,
    elem->>'id',
    (elem->>'kind')::public.cart_item_kind,
    elem->>'name',
    coalesce(elem->>'unit_label', ''),
    (elem->>'quantity')::int,
    (elem->>'unit_price_cents')::int,
    (elem->>'line_total_cents')::int
  from jsonb_array_elements(p_items) as elem;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', oi.item_ref,
      'kind', oi.kind,
      'name', oi.name,
      'unitLabel', oi.unit_label,
      'quantity', oi.quantity,
      'unitPriceCents', oi.unit_price_cents,
      'lineTotalCents', oi.line_total_cents
    )
  ), '[]'::jsonb)
  into v_items
  from public.order_items oi
  where oi.order_id = v_order_id;

  return jsonb_build_object(
    'id', v_order.id,
    'code', v_order.code,
    'userId', v_order.user_id,
    'customerName', v_order.customer_name,
    'customerEmail', v_order.customer_email,
    'customerPhone', v_order.customer_phone,
    'status', v_order.status,
    'items', v_items,
    'subtotalCents', v_order.subtotal_cents,
    'notes', v_order.notes,
    'createdAt', v_order.created_at,
    'updatedAt', v_order.updated_at,
    'completedAt', v_order.completed_at
  );
end;
$$;

revoke all on function public.place_order(jsonb, text) from public;
grant execute on function public.place_order(jsonb, text) to authenticated;

create or replace function public.adjust_stock(p_adjustments jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entry jsonb;
  v_product_id text;
  v_delta integer;
  v_product public.products%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem ajustar estoque.';
  end if;

  if p_adjustments is null or jsonb_typeof(p_adjustments) <> 'array' then
    return;
  end if;

  for v_entry in select * from jsonb_array_elements(p_adjustments)
  loop
    v_product_id := v_entry->>'productId';
    v_delta := coalesce((v_entry->>'quantityDelta')::int, 0);

    if v_product_id is null or v_delta = 0 then
      continue;
    end if;

    select * into v_product
    from public.products
    where id = v_product_id
    for update;

    if not found then
      continue;
    end if;

    update public.products
    set
      stock_quantity = greatest(0, stock_quantity + v_delta),
      updated_at = now()
    where id = v_product_id;
  end loop;
end;
$$;

revoke all on function public.adjust_stock(jsonb) from public;
grant execute on function public.adjust_stock(jsonb) to authenticated;
