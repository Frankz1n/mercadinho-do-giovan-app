import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, minimumTouchTarget, radii, spacing, typography } from '@/theme';

type QuantityStepperProps = {
  compact?: boolean;
  isAddDisabled?: boolean;
  onAdd: () => void;
  onDecrement: () => void;
  quantity: number;
};

export function QuantityStepper({
  compact = false,
  isAddDisabled = false,
  onAdd,
  onDecrement,
  quantity,
}: QuantityStepperProps) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Pressable
        accessibilityLabel="Diminuir quantidade"
        accessibilityRole="button"
        onPress={onDecrement}
        style={[styles.button, compact && styles.buttonCompact]}
      >
        <Ionicons color={colors.brand.primary} name="remove" size={compact ? 16 : 20} />
      </Pressable>
      <Text
        accessibilityLabel={`Quantidade ${quantity}`}
        style={[styles.quantity, compact && styles.quantityCompact]}
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
        <Ionicons color={colors.brand.primary} name="add" size={compact ? 16 : 20} />
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
    flexShrink: 1,
  },
  containerCompact: {
    borderRadius: radii.sm,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minimumTouchTarget,
    minWidth: minimumTouchTarget,
  },
  buttonCompact: {
    minHeight: 32,
    minWidth: 28,
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
  quantityCompact: {
    fontSize: 13,
    minWidth: 20,
  },
});
