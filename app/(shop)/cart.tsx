import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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

type Fulfillment = 'pickup' | 'delivery';

export default function CartScreen() {
  const {
    addItem,
    clearCart,
    decrementItem,
    items,
    removeItem,
    resolvedItems,
    subtotalCents,
    isError,
    isPending,
  } = useResolvedCart();
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup');

  return (
    <ShopScreen title="Carrinho">
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.title}>
          Meu carrinho
        </Text>
        {items.length > 0 ? (
          <AppButton label="Limpar" onPress={clearCart} variant="secondary" />
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
      ) : resolvedItems.length === 0 ? (
        <StoreMessage
          description="Adicione produtos ou cestas para continuar."
          title="Seu carrinho está vazio"
        />
      ) : (
        <>
          <View style={styles.list}>
            {resolvedItems.map((item) => (
              <CartItemRow
                imageUrl={item.imageUrl}
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

            <Text style={styles.fulfillmentTitle}>Como deseja receber?</Text>
            <Pressable
              onPress={() => setFulfillment('pickup')}
              style={[
                styles.option,
                fulfillment === 'pickup' && styles.optionSelected,
              ]}
            >
              <View
                style={[
                  styles.radio,
                  fulfillment === 'pickup' && styles.radioSelected,
                ]}
              />
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>Retirar na loja</Text>
                <Text style={styles.optionMeta}>Sem taxa · mais rápido</Text>
              </View>
            </Pressable>
            <Pressable disabled style={[styles.option, styles.optionDisabled]}>
              <View style={styles.radio} />
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>Entrega</Text>
                <Text style={styles.optionMeta}>Em breve</Text>
              </View>
            </Pressable>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrencyFromCents(subtotalCents)}
              </Text>
            </View>
            <AppButton href="/checkout" label="Continuar pedido" />
          </View>
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
  option: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  optionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: colors.brand.primary,
  },
  optionDisabled: {
    opacity: 0.55,
  },
  radio: {
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 18,
    width: 18,
  },
  radioSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
  },
  optionMeta: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
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
