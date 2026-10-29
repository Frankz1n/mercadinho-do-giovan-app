import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  AppButton,
  CartItemRow,
  ShopScreen,
  StoreLoadingState,
  StoreMessage,
} from '@/components/ui';
import { useResolvedCart } from '@/features/cart/use-resolved-cart';
import { formatCurrencyFromCents } from '@/lib/currency';
import { colors, radii, shadows, spacing, typography } from '@/theme';

export default function CartScreen() {
  const {
    addItem,
    clearCart,
    decrementItem,
    items,
    removeItem,
    removeUnavailableItems,
    resolvedItems,
    subtotalCents,
    unavailableItems,
    isError,
    isPending,
  } = useResolvedCart();

  const onClearCart = () => {
    Alert.alert('Limpar carrinho', 'Remover todos os itens do carrinho?', [
      { text: 'Manter', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: clearCart },
    ]);
  };

  return (
    <ShopScreen title="Carrinho">
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.title}>
          Meu carrinho
        </Text>
        {items.length > 0 ? (
          <AppButton label="Limpar" onPress={onClearCart} variant="secondary" />
        ) : null}
      </View>

      {isPending ? (
        <StoreLoadingState />
      ) : isError ? (
        <StoreMessage
          description="Não foi possível carregar os itens do carrinho."
          title="Falha ao carregar"
          variant="error"
        />
      ) : resolvedItems.length === 0 && unavailableItems.length === 0 ? (
        <StoreMessage
          description="Adicione produtos ou cestas para continuar."
          title="Seu carrinho está vazio"
        />
      ) : (
        <>
          {unavailableItems.length > 0 ? (
            <StoreMessage
              actionLabel="Remover indisponíveis"
              description={`${unavailableItems.length} item(ns) não estão mais disponíveis no catálogo.`}
              onRetry={removeUnavailableItems}
              title="Itens indisponíveis"
              variant="error"
            />
          ) : null}

          {resolvedItems.length > 0 ? (
            <>
              <View style={styles.list}>
                {resolvedItems.map((item) => (
                  <CartItemRow
                    imageSource={item.imageSource}
                    key={`${item.kind}:${item.id}`}
                    name={item.name}
                    onAdd={() => addItem(item.kind, item.id)}
                    onDecrement={() => decrementItem(item.kind, item.id)}
                    onRemove={() => removeItem(item.kind, item.id)}
                    priceCents={item.priceCents}
                    quantity={item.quantity}
                    unitLabel={item.unitLabel}
                  />
                ))}
              </View>

              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrencyFromCents(subtotalCents)}
                  </Text>
                </View>

                <Text style={styles.fulfillmentTitle}>Retirada na loja</Text>
                <Text style={styles.optionMeta}>
                  Pagamento na retirada · sem taxa de entrega por enquanto.
                </Text>

                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrencyFromCents(subtotalCents)}
                  </Text>
                </View>
                <AppButton
                  disabled={unavailableItems.length > 0}
                  href="/checkout"
                  label="Continuar pedido"
                />
              </View>
            </>
          ) : null}
        </>
      )}
    </ShopScreen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 25,
  },
  list: {
    gap: spacing.sm,
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.card,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceMedium,
  },
  summaryValue: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
  },
  fulfillmentTitle: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 15,
  },
  optionMeta: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  totalRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 16,
  },
  totalValue: {
    color: colors.brand.deep,
    fontFamily: typography.interfaceSemibold,
    fontSize: 22,
  },
});
