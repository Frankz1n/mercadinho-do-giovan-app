import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AppButton,
  Screen,
  StoreHeader,
  StoreLoadingState,
  StoreMessage,
} from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { ORDER_STATUS_LABEL } from '@/features/orders/domain/order';
import { useOrders } from '@/features/orders/orders-context';
import { formatCurrencyFromCents } from '@/lib/currency';
import { colors, radii, spacing, typography } from '@/theme';

export default function OrdersListScreen() {
  const { user } = useAuth();
  const { orders, isLoading } = useOrders();
  const myOrders = user ? orders.filter((order) => order.userId === user.id) : [];

  return (
    <Screen>
      <StoreHeader title="Meus pedidos" />
      <Text accessibilityRole="header" style={styles.title}>
        Pedidos
      </Text>

      {!user ? (
        <>
          <StoreMessage
            description="Entre na sua conta para ver os códigos de retirada."
            title="Você não está logado"
          />
          <AppButton href="/(auth)/login" label="Entrar" />
        </>
      ) : isLoading ? (
        <StoreLoadingState />
      ) : myOrders.length === 0 ? (
        <StoreMessage
          description="Feche um pedido no carrinho para gerar seu código."
          title="Nenhum pedido ainda"
        />
      ) : (
        <View style={styles.list}>
          {myOrders.map((order) => (
            <Pressable
              key={order.id}
              onPress={() =>
                router.push({ pathname: '/orders/[id]', params: { id: order.id } })
              }
              style={styles.card}
            >
              <View style={styles.row}>
                <Text style={styles.code}>{order.code}</Text>
                <Text style={styles.status}>{ORDER_STATUS_LABEL[order.status]}</Text>
              </View>
              <Text style={styles.meta}>
                {new Date(order.createdAt).toLocaleString('pt-BR')} ·{' '}
                {formatCurrencyFromCents(order.subtotalCents)}
              </Text>
              <Text style={styles.items}>
                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <AppButton href="/(shop)/home" label="Voltar à loja" variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 25,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  code: {
    color: colors.brand.deep,
    fontFamily: typography.brandSemibold,
    fontSize: 18,
  },
  status: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceMedium,
    fontSize: 12,
  },
  meta: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
  },
  items: {
    color: colors.text.primary,
    fontFamily: typography.interfaceRegular,
  },
});
