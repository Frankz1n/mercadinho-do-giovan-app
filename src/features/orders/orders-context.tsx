import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AppUser } from '@/features/auth/domain/auth';
import { ordersRepository } from '@/features/orders/data/orders-repository';
import type { Order, OrderItem, OrderStatus } from '@/features/orders/domain/order';

type OrdersContextValue = {
  orders: Order[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  placeOrder: (input: {
    user: AppUser;
    items: readonly OrderItem[];
    notes?: string | null;
  }) => Promise<Order>;
  updateStatus: (orderId: string, status: OrderStatus) => Promise<Order>;
  getById: (orderId: string) => Order | undefined;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const nextOrders = await ordersRepository.listOrders();
    setOrders(nextOrders);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refresh();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refresh]);

  const placeOrder = useCallback(
    async (input: {
      user: AppUser;
      items: readonly OrderItem[];
      notes?: string | null;
    }) => {
      const order = await ordersRepository.placeOrder(input);
      await refresh();
      return order;
    },
    [refresh],
  );

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const order = await ordersRepository.updateOrderStatus(orderId, status);
      await refresh();
      return order;
    },
    [refresh],
  );

  const getById = useCallback(
    (orderId: string) => orders.find((order) => order.id === orderId),
    [orders],
  );

  const value = useMemo(
    () => ({
      orders,
      isLoading,
      refresh,
      placeOrder,
      updateStatus,
      getById,
    }),
    [orders, isLoading, refresh, placeOrder, updateStatus, getById],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders deve ser usado dentro de OrdersProvider.');
  }
  return context;
}
