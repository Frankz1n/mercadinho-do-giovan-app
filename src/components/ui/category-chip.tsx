import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, minimumTouchTarget, radii, spacing, typography } from '@/theme';

type CategoryChipProps = {
  isSelected: boolean;
  label: string;
  onPress: () => void;
};

export function CategoryChip({ isSelected, label, onPress }: CategoryChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[styles.container, isSelected && styles.selectedContainer]}
    >
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: minimumTouchTarget,
    paddingHorizontal: spacing.md,
  },
  selectedContainer: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  label: {
    color: colors.text.primary,
    fontFamily: typography.interfaceMedium,
    fontSize: 13,
  },
  selectedLabel: {
    color: colors.text.inverse,
  },
});
