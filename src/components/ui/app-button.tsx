import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, minimumTouchTarget, radii, spacing, typography } from '@/theme';

type AppButtonProps = {
  disabled?: boolean;
  label: string;
  href?: Href;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
};

export function AppButton({
  disabled = false,
  label,
  href,
  onPress,
  variant = 'primary',
}: AppButtonProps) {
  const handlePress = () => {
    if (disabled) {
      return;
    }

    if (onPress) {
      onPress();
      return;
    }

    if (href) {
      router.push(href);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
    </Pressable>
  );
}

const variantStyles: Record<NonNullable<AppButtonProps['variant']>, ViewStyle> = {
  primary: {
    backgroundColor: colors.brand.yellow,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.brand.primary,
    borderWidth: 1,
  },
};

const labelStyles = StyleSheet.create({
  primary: {
    color: colors.brand.deep,
  },
  secondary: {
    color: colors.brand.primary,
  },
});

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: minimumTouchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  label: {
    fontFamily: typography.interfaceSemibold,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.78,
  },
  disabled: {
    opacity: 0.45,
  },
});
