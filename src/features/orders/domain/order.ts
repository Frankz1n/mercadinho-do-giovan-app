export type OrderStatus =
  | 'awaiting_pickup'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export type OrderItem = Readonly<{
  id: string;
  kind: 'product' | 'basket';
  name: string;
  unitLabel: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}>;

export type Order = Readonly<{
  id: string;
  code: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  items: readonly OrderItem[];
  subtotalCents: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}>;

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_pickup: 'Aguardando separação',
  ready_for_pickup: 'Pronto para retirada',
  completed: 'Pago e retirado',
  cancelled: 'Cancelado',
};
