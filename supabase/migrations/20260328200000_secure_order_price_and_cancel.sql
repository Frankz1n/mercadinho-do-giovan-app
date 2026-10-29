-- Preço e nomes vêm do catálogo no servidor (ignora valores enviados pelo cliente).
-- Cancelamento devolve estoque de produtos e componentes de cesta.

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
  v_basket public.baskets%rowtype;
  v_component record;
  v_needed integer;
  v_stock_map jsonb := '{}'::jsonb;
  v_product_id text;
  v_delta integer;
  v_unit_price integer;
  v_line_total integer;
  v_name text;
  v_unit_label text;
  v_resolved_items jsonb := '[]'::jsonb;
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

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_kind := v_item->>'kind';
    v_ref := v_item->>'id';
    v_qty := greatest(coalesce((v_item->>'quantity')::int, 0), 0);

    if v_ref is null or length(trim(v_ref)) = 0 then
      raise exception 'Item inválido no pedido.';
    end if;

    if v_qty <= 0 then
      raise exception 'Quantidade inválida no pedido.';
    end if;

    if v_kind = 'product' then
      select * into v_product
      from public.products
      where id = v_ref and is_active;

      if not found then
        raise exception 'Produto indisponível: %', v_ref;
      end if;

      v_unit_price := v_product.price_cents;
      v_name := v_product.name;
      v_unit_label := v_product.unit_label;

      v_stock_map := jsonb_set(
        v_stock_map,
        array[v_ref],
        to_jsonb(coalesce((v_stock_map->>v_ref)::int, 0) + v_qty)
      );
    elsif v_kind = 'basket' then
      select * into v_basket
      from public.baskets
      where id = v_ref and is_active;

      if not found then
        raise exception 'Cesta indisponível: %', v_ref;
      end if;

      if not exists (
        select 1 from public.basket_components where basket_id = v_ref
      ) then
        raise exception 'Cesta sem itens cadastrados: %', v_basket.name;
      end if;

      v_unit_price := v_basket.price_cents;
      v_name := v_basket.name;
      v_unit_label := 'cesta';

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

    v_line_total := v_unit_price * v_qty;
    v_subtotal := v_subtotal + v_line_total;

    v_resolved_items := v_resolved_items || jsonb_build_array(
      jsonb_build_object(
        'id', v_ref,
        'kind', v_kind,
        'name', v_name,
        'unit_label', v_unit_label,
        'quantity', v_qty,
        'unit_price_cents', v_unit_price,
        'line_total_cents', v_line_total
      )
    );
  end loop;

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
  from jsonb_array_elements(v_resolved_items) as elem;

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

create or replace function public.cancel_order(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order public.orders%rowtype;
  v_item record;
  v_component record;
  v_product public.products%rowtype;
  v_restore integer;
  v_stock_map jsonb := '{}'::jsonb;
  v_product_id text;
  v_delta integer;
  v_now timestamptz := now();
  v_items jsonb;
begin
  if v_user_id is null then
    raise exception 'Faça login para cancelar o pedido.';
  end if;

  if not public.is_admin() then
    raise exception 'Apenas administradores podem cancelar pedidos.';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Pedido não encontrado.';
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'Este pedido já está cancelado.';
  end if;

  if v_order.status = 'completed' then
    raise exception 'Pedido baixado não pode ser cancelado.';
  end if;

  if v_order.status not in ('awaiting_pickup', 'ready_for_pickup') then
    raise exception 'Status do pedido não permite cancelamento.';
  end if;

  for v_item in
    select kind, item_ref, quantity
    from public.order_items
    where order_id = p_order_id
  loop
    if v_item.kind = 'product' then
      v_stock_map := jsonb_set(
        v_stock_map,
        array[v_item.item_ref],
        to_jsonb(coalesce((v_stock_map->>v_item.item_ref)::int, 0) + v_item.quantity)
      );
    elsif v_item.kind = 'basket' then
      for v_component in
        select product_id, quantity
        from public.basket_components
        where basket_id = v_item.item_ref
      loop
        v_restore := v_component.quantity * v_item.quantity;
        v_stock_map := jsonb_set(
          v_stock_map,
          array[v_component.product_id],
          to_jsonb(
            coalesce((v_stock_map->>v_component.product_id)::int, 0) + v_restore
          )
        );
      end loop;
    end if;
  end loop;

  for v_product_id, v_delta in
    select key, value::int from jsonb_each_text(v_stock_map)
  loop
    select * into v_product
    from public.products
    where id = v_product_id
    for update;

    if found then
      update public.products
      set
        stock_quantity = stock_quantity + v_delta,
        updated_at = v_now
      where id = v_product_id;
    end if;
  end loop;

  update public.orders
  set
    status = 'cancelled',
    updated_at = v_now,
    completed_at = null
  where id = p_order_id
  returning * into v_order;

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
  where oi.order_id = v_order.id;

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

revoke all on function public.cancel_order(uuid) from public;
grant execute on function public.cancel_order(uuid) to authenticated;
