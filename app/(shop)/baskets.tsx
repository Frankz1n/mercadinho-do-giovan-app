import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  BasketCard,
  ShopScreen,
  StoreLoadingState,
  StoreMessage,
} from '@/components/ui';
import { useCart } from '@/features/cart/cart-context';
import {
  useBaskets,
  useProductsByIds,
} from '@/features/catalog/data/catalog-queries';
import { colors, spacing, typography } from '@/theme';

export default function BasketsScreen() {
  const basketsQuery = useBaskets();
  const productIds = useMemo(
    () =>
      Array.from(
        new Set(
          basketsQuery.data?.flatMap((basket) =>
            basket.components.map((component) => component.productId),
          ) ?? [],
        ),
      ),
    [basketsQuery.data],
  );
  const productsQuery = useProductsByIds(productIds);
  const productMap = useMemo(
    () => new Map(productsQuery.data?.map((product) => [product.id, product]) ?? []),
    [productsQuery.data],
  );
  const { addItem, decrementItem, getItemQuantity } = useCart();
  const isPending = basketsQuery.isPending || productsQuery.isPending;
  const isError = basketsQuery.isError || productsQuery.isError;

  return (
    <ShopScreen title="Cestas">
      <View style={styles.intro}>
        <Text accessibilityRole="header" style={styles.title}>
          Cestas prontas
        </Text>
        <Text style={styles.subtitle}>
          Monte a compra rápido com kits pensados para o dia a dia.
        </Text>
      </View>

      {isPending ? (
        <StoreLoadingState />
      ) : isError ? (
        <StoreMessage
          description="Não foi possível carregar as cestas."
          onRetry={() => {
            void basketsQuery.refetch();
            void productsQuery.refetch();
          }}
          title="Falha ao carregar"
          variant="error"
        />
      ) : (
        <View style={styles.list}>
          {basketsQuery.data?.map((basket) => (
            <BasketCard
              basket={basket}
              key={basket.id}
              onAdd={() => addItem('basket', basket.id)}
              onDecrement={() => decrementItem('basket', basket.id)}
              products={productMap}
              quantity={getItemQuantity('basket', basket.id)}
            />
          ))}
        </View>
      )}
    </ShopScreen>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: spacing.xxs,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 25,
  },
  subtitle: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    lineHeight: 20,
  },
  list: {
    gap: spacing.md,
  },
});
