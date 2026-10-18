import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { router, usePathname } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, shadows, spacing, typography } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const items: {
  href: Href;
  icon: IoniconName;
  label: string;
  match: string;
}[] = [
  { href: '/admin', icon: 'bag-handle-outline', label: 'Resumo', match: '/admin' },
  { href: '/admin/stock', icon: 'clipboard-outline', label: 'Estoque', match: '/admin/stock' },
  {
    href: '/admin/orders',
    icon: 'receipt-outline',
    label: 'Pedidos',
    match: '/admin/orders',
  },
  { href: '/(shop)/profile', icon: 'person-outline', label: 'Conta', match: '/profile' },
];

export function AdminBottomBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
    >
      <View accessibilityRole="tablist" style={styles.container}>
        {items.map((item) => {
          const isActive =
            item.match === '/admin'
              ? pathname === '/admin' || pathname.endsWith('/admin')
              : pathname.includes(item.match);

          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              key={item.label}
              onPress={() => router.replace(item.href)}
              style={styles.item}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Ionicons
                  color={isActive ? colors.brand.deep : colors.text.secondary}
                  name={item.icon}
                  size={22}
                />
              </View>
              <Text style={[styles.label, isActive && styles.activeLabel]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    bottom: 0,
    left: spacing.md,
    position: 'absolute',
    right: spacing.md,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 68,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    ...shadows.card,
    elevation: 12,
    shadowOpacity: 0.16,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconWrapActive: {
    backgroundColor: colors.brand.yellow,
  },
  label: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 11,
  },
  activeLabel: {
    color: colors.brand.deep,
    fontFamily: typography.interfaceSemibold,
  },
});
