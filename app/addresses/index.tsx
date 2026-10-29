import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AppButton,
  Screen,
  StoreHeader,
  StoreLoadingState,
  StoreMessage,
} from '@/components/ui';
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/features/addresses/data/address-queries';
import {
  formatAddressCity,
  formatAddressLine,
} from '@/features/addresses/domain/address';
import { useAuth } from '@/features/auth/auth-context';
import { colors, radii, shadows, spacing, typography } from '@/theme';

export default function AddressesScreen() {
  const { user } = useAuth();
  const addressesQuery = useAddresses(user?.id);
  const deleteAddress = useDeleteAddress(user?.id);
  const setDefaultAddress = useSetDefaultAddress(user?.id);

  const onDelete = (addressId: string, label: string) => {
    Alert.alert('Excluir endereço', `Remover “${label}”?`, [
      { text: 'Manter', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void deleteAddress.mutateAsync(addressId).catch((error: unknown) => {
            Alert.alert(
              'Erro',
              error instanceof Error ? error.message : 'Não foi possível excluir.',
            );
          });
        },
      },
    ]);
  };

  return (
    <Screen>
      <StoreHeader title="Meus endereços" />
      <Text accessibilityRole="header" style={styles.title}>
        Endereços
      </Text>
      <Text style={styles.subtitle}>
        Cadastre onde você recebe. Usaremos no futuro para entrega; por enquanto
        os pedidos são só para retirada.
      </Text>

      {!user ? (
        <>
          <StoreMessage
            description="Entre na sua conta para salvar endereços."
            title="Você não está logado"
          />
          <AppButton href="/(auth)/login" label="Entrar" />
        </>
      ) : addressesQuery.isPending ? (
        <StoreLoadingState />
      ) : addressesQuery.isError ? (
        <StoreMessage
          description="Tente novamente em instantes."
          onRetry={() => void addressesQuery.refetch()}
          title="Falha ao carregar"
          variant="error"
        />
      ) : (addressesQuery.data?.length ?? 0) === 0 ? (
        <StoreMessage
          description="Adicione casa, trabalho ou outro local de entrega."
          title="Nenhum endereço ainda"
        />
      ) : (
        <View style={styles.list}>
          {addressesQuery.data?.map((address) => (
            <View key={address.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.label}>{address.label}</Text>
                {address.isDefault ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Padrão</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.line}>{formatAddressLine(address)}</Text>
              <Text style={styles.meta}>{formatAddressCity(address)}</Text>

              <View style={styles.actions}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/addresses/form',
                      params: { id: address.id },
                    })
                  }
                  style={styles.actionButton}
                >
                  <Ionicons color={colors.brand.primary} name="create-outline" size={18} />
                  <Text style={styles.actionText}>Editar</Text>
                </Pressable>
                {!address.isDefault ? (
                  <Pressable
                    onPress={() => {
                      void setDefaultAddress
                        .mutateAsync(address.id)
                        .catch((error: unknown) => {
                          Alert.alert(
                            'Erro',
                            error instanceof Error
                              ? error.message
                              : 'Não foi possível definir como padrão.',
                          );
                        });
                    }}
                    style={styles.actionButton}
                  >
                    <Ionicons
                      color={colors.brand.primary}
                      name="star-outline"
                      size={18}
                    />
                    <Text style={styles.actionText}>Tornar padrão</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => onDelete(address.id, address.label)}
                  style={styles.actionButton}
                >
                  <Ionicons color={colors.danger} name="trash-outline" size={18} />
                  <Text style={[styles.actionText, styles.dangerText]}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {user ? (
        <AppButton
          label="Adicionar endereço"
          onPress={() => router.push('/addresses/form')}
        />
      ) : null}
      <AppButton href="/(shop)/profile" label="Voltar ao perfil" variant="secondary" />
    </Screen>
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
  list: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.xs,
    padding: spacing.md,
    ...shadows.card,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.interfaceSemibold,
    fontSize: 16,
  },
  badge: {
    backgroundColor: colors.brand.yellow,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.brand.deep,
    fontFamily: typography.interfaceSemibold,
    fontSize: 11,
  },
  line: {
    color: colors.text.primary,
    fontFamily: typography.interfaceRegular,
    fontSize: 14,
  },
  meta: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  actionText: {
    color: colors.brand.primary,
    fontFamily: typography.interfaceMedium,
    fontSize: 13,
  },
  dangerText: {
    color: colors.danger,
  },
});
