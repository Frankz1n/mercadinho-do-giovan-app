import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton, ShopScreen, StoreMessage } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { colors, radii, shadows, spacing, typography } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type MenuItem = {
  href?: Href;
  icon: IoniconName;
  label: string;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const { user, isAdmin, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <ShopScreen title="Meu perfil">
        <StoreMessage description="Carregando sessão…" title="Aguarde" />
      </ShopScreen>
    );
  }

  if (!user) {
    return (
      <ShopScreen title="Meu perfil">
        <Text accessibilityRole="header" style={styles.title}>
          Meu perfil
        </Text>
        <Text style={styles.subtitle}>
          Entre para fechar pedidos e acompanhar o código de retirada.
        </Text>
        <AppButton href="/(auth)/login" label="Entrar" />
        <AppButton href="/(auth)/register" label="Criar conta" variant="secondary" />
      </ShopScreen>
    );
  }

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const menuItems: MenuItem[] = [
    { href: '/orders', icon: 'receipt-outline', label: 'Meus pedidos' },
    { href: '/addresses', icon: 'location-outline', label: 'Meus endereços' },
    { href: '/account', icon: 'person-outline', label: 'Meus dados' },
  ];

  return (
    <ShopScreen title="Meu perfil">
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || 'MG'}</Text>
        </View>
        <Text accessibilityRole="header" style={styles.name}>
          {user.name.split(' ')[0]}
        </Text>
        <Text style={styles.meta}>{user.email}</Text>
        <Text style={styles.meta}>{user.phone}</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => {
              if (item.href) {
                router.push(item.href);
              }
            }}
            style={styles.menuItem}
          >
            <Ionicons color={colors.brand.primary} name={item.icon} size={22} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons color={colors.text.secondary} name="chevron-forward" size={18} />
          </Pressable>
        ))}
        {isAdmin ? (
          <Pressable onPress={() => router.push('/admin')} style={styles.menuItem}>
            <Ionicons color={colors.brand.primary} name="stats-chart-outline" size={22} />
            <Text style={styles.menuLabel}>Painel administrativo</Text>
            <Ionicons color={colors.text.secondary} name="chevron-forward" size={18} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={() => {
          void (async () => {
            await logout();
            router.replace('/(auth)/login');
          })();
        }}
        style={styles.logout}
      >
        <Ionicons color={colors.danger} name="log-out-outline" size={20} />
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </ShopScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 25,
  },
  subtitle: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    lineHeight: 21,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.xs,
    padding: spacing.lg,
    ...shadows.card,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    borderRadius: radii.pill,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 72,
  },
  avatarText: {
    color: colors.brand.yellow,
    fontFamily: typography.brandSemibold,
    fontSize: 24,
  },
  name: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 22,
  },
  meta: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  menuItem: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  menuLabel: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.interfaceMedium,
    fontSize: 15,
  },
  logout: {
    alignItems: 'center',
    backgroundColor: '#FDECEC',
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 48,
  },
  logoutText: {
    color: colors.danger,
    fontFamily: typography.interfaceSemibold,
    fontSize: 16,
  },
});
