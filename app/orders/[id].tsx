import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  AppButton,
  Screen,
  StoreHeader,
  StoreLoadingState,
  StoreMessage,
} from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/features/orders/domain/order';
import { useOrders } from '@/features/orders/orders-context';
import { formatCurrencyFromCents } from '@/lib/currency';
import { colors, radii, spacing, typography } from '@/theme';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const { getById, isLoading, updateStatus } = useOrders();
  const order = getById(id);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canView = order && (isAdmin || (user && order.userId === user.id));

  const onUpdateStatus = async (status: OrderStatus) => {
    if (!order) {
      return;
    }

    setActionError(null);
    setIsUpdating(true);
    try {
      await updateStatus(order.id, status);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Não foi possível atualizar o pedido.',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Screen>
      <StoreHeader title={isAdmin ? 'Detalhe do pedido' : 'Pedido'} />

      {isLoading ? (
        <StoreLoadingState />
      ) : !order || !canView ? (
        <StoreMessage
          description="Este pedido não foi encontrado ou você não tem acesso."
          title="Pedido indisponível"
        />
      ) : (
        <>
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Código de retirada</Text>
            <Text accessibilityRole="header" style={styles.code}>
              {order.code}
            </Text>
            <Text style={styles.status}>{ORDER_STATUS_LABEL[order.status]}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text style={styles.customerName}>{order.customerName}</Text>
            <Text style={styles.copy}>{order.customerPhone}</Text>
            <Text style={styles.copy}>{order.customerEmail}</Text>
          </View>

          {isAdmin ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Retirada</Text>
              <Text style={styles.copy}>
                Confira o código com o cliente, receba o pagamento e dê baixa no
                pedido.
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Como retirar</Text>
              <Text style={styles.copy}>
                Apresente este código no Mercadinho do Giovan. O pagamento é feito
                na loja; depois o pedido é baixado no sistema.
              </Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Itens</Text>
            {order.items.map((item) => (
              <View key={`${item.kind}:${item.id}`} style={styles.item}>
                <View style={styles.itemCopy}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.quantity} × {formatCurrencyFromCents(item.unitPriceCents)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatCurrencyFromCents(item.lineTotalCents)}
                </Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrencyFromCents(order.subtotalCents)}
              </Text>
            </View>
          </View>

          {order.notes ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Observação</Text>
              <Text style={styles.copy}>{order.notes}</Text>
            </View>
          ) : null}

          {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

          {isAdmin ? (
            <>
              {order.status === 'awaiting_pickup' ? (
                <AppButton
                  disabled={isUpdating}
                  label={
                    isUpdating
                      ? 'Separando…'
                      : 'Pedido separado · pronto para retirada'
                  }
                  onPress={() => void onUpdateStatus('ready_for_pickup')}
                />
              ) : null}
              {order.status === 'ready_for_pickup' ? (
                <AppButton
                  disabled={isUpdating}
                  label={
                    isUpdating
                      ? 'Dando baixa…'
                      : 'Recebi o pagamento · dar baixa'
                  }
                  onPress={() => void onUpdateStatus('completed')}
                />
              ) : null}
              <AppButton
                label="Voltar à fila"
                onPress={() => router.replace('/admin/orders')}
                variant="secondary"
              />
            </>
          ) : (
            <>
              <AppButton href="/orders" label="Ver todos os pedidos" variant="secondary" />
              <AppButton href="/(shop)/home" label="Continuar comprando" />
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeCard: {
    alignItems: 'center',
    backgroundColor: colors.brand.deep,
    borderRadius: radii.lg,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  codeLabel: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceMedium,
    opacity: 0.85,
  },
  code: {
    color: colors.brand.yellow,
    fontFamily: typography.brandSemibold,
    fontSize: 36,
    letterSpacing: 2,
  },
  status: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceRegular,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 16,
  },
  customerName: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 16,
  },
  copy: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    lineHeight: 21,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  itemCopy: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
  },
  itemMeta: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
  },
  itemTotal: {
    color: colors.brand.deep,
    fontFamily: typography.interfaceSemibold,
  },
  totalRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceMedium,
  },
  totalValue: {
    color: colors.brand.deep,
    fontFamily: typography.interfaceSemibold,
    fontSize: 20,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.interfaceMedium,
  },
});
