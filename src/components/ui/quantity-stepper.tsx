import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, minimumTouchTarget, radii, spacing, typography } from '@/theme';

type QuantityStepperProps = {
  compact?: boolean;
  isAddDisabled?: boolean;
  /** Contraste para fundos escuros (ex.: card de cesta). */
  inverse?: boolean;
  onAdd: () => void;
  onDecrement: () => void;
  quantity: number;
};

export function QuantityStepper({
  compact = false,
  inverse = false,
  isAddDisabled = false,
  onAdd,
  onDecrement,
  quantity,
}: QuantityStepperProps) {
  const iconColor = inverse ? colors.brand.deep : colors.brand.primary;

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        inverse && styles.containerInverse,
      ]}
    >
      <Pressable
        accessibilityLabel="Diminuir quantidade"
        accessibilityRole="button"
        onPress={onDecrement}
        style={[styles.button, compact && styles.buttonCompact]}
      >
        <Ionicons color={iconColor} name="remove" size={compact ? 16 : 20} />
      </Pressable>
      <Text
        accessibilityLabel={`Quantidade ${quantity}`}
        style={[
          styles.quantity,
          compact && styles.quantityCompact,
          inverse && styles.quantityInverse,
        ]}
      >
        {quantity}
      </Text>
      <Pressable
        accessibilityLabel="Aumentar quantidade"
        accessibilityRole="button"
        accessibilityState={{ disabled: isAddDisabled }}
        disabled={isAddDisabled}
        onPress={onAdd}
        style={[
          styles.button,
          compact && styles.buttonCompact,
          isAddDisabled && styles.disabled,
        ]}
      >
        <Ionicons color={iconColor} name="add" size={compact ? 16 : 20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
  },
  containerCompact: {
    alignSelf: 'stretch',
    borderRadius: radii.sm,
    justifyContent: 'space-between',
  },
  containerInverse: {
    alignSelf: 'stretch',
    backgroundColor: colors.brand.yellow,
    borderColor: colors.brand.yellow,
    justifyContent: 'space-between',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minimumTouchTarget,
    minWidth: minimumTouchTarget,
  },
  buttonCompact: {
    minHeight: 36,
    minWidth: 36,
  },
  disabled: {
    opacity: 0.35,
  },
  quantity: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
    minWidth: spacing.xl,
    textAlign: 'center',
  },
  quantityInverse: {
    color: colors.brand.deep,
  },
  quantityCompact: {
    flex: 1,
    fontSize: 14,
    minWidth: 24,
  },
});
