import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { formatCurrencyFromCents } from '@/lib/currency';
import {
  colors,
  minimumTouchTarget,
  radii,
  shadows,
  spacing,
  typography,
} from '@/theme';

type CartItemRowProps = {
  imageSource?: ImageSource | null;
  name: string;
  onAdd: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  priceCents: number;
  quantity: number;
  unitLabel: string;
};

export function CartItemRow({
  imageSource,
  name,
  onAdd,
  onDecrement,
  onRemove,
  priceCents,
  quantity,
  unitLabel,
}: CartItemRowProps) {
  return (
    <View style={styles.container}>
      {imageSource ? (
        <Image contentFit="cover" source={imageSource} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imageFallback]}>
          <Ionicons color={colors.brand.primary} name="basket-outline" size={24} />
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.heading}>
          <View style={styles.copy}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.unit}>{unitLabel}</Text>
          </View>
          <Pressable
            accessibilityLabel={`Remover ${name}`}
            accessibilityRole="button"
            onPress={onRemove}
            style={styles.removeButton}
          >
            <Ionicons color={colors.danger} name="trash-outline" size={20} />
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={styles.totalPrice}>
            {formatCurrencyFromCents(priceCents * quantity)}
          </Text>
          <QuantityStepper onAdd={onAdd} onDecrement={onDecrement} quantity={quantity} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    ...shadows.card,
  },
  image: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    height: 72,
    width: 72,
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: spacing.sm,
  },
  heading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 15,
  },
  unit: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
  },
  removeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minimumTouchTarget - 8,
    minWidth: minimumTouchTarget - 8,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalPrice: {
    color: colors.brand.deep,
    fontFamily: typography.interfaceSemibold,
    fontSize: 17,
  },
});
