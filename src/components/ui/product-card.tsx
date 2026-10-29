import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProductVisual } from '@/components/ui/product-visual';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import type { Product } from '@/features/catalog/domain/catalog';
import { formatCurrencyFromCents } from '@/lib/currency';
import { colors, radii, shadows, spacing, typography } from '@/theme';

type ProductCardProps = {
  onAdd: () => void;
  onDecrement: () => void;
  onOpen: () => void;
  product: Product;
  quantity: number;
};

export function ProductCard({
  onAdd,
  onDecrement,
  onOpen,
  product,
  quantity,
}: ProductCardProps) {
  const isAvailable = product.stockQuantity > 0;

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" onPress={onOpen} style={styles.productArea}>
        <ProductVisual
          imageUrl={product.imageUrl}
          productId={product.id}
          visual={product.visual}
        />
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{product.unitLabel}</Text>
      </Pressable>

      {quantity > 0 ? (
        <View style={styles.footerStacked}>
          <Text style={styles.price}>{formatCurrencyFromCents(product.priceCents)}</Text>
          <QuantityStepper
            compact
            isAddDisabled={quantity >= product.stockQuantity}
            onAdd={onAdd}
            onDecrement={onDecrement}
            quantity={quantity}
          />
        </View>
      ) : (
        <View style={styles.footerRow}>
          <Text style={styles.price}>{formatCurrencyFromCents(product.priceCents)}</Text>
          <Pressable
            accessibilityLabel={`Adicionar ${product.name}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isAvailable }}
            disabled={!isAvailable}
            onPress={onAdd}
            style={[styles.addButton, !isAvailable && styles.disabled]}
          >
            <Ionicons color={colors.brand.deep} name="add" size={22} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.sm,
    ...shadows.card,
  },
  productArea: {
    gap: spacing.xs,
  },
  name: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 14,
    minHeight: 36,
  },
  unit: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    minHeight: 36,
  },
  footerStacked: {
    gap: spacing.xs,
  },
  price: {
    color: colors.brand.deep,
    fontFamily: typography.interfaceSemibold,
    fontSize: 15,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.brand.yellow,
    borderRadius: radii.md,
    flexShrink: 0,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  disabled: {
    opacity: 0.38,
  },
});
