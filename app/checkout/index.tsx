import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  AppButton,
  Screen,
  StoreHeader,
  StoreLoadingState,
  StoreMessage,
  TextField,
} from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { useResolvedCart } from '@/features/cart/use-resolved-cart';
import {
  catalogQueryKeys,
  useBaskets,
  useProductsByIds,
} from '@/features/catalog/data/catalog-queries';
import { useToast } from '@/features/feedback/toast-context';
import { buildStockAdjustmentsFromOrderItems } from '@/features/orders/build-stock-adjustments';
import type { OrderItem } from '@/features/orders/domain/order';
import { useOrders } from '@/features/orders/orders-context';
import { formatCurrencyFromCents } from '@/lib/currency';
import { colors, radii, spacing, typography } from '@/theme';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { clearCart, isPending, resolvedItems, subtotalCents } = useResolvedCart();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const basketsQuery = useBaskets();

  const productIdsForStock = useMemo(() => {
    const ids = new Set<string>();
    for (const item of resolvedItems) {
      if (item.kind === 'product') {
        ids.add(item.id);
        continue;
      }
      const basket = basketsQuery.data?.find((entry) => entry.id === item.id);
      basket?.components.forEach((component) => ids.add(component.productId));
    }
    return [...ids];
  }, [basketsQuery.data, resolvedItems]);

  const productsQuery = useProductsByIds(productIdsForStock);

  const onConfirm = async () => {
    setError(null);

    if (!user) {
      router.push({
        pathname: '/(auth)/login',
        params: { returnTo: '/checkout' },
      });
      return;
    }

    if (resolvedItems.length === 0) {
      setError('Seu carrinho está vazio.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = resolvedItems.map((item) => ({
        id: item.id,
        kind: item.kind,
        name: item.name,
        unitLabel: item.unitLabel,
        quantity: item.quantity,
        unitPriceCents: item.priceCents,
        lineTotalCents: item.priceCents * item.quantity,
      }));

      const productsById = new Map(
        (productsQuery.data ?? []).map((product) => [product.id, product]),
      );
      const basketsById = new Map(
        (basketsQuery.data ?? []).map((basket) => [basket.id, basket]),
      );

      const adjustments = buildStockAdjustmentsFromOrderItems({
        items: orderItems,
        productsById,
        basketsById,
        multiplier: -1,
      });

      for (const adjustment of adjustments) {
        const product = productsById.get(adjustment.productId);
        if (product && product.stockQuantity + adjustment.quantityDelta < 0) {
          throw new Error(
            `Estoque insuficiente para ${product.name}. Ajuste as quantidades.`,
          );
        }
      }

      // Estoque + pedido são atômicos no RPC place_order no Supabase.
      const order = await placeOrder({
        user,
        items: orderItems,
        notes,
      });
      clearCart();
      showToast(`Pedido feito · código ${order.code}`, 'success');
      await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      router.replace({
        pathname: '/orders/[id]',
        params: { id: order.id },
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível fechar o pedido.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <StoreHeader title="Fechar pedido" />
      <Text accessibilityRole="header" style={styles.title}>
        Confirmar retirada
      </Text>
      <Text style={styles.subtitle}>
        Sem pagamento no app. Ao fechar, você recebe um código único para retirar e
        pagar no Mercadinho do Giovan.
      </Text>

      {!user ? (
        <StoreMessage
          description="Faça login ou crie uma conta para gerar o código do pedido."
          title="Entre para continuar"
        />
      ) : null}

      {isPending ? (
        <StoreLoadingState />
      ) : resolvedItems.length === 0 ? (
        <StoreMessage
          description="Adicione itens antes de fechar o pedido."
          title="Carrinho vazio"
        />
      ) : (
        <>
          <View style={styles.card}>
            {resolvedItems.map((item) => (
              <View key={`${item.kind}:${item.id}`} style={styles.item}>
                <View style={styles.itemCopy}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    {item.quantity} × {formatCurrencyFromCents(item.priceCents)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatCurrencyFromCents(item.priceCents * item.quantity)}
                </Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a pagar na loja</Text>
              <Text style={styles.totalValue}>
                {formatCurrencyFromCents(subtotalCents)}
              </Text>
            </View>
          </View>

          <TextField
            autoCapitalize="sentences"
            label="Observação (opcional)"
            maxLength={500}
            onChangeText={setNotes}
            placeholder="Ex.: sem cebola na cesta"
            value={notes}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {user ? (
            <AppButton
              disabled={isSubmitting}
              label={isSubmitting ? 'Gerando código…' : 'Fechar pedido e gerar código'}
              onPress={() => void onConfirm()}
            />
          ) : (
            <AppButton href="/(auth)/login" label="Entrar para fechar pedido" />
          )}
        </>
      )}

      <AppButton href="/(shop)/cart" label="Voltar ao carrinho" variant="secondary" />
    </Screen>
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
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  item: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: spacing.sm,
  },
  itemCopy: {
    flex: 1,
    gap: spacing.xxs,
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceMedium,
  },
  totalValue: {
    color: colors.brand.deep,
    fontFamily: typography.interfaceSemibold,
    fontSize: 21,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.interfaceMedium,
  },
});
