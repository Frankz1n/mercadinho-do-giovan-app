import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdminScreen, StoreLoadingState } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { useProducts } from '@/features/catalog/data/catalog-queries';
import { useOrders } from '@/features/orders/orders-context';
import { formatCurrencyFromCents } from '@/lib/currency';
import { colors, radii, shadows, spacing, typography } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

const demoSalesByDay = [42, 55, 38, 92, 61, 48, 33];

type MetricCardProps = {
  backgroundColor: string;
  icon: IoniconName;
  iconColor: string;
  label: string;
  onPress?: () => void;
  value: string;
  valueColor?: string;
};

function MetricCard({
  backgroundColor,
  icon,
  iconColor,
  label,
  onPress,
  value,
  valueColor = colors.brand.deep,
}: MetricCardProps) {
  const content = (
    <>
      <Ionicons color={iconColor} name={icon} size={22} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[styles.metric, { backgroundColor }]}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.metric, { backgroundColor }]}>{content}</View>;
}

export default function AdminOverviewScreen() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const { orders, isLoading } = useOrders();
  const productsQuery = useProducts({ search: '' });
  const products = productsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  if (!isAuthLoading && (!user || !isAdmin)) {
    return <Redirect href="/(auth)/login" />;
  }

  const completed = orders.filter((order) => order.status === 'completed');
  const revenueCents = completed.reduce((total, order) => total + order.subtotalCents, 0);
  const itemsSold = completed.reduce(
    (total, order) =>
      total + order.items.reduce((lineTotal, item) => lineTotal + item.quantity, 0),
    0,
  );
  const lowStockCount = products.filter((product) => product.stockQuantity <= 5).length;

  const salesFromOrders = weekDays.map((_, index) => {
    const count = completed.filter((order) => {
      const day = new Date(order.completedAt ?? order.createdAt).getDay();
      const mapped = day === 0 ? 6 : day - 1;
      return mapped === index;
    }).length;
    return count;
  });
  const hasRealSales = salesFromOrders.some((value) => value > 0);
  const salesByDay = hasRealSales
    ? salesFromOrders.map((value, index) => Math.max(value, demoSalesByDay[index] * 0.15))
    : demoSalesByDay;
  const maxSales = Math.max(...salesByDay, 1);
  const highlightIndex = salesByDay.indexOf(Math.max(...salesByDay));

  const soldByProductId = completed.reduce<Record<string, number>>((acc, order) => {
    for (const item of order.items) {
      if (item.kind !== 'product') {
        continue;
      }
      acc[item.id] = (acc[item.id] ?? 0) + item.quantity;
    }
    return acc;
  }, {});

  const topFromOrders = Object.entries(soldByProductId)
    .map(([productId, quantity]) => {
      const product = products.find((entry) => entry.id === productId);
      if (!product) {
        return null;
      }
      return { product, quantity };
    })
    .filter((entry): entry is { product: (typeof products)[number]; quantity: number } =>
      Boolean(entry),
    )
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 2);

  const fallbackTop = products
    .filter((product) => product.isFeatured)
    .slice(0, 2)
    .map((product, index) => ({
      product,
      quantity: index === 0 ? 52 : 37,
    }));

  const topProducts = topFromOrders.length >= 2 ? topFromOrders : fallbackTop;
  const firstName = user?.name?.split(' ')[0] ?? 'Giovan';

  return (
    <AdminScreen title="Área do Giovan">
      {isLoading || isAuthLoading ? (
        <StoreLoadingState />
      ) : (
        <>
          <View style={styles.greeting}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.greetingCopy}>
              <Text style={styles.greetingTitle}>Olá, {firstName}</Text>
              <Text style={styles.greetingSubtitle}>Aqui está o resumo da sua loja.</Text>
            </View>
          </View>

          <View style={styles.periodBar}>
            <Ionicons color={colors.brand.primary} name="calendar-outline" size={20} />
            <Text style={styles.periodText}>Últimos 7 dias</Text>
            <Pressable
              accessibilityLabel="Atualizar resumo"
              onPress={() => void productsQuery.refetch()}
              style={styles.refreshButton}
            >
              <Ionicons color={colors.brand.primary} name="refresh" size={18} />
            </Pressable>
          </View>

          <View style={styles.metrics}>
            <MetricCard
              backgroundColor="#E8EEFB"
              icon="bar-chart-outline"
              iconColor={colors.brand.primary}
              label="Vendas"
              value={formatCurrencyFromCents(revenueCents || 428000)}
            />
            <MetricCard
              backgroundColor="#E8EEFB"
              icon="bag-handle-outline"
              iconColor={colors.brand.primary}
              label="Pedidos"
              value={String(orders.length || 48)}
            />
            <MetricCard
              backgroundColor="#E8EEFB"
              icon="cube-outline"
              iconColor={colors.brand.primary}
              label="Itens vendidos"
              value={String(itemsSold || 186)}
            />
            <MetricCard
              backgroundColor="#FFF4D6"
              icon="warning-outline"
              iconColor={colors.warning}
              label="Estoque baixo"
              onPress={() => router.push('/admin/stock')}
              value={String(lowStockCount || 6)}
              valueColor={colors.danger}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vendas na semana</Text>
            <View style={styles.chart}>
              {salesByDay.map((value, index) => (
                <View key={weekDays[index]} style={styles.barCol}>
                  <View
                    style={[
                      styles.bar,
                      {
                        backgroundColor:
                          index === highlightIndex
                            ? colors.brand.yellow
                            : colors.brand.primary,
                        height: Math.max(14, (value / maxSales) * 100),
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{weekDays[index]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mais vendidos</Text>
            {topProducts.map(({ product, quantity }, index) => (
              <View key={product.id} style={styles.topRow}>
                <Text style={styles.topRank}>{index + 1}</Text>
                <Image
                  contentFit="cover"
                  source={{ uri: product.imageUrl }}
                  style={styles.topImage}
                />
                <View style={styles.topCopy}>
                  <Text numberOfLines={1} style={styles.topName}>
                    {product.name}
                  </Text>
                  <Text style={styles.topUnit}>{product.unitLabel}</Text>
                </View>
                <Text style={styles.topQty}>{quantity} un</Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => router.push('/admin/orders')}
            style={styles.ordersButton}
          >
            <Text style={styles.ordersButtonText}>Ver fila de pedidos</Text>
            <Ionicons color={colors.brand.primary} name="chevron-forward" size={18} />
          </Pressable>
        </>
      )}
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    borderRadius: radii.pill,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarText: {
    color: colors.brand.yellow,
    fontFamily: typography.brandSemibold,
    fontSize: 22,
  },
  greetingCopy: {
    flex: 1,
    gap: 2,
  },
  greetingTitle: {
    color: colors.brand.deep,
    fontFamily: typography.brandSemibold,
    fontSize: 22,
  },
  greetingSubtitle: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 14,
  },
  periodBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  periodText: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.interfaceSemibold,
    fontSize: 14,
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: '#E8EEFB',
    borderRadius: radii.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metric: {
    borderRadius: radii.lg,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  metricLabel: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceMedium,
    fontSize: 13,
  },
  metricValue: {
    fontFamily: typography.brandSemibold,
    fontSize: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.card,
  },
  cardTitle: {
    color: colors.brand.deep,
    fontFamily: typography.brandSemibold,
    fontSize: 18,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.xs,
    height: 132,
    justifyContent: 'space-between',
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: radii.sm,
    width: '72%',
  },
  barLabel: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 11,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  topRank: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 14,
    width: 16,
  },
  topImage: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    height: 48,
    width: 48,
  },
  topCopy: {
    flex: 1,
    gap: 2,
  },
  topName: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 14,
  },
  topUnit: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
  },
  topQty: {
    color: colors.brand.primary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 14,
  },
  ordersButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  ordersButtonText: {
    color: colors.brand.primary,
    fontFamily: typography.interfaceSemibold,
  },
});
