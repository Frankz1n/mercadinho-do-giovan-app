import type { AppUser } from '@/features/auth/domain/auth';
import type { Order, OrderItem, OrderStatus } from '@/features/orders/domain/order';
import { readJson, writeJson } from '@/lib/storage';

const ORDERS_KEY = '@mercadinho/orders';

function createOrderCode(existingCodes: Set<string>) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  for (let attempt = 0; attempt < 40; attempt += 1) {
    let suffix = '';
    for (let index = 0; index < 6; index += 1) {
      suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    const code = `MG-${suffix}`;
    if (!existingCodes.has(code)) {
      return code;
    }
  }

  return `MG-${Date.now().toString(36).toUpperCase()}`;
}

export class OrdersRepository {
  async listOrders(): Promise<Order[]> {
    const orders = await readJson<Order[]>(ORDERS_KEY, []);
    return [...orders].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }

  async listOrdersByUser(userId: string): Promise<Order[]> {
    const orders = await this.listOrders();
    return orders.filter((order) => order.userId === userId);
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const orders = await this.listOrders();
    return orders.find((order) => order.id === orderId) ?? null;
  }

  async getOrderByCode(code: string): Promise<Order | null> {
    const normalized = code.trim().toUpperCase();
    const orders = await this.listOrders();
    return orders.find((order) => order.code === normalized) ?? null;
  }

  async placeOrder(input: {
    user: AppUser;
    items: readonly OrderItem[];
    notes?: string | null;
  }): Promise<Order> {
    if (input.items.length === 0) {
      throw new Error('Adicione itens ao carrinho antes de fechar o pedido.');
    }

    const orders = await this.listOrders();
    const existingCodes = new Set(orders.map((order) => order.code));
    const now = new Date().toISOString();
    const subtotalCents = input.items.reduce(
      (total, item) => total + item.lineTotalCents,
      0,
    );

    const order: Order = {
      id: `order-${Date.now()}`,
      code: createOrderCode(existingCodes),
      userId: input.user.id,
      customerName: input.user.name,
      customerEmail: input.user.email,
      customerPhone: input.user.phone,
      status: 'awaiting_pickup',
      items: input.items,
      subtotalCents,
      notes: input.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };

    await writeJson(ORDERS_KEY, [order, ...orders]);
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> {
    const orders = await this.listOrders();
    const index = orders.findIndex((order) => order.id === orderId);

    if (index < 0) {
      throw new Error('Pedido não encontrado.');
    }

    const now = new Date().toISOString();
    const current = orders[index];
    const next: Order = {
      ...current,
      status,
      updatedAt: now,
      completedAt: status === 'completed' ? now : current.completedAt,
    };

    const nextOrders = [...orders];
    nextOrders[index] = next;
    await writeJson(ORDERS_KEY, nextOrders);
    return next;
  }
}

export const ordersRepository = new OrdersRepository();
