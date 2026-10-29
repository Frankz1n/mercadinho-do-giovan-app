import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/ui/brand-mark';
import { useCart } from '@/features/cart/cart-context';
import {
  colors,
  minimumTouchTarget,
  radii,
  spacing,
  storeLocation,
  typography,
} from '@/theme';

type StoreHeaderProps = {
  title?: string;
  showCart?: boolean;
  showAdminBadge?: boolean;
  subtitle?: string | null;
};

export function StoreHeader({
  title = 'Mercadinho do Giovan',
  showCart = true,
  showAdminBadge = false,
  subtitle = storeLocation,
}: StoreHeaderProps) {
  const { totalCount } = useCart();
  const insets = useSafeAreaInsets();

  // Em builds de desenvolvimento o FAB do Expo Dev Client cobre o canto
  // superior direito; reserva espaço para o ícone do app continuar tocável.
  const headerEndInset = __DEV__ ? spacing.xl + spacing.lg : 0;

  return (
    <View
      style={[
        styles.container,
        {
          paddingEnd: spacing.md + headerEndInset,
          paddingTop: Math.max(insets.top, spacing.sm),
        },
      ]}
    >
      <BrandMark size={44} />
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {showAdminBadge ? (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <View style={styles.location}>
            <Ionicons color={colors.brand.yellow} name="location-outline" size={13} />
            <Text style={styles.locationText}>{subtitle}</Text>
          </View>
        ) : null}
      </View>
      {showCart ? (
        <Pressable
          accessibilityLabel={`Carrinho com ${totalCount} itens`}
          accessibilityRole="button"
          onPress={() => router.push('/(shop)/cart')}
          style={styles.iconButton}
        >
          <Ionicons color={colors.text.inverse} name="cart-outline" size={24} />
          {totalCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.min(totalCount, 99)}</Text>
            </View>
          ) : null}
        </Pressable>
      ) : (
        <Pressable
          accessibilityLabel="Notificações"
          accessibilityRole="button"
          style={styles.iconButton}
        >
          <Ionicons color={colors.text.inverse} name="notifications-outline" size={22} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    paddingStart: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  title: {
    color: colors.text.inverse,
    flexShrink: 1,
    fontFamily: typography.brandSemibold,
    fontSize: 15,
  },
  adminBadge: {
    backgroundColor: colors.brand.yellow,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  adminBadgeText: {
    color: colors.brand.deep,
    fontFamily: typography.interfaceSemibold,
    fontSize: 10,
  },
  location: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  locationText: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceRegular,
    fontSize: 11,
    opacity: 0.88,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minimumTouchTarget,
    minWidth: minimumTouchTarget,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
    height: 18,
    justifyContent: 'center',
    minWidth: 18,
    position: 'absolute',
    right: 2,
    top: 4,
  },
  badgeText: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceSemibold,
    fontSize: 10,
  },
});
