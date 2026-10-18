import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, minimumTouchTarget, radii, spacing, typography } from '@/theme';

export function StoreLoadingState() {
  return (
    <View accessibilityLabel="Carregando conteúdo" style={styles.skeletonGrid}>
      {[0, 1].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonShortLine} />
        </View>
      ))}
    </View>
  );
}

type StoreMessageProps = {
  description: string;
  onRetry?: () => void;
  title: string;
  variant?: 'empty' | 'error';
};

export function StoreMessage({
  description,
  onRetry,
  title,
  variant = 'empty',
}: StoreMessageProps) {
  return (
    <View style={styles.message}>
      <Ionicons
        color={variant === 'error' ? colors.danger : colors.brand.mid}
        name={variant === 'error' ? 'alert-circle-outline' : 'basket-outline'}
        size={36}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry && (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryLabel}>Tentar novamente</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    padding: spacing.sm,
  },
  skeletonImage: {
    backgroundColor: colors.border,
    borderRadius: radii.md,
    height: 112,
  },
  skeletonLine: {
    backgroundColor: colors.border,
    borderRadius: radii.sm,
    height: 14,
    width: '90%',
  },
  skeletonShortLine: {
    backgroundColor: colors.border,
    borderRadius: radii.sm,
    height: 14,
    width: '55%',
  },
  message: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 20,
    textAlign: 'center',
  },
  description: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    lineHeight: 21,
    textAlign: 'center',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: minimumTouchTarget,
    paddingHorizontal: spacing.lg,
  },
  retryLabel: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceSemibold,
  },
});
