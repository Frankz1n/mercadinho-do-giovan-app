import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { QuantityStepper } from '@/components/ui/quantity-stepper';
import type { Basket, Product } from '@/features/catalog/domain/catalog';
import { formatCurrencyFromCents } from '@/lib/currency';
import {
  colors,
  minimumTouchTarget,
  radii,
  shadows,
  spacing,
  typography,
} from '@/theme';

type BasketCardProps = {
  basket: Basket;
  onAdd: () => void;
  onDecrement: () => void;
  products: ReadonlyMap<string, Product>;
  quantity: number;
};

const benefits = [
  'Produtos essenciais do dia a dia',
  'Qualidade com economia',
  'Ideal para a família',
];

export function BasketCard({
  basket,
  onAdd,
  onDecrement,
  products,
  quantity,
}: BasketCardProps) {
  const isAvailable = basket.components.every((component) => {
    const product = products.get(component.productId);
    return product && product.stockQuantity >= component.quantity;
  });

  return (
    <View style={styles.container}>
      <Image
        contentFit="cover"
        source={{ uri: basket.imageUrl }}
        style={styles.hero}
        transition={200}
      />
      <View style={styles.body}>
        <Text style={styles.name}>{basket.name}</Text>
        <Text style={styles.price}>{formatCurrencyFromCents(basket.priceCents)}</Text>
        <Text style={styles.description}>{basket.description}</Text>

        <View style={styles.benefits}>
          {benefits.map((benefit) => (
            <View key={benefit} style={styles.benefitRow}>
              <Ionicons color={colors.brand.yellow} name="checkmark-circle" size={18} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.seeItems}>
          <Text style={styles.seeItemsText}>Ver itens da cesta</Text>
        </Pressable>

        {!isAvailable ? (
          <Text style={styles.unavailable}>
            Um item da cesta está sem estoque no momento.
          </Text>
        ) : null}

        {quantity > 0 ? (
          <QuantityStepper
            isAddDisabled={!isAvailable}
            onAdd={onAdd}
            onDecrement={onDecrement}
            quantity={quantity}
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !isAvailable }}
            disabled={!isAvailable}
            onPress={onAdd}
            style={[styles.addButton, !isAvailable && styles.disabled]}
          >
            <Ionicons color={colors.brand.deep} name="cart-outline" size={20} />
            <Text style={styles.addLabel}>Adicionar cesta</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brand.primary,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  hero: {
    backgroundColor: colors.brand.deep,
    height: 168,
    width: '100%',
  },
  body: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  name: {
    color: colors.text.inverse,
    fontFamily: typography.brandSemibold,
    fontSize: 22,
  },
  price: {
    color: colors.brand.yellow,
    fontFamily: typography.interfaceSemibold,
    fontSize: 26,
  },
  description: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: typography.interfaceRegular,
    lineHeight: 20,
  },
  benefits: {
    gap: spacing.xs,
  },
  benefitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  benefitText: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceRegular,
    fontSize: 13,
  },
  seeItems: {
    alignSelf: 'flex-start',
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  seeItemsText: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceMedium,
    fontSize: 13,
  },
  unavailable: {
    color: colors.brand.yellow,
    fontFamily: typography.interfaceMedium,
    fontSize: 12,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.brand.yellow,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: minimumTouchTarget,
    paddingHorizontal: spacing.md,
  },
  addLabel: {
    color: colors.brand.deep,
    fontFamily: typography.interfaceSemibold,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.38,
  },
});
