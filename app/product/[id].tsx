import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  AppButton,
  ProductVisual,
  QuantityStepper,
  Screen,
  StoreHeader,
  StoreLoadingState,
  StoreMessage,
} from '@/components/ui';
import { useCart } from '@/features/cart/cart-context';
import { useProduct } from '@/features/catalog/data/catalog-queries';
import { formatCurrencyFromCents } from '@/lib/currency';
import { colors, radii, spacing, typography } from '@/theme';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productQuery = useProduct(id);
  const { addItem, decrementItem, getItemQuantity } = useCart();
  const product = productQuery.data;
  const quantity = product ? getItemQuantity('product', product.id) : 0;

  return (
    <Screen>
      <StoreHeader title="Detalhe do produto" />

      {productQuery.isPending ? (
        <StoreLoadingState />
      ) : productQuery.isError ? (
        <StoreMessage
          description="Não foi possível carregar este produto."
          onRetry={() => void productQuery.refetch()}
          title="Falha ao carregar"
          variant="error"
        />
      ) : !product ? (
        <StoreMessage
          description="O item solicitado não está disponível no catálogo."
          title="Produto não encontrado"
        />
      ) : (
        <>
          <View style={styles.card}>
            <ProductVisual
              imageUrl={product.imageUrl}
              productId={product.id}
              visual={product.visual}
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {product.stockQuantity > 0
                  ? `Disponível · ${product.stockQuantity} un.`
                  : 'Sem estoque'}
              </Text>
            </View>
            <Text accessibilityRole="header" style={styles.name}>
              {product.name}
            </Text>
            <Text style={styles.unit}>{product.unitLabel}</Text>
            <Text style={styles.description}>{product.description}</Text>
            <Text style={styles.price}>
              {formatCurrencyFromCents(product.priceCents)}
            </Text>
            {quantity > 0 ? (
              <QuantityStepper
                isAddDisabled={quantity >= product.stockQuantity}
                onAdd={() => addItem('product', product.id)}
                onDecrement={() => decrementItem('product', product.id)}
                quantity={quantity}
              />
            ) : (
              <AppButton
                disabled={product.stockQuantity === 0}
                label={
                  product.stockQuantity > 0 ? 'Adicionar ao carrinho' : 'Sem estoque'
                }
                onPress={() => {
                  if (product.stockQuantity > 0) {
                    addItem('product', product.id);
                  }
                }}
              />
            )}
          </View>
          <AppButton
            href="/(shop)/categories"
            label="Voltar aos produtos"
            variant="secondary"
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceMedium,
    fontSize: 12,
  },
  name: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 24,
  },
  unit: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
  },
  description: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    lineHeight: 21,
  },
  price: {
    color: colors.brand.deep,
    fontFamily: typography.interfaceSemibold,
    fontSize: 24,
  },
});
