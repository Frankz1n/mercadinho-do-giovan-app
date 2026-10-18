import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AdminScreen,
  AppButton,
  StoreLoadingState,
  StoreMessage,
} from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/features/orders/domain/order';
import { useOrders } from '@/features/orders/orders-context';
import { formatCurrencyFromCents } from '@/lib/currency';
import { colors, radii, shadows, spacing, typography } from '@/theme';

const filters: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Fila', value: 'awaiting_pickup' },
  { label: 'Baixados', value: 'completed' },
  { label: 'Todos', value: 'all' },
];

export default function AdminOrdersScreen() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const { orders, isLoading, updateStatus } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('awaiting_pickup');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthLoading && (!user || !isAdmin)) {
    return <Redirect href="/(auth)/login" />;
  }

  const visibleOrders =
    filter === 'all' ? orders : orders.filter((order) => order.status === filter);

  const onComplete = async (orderId: string) => {
    setError(null);
    setBusyId(orderId);
    try {
      await updateStatus(orderId, 'completed');
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : 'Não foi possível dar baixa.',
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminScreen title="Pedidos">
      <Text accessibilityRole="header" style={styles.title}>
        Fila de retirada
      </Text>
      <Text style={styles.subtitle}>
        Confira o código com o cliente, receba o pagamento e dê baixa no pedido.
      </Text>

      <View style={styles.filters}>
        {filters.map((entry) => (
          <Pressable
            key={entry.value}
            onPress={() => setFilter(entry.value)}
            style={[styles.chip, filter === entry.value && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, filter === entry.value && styles.chipTextActive]}
            >
              {entry.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading || isAuthLoading ? (
        <StoreLoadingState />
      ) : visibleOrders.length === 0 ? (
        <StoreMessage
          description="Quando um cliente fechar o pedido, o código aparece aqui."
          title="Nenhum pedido nesta fila"
        />
      ) : (
        <View style={styles.list}>
          {visibleOrders.map((order) => (
            <View key={order.id} style={styles.card}>
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/orders/[id]', params: { id: order.id } })
                }
              >
                <View style={styles.row}>
                  <Text style={styles.code}>{order.code}</Text>
                  <Text style={styles.status}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </Text>
                </View>
                <Text style={styles.customer}>
                  {order.customerName} · {order.customerPhone}
                </Text>
                <Text style={styles.meta}>
                  {order.items.length} itens ·{' '}
                  {formatCurrencyFromCents(order.subtotalCents)}
                </Text>
                <Text style={styles.itemsPreview}>
                  {order.items
                    .slice(0, 3)
                    .map((item) => `${item.quantity}× ${item.name}`)
                    .join(' · ')}
                  {order.items.length > 3 ? '…' : ''}
                </Text>
              </Pressable>

              {order.status === 'awaiting_pickup' ? (
                <AppButton
                  disabled={busyId === order.id}
                  label={
                    busyId === order.id
                      ? 'Baixando…'
                      : 'Recebi o pagamento · dar baixa'
                  }
                  onPress={() => void onComplete(order.id)}
                />
              ) : null}
            </View>
          ))}
        </View>
      )}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 25,
  },
  subtitle: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    lineHeight: 21,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.brand.deep,
    borderColor: colors.brand.deep,
  },
  chipText: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceMedium,
  },
  chipTextActive: {
    color: colors.text.inverse,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.interfaceMedium,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.card,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  code: {
    color: colors.brand.deep,
    fontFamily: typography.brandSemibold,
    fontSize: 20,
  },
  status: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceMedium,
    fontSize: 12,
  },
  customer: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
    marginTop: spacing.xs,
  },
  meta: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 13,
  },
  itemsPreview: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
});
