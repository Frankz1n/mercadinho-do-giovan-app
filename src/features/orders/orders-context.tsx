import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/features/auth/auth-context';
import type { AppUser } from '@/features/auth/domain/auth';
import { ordersRepository } from '@/features/orders/data/orders-repository';
import type { Order, OrderItem, OrderStatus } from '@/features/orders/domain/order';

type OrdersContextValue = {
  orders: Order[];
  isLoading: boolean;
  /** Pedidos novos na fila (aguardando separação) — badge do admin. */
  newOrdersCount: number;
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
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    const nextOrders = await ordersRepository.listOrders();
    setOrders(nextOrders);
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        await refresh();
      } catch {
        if (isMounted) {
          setOrders([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
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

  const newOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'awaiting_pickup').length,
    [orders],
  );

  const value = useMemo(
    () => ({
      orders,
      isLoading,
      newOrdersCount,
      refresh,
      placeOrder,
      updateStatus,
      getById,
    }),
    [orders, isLoading, newOrdersCount, refresh, placeOrder, updateStatus, getById],
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
