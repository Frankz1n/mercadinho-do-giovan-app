import type { AppUser } from '@/features/auth/domain/auth';
import { requestPush } from '@/features/notifications/push-api';
import type { Order, OrderItem, OrderStatus } from '@/features/orders/domain/order';
import type { Json } from '@/lib/database.types';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';

type OrderRow = {
  id: string;
  code: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: OrderStatus;
  subtotal_cents: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  order_items:
    | {
        item_ref: string;
        kind: 'product' | 'basket';
        name: string;
        unit_label: string;
        quantity: number;
        unit_price_cents: number;
        line_total_cents: number;
      }[]
    | null;
};

function mapOrder(row: OrderRow): Order {
  const items: OrderItem[] = (row.order_items ?? []).map((item) => ({
    id: item.item_ref,
    kind: item.kind,
    name: item.name,
    unitLabel: item.unit_label,
    quantity: item.quantity,
    unitPriceCents: item.unit_price_cents,
    lineTotalCents: item.line_total_cents,
  }));

  return {
    id: row.id,
    code: row.code,
    userId: row.user_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    status: row.status,
    items,
    subtotalCents: row.subtotal_cents,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

function mapOrderFromRpc(payload: Record<string, unknown>): Order {
  const items = Array.isArray(payload.items)
    ? (payload.items as Record<string, unknown>[]).map(
        (item): OrderItem => ({
          id: String(item.id),
          kind: item.kind === 'basket' ? 'basket' : 'product',
          name: String(item.name ?? ''),
          unitLabel: String(item.unitLabel ?? ''),
          quantity: Number(item.quantity ?? 0),
          unitPriceCents: Number(item.unitPriceCents ?? 0),
          lineTotalCents: Number(item.lineTotalCents ?? 0),
        }),
      )
    : [];

  return {
    id: String(payload.id),
    code: String(payload.code),
    userId: String(payload.userId),
    customerName: String(payload.customerName ?? ''),
    customerEmail: String(payload.customerEmail ?? ''),
    customerPhone: String(payload.customerPhone ?? ''),
    status: (payload.status as OrderStatus) ?? 'awaiting_pickup',
    items,
    subtotalCents: Number(payload.subtotalCents ?? 0),
    notes: (payload.notes as string | null) ?? null,
    createdAt: String(payload.createdAt),
    updatedAt: String(payload.updatedAt),
    completedAt: (payload.completedAt as string | null) ?? null,
  };
}

const ORDER_SELECT =
  'id, code, user_id, customer_name, customer_email, customer_phone, status, subtotal_cents, notes, created_at, updated_at, completed_at, order_items(item_ref, kind, name, unit_label, quantity, unit_price_cents, line_total_cents)';

export class OrdersRepository {
  async listOrders(): Promise<Order[]> {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as OrderRow[]).map(mapOrder);
  }

  async listOrdersByUser(userId: string): Promise<Order[]> {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as OrderRow[]).map(mapOrder);
  }

  async getOrder(orderId: string): Promise<Order | null> {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapOrder(data as OrderRow) : null;
  }

  async getOrderByCode(code: string): Promise<Order | null> {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapOrder(data as OrderRow) : null;
  }

  async placeOrder(input: {
    user: AppUser;
    items: readonly OrderItem[];
    notes?: string | null;
  }): Promise<Order> {
    assertSupabaseConfigured();

    if (input.items.length === 0) {
      throw new Error('Adicione itens ao carrinho antes de fechar o pedido.');
    }

    const payload: Json = input.items.map((item) => ({
      id: item.id,
      kind: item.kind,
      name: item.name,
      unit_label: item.unitLabel,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      line_total_cents: item.lineTotalCents,
    }));

    const { data, error } = await supabase.rpc('place_order', {
      p_items: payload,
      p_notes: input.notes?.trim() || null,
    });

    if (error || !data) {
      throw new Error(error?.message ?? 'Não foi possível fechar o pedido.');
    }

    const order = mapOrderFromRpc(data as Record<string, unknown>);

    void requestPush({
      audience: 'admins',
      title: 'Novo pedido na fila',
      body: `${order.code} · ${order.customerName}`,
      data: { orderId: order.id, type: 'new_order' },
    });

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    assertSupabaseConfigured();

    if (status === 'cancelled') {
      return this.cancelOrder(orderId);
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: now,
        completed_at: status === 'completed' ? now : null,
      })
      .eq('id', orderId)
      .select(ORDER_SELECT)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Pedido não encontrado.');
    }

    const order = mapOrder(data as OrderRow);

    if (status === 'ready_for_pickup') {
      void requestPush({
        audience: 'user',
        userId: order.userId,
        title: 'Pedido pronto para retirada',
        body: `Seu pedido ${order.code} já está separado no Mercadinho do Giovan.`,
        data: { orderId: order.id, type: 'order_ready' },
      });
    }

    return order;
  }

  async cancelOrder(orderId: string): Promise<Order> {
    assertSupabaseConfigured();

    const { data, error } = await supabase.rpc('cancel_order', {
      p_order_id: orderId,
    });

    if (error || !data) {
      throw new Error(error?.message ?? 'Não foi possível cancelar o pedido.');
    }

    return mapOrderFromRpc(data as Record<string, unknown>);
  }
}

export const ordersRepository = new OrdersRepository();
