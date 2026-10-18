import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { router, usePathname } from 'expo-router';
import { useEffect, useState, type ComponentProps } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '@/features/cart/cart-context';
import { colors, minimumTouchTarget, radii, spacing, typography } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const navigationItems: {
  href: Href;
  icon: IoniconName;
  label: string;
  path: string;
}[] = [
  { href: '/(shop)/home', icon: 'home-outline', label: 'Início', path: '/home' },
  { href: '/(shop)/baskets', icon: 'basket-outline', label: 'Cestas', path: '/baskets' },
  { href: '/(shop)/cart', icon: 'cart-outline', label: 'Carrinho', path: '/cart' },
  { href: '/(shop)/profile', icon: 'person-outline', label: 'Perfil', path: '/profile' },
];

export function ShopBottomBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { totalCount } = useCart();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View
      style={[
        styles.safeArea,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      <View accessibilityRole="tablist" style={styles.container}>
        {navigationItems.map((item) => {
          const isActive = pathname.endsWith(item.path);

          return (
            <Pressable
              accessibilityLabel={
                item.path === '/cart'
                  ? `${item.label}, ${totalCount} itens`
                  : item.label
              }
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              key={item.label}
              onPress={() => router.replace(item.href)}
              style={styles.item}
            >
              <Ionicons
                color={isActive ? colors.brand.yellow : colors.text.inverse}
                name={item.icon}
                size={22}
              />
              {item.path === '/cart' && totalCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{Math.min(totalCount, 99)}</Text>
                </View>
              ) : null}
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {item.label}
              </Text>
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
    backgroundColor: colors.brand.primary,
    borderRadius: radii.xl,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 64,
    paddingHorizontal: spacing.xs,
    shadowColor: '#061C6C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: minimumTouchTarget,
    minWidth: 64,
    paddingHorizontal: spacing.xs,
  },
  label: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceRegular,
    fontSize: 11,
    marginTop: 2,
  },
  activeLabel: {
    color: colors.brand.yellow,
    fontFamily: typography.interfaceSemibold,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
    height: 17,
    justifyContent: 'center',
    minWidth: 17,
    position: 'absolute',
    right: 8,
    top: 2,
  },
  badgeText: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceSemibold,
    fontSize: 9,
  },
});
