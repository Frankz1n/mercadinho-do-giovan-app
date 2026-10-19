import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import {
  AdminScreen,
  AppButton,
  SearchField,
  StoreLoadingState,
  StoreMessage,
} from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import {
  catalogQueryKeys,
  useAdminProducts,
} from '@/features/catalog/data/catalog-queries';
import { catalogRepository } from '@/features/catalog/data/supabase-catalog-repository';
import type { Product } from '@/features/catalog/domain/catalog';
import { useToast } from '@/features/feedback/toast-context';
import { colors, radii, shadows, spacing, typography } from '@/theme';

export default function AdminStockScreen() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterLow, setFilterLow] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [delta, setDelta] = useState('10');
  const [isEntryMode, setIsEntryMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const productsQuery = useAdminProducts(search);
  const products = productsQuery.data ?? [];
  const visible = filterLow
    ? products.filter((product) => product.stockQuantity <= 5)
    : products;
  const lowCount = products.filter((product) => product.stockQuantity <= 5).length;

  if (!isAuthLoading && (!user || !isAdmin)) {
    return <Redirect href="/(auth)/login" />;
  }

  const openAdjust = (product: Product, entryMode = false) => {
    setSelected(product);
    setIsEntryMode(entryMode);
    setDelta(entryMode ? '10' : '0');
  };

  const applyAdjustment = async () => {
    if (!selected) {
      return;
    }
    const quantityDelta = Number.parseInt(delta, 10);
    if (Number.isNaN(quantityDelta) || quantityDelta === 0) {
      Alert.alert('Informe um valor diferente de zero.');
      return;
    }
    if (isEntryMode && quantityDelta < 0) {
      Alert.alert('Na entrada de estoque, use um valor positivo.');
      return;
    }

    setIsSaving(true);
    try {
      await catalogRepository.applyStockAdjustments([
        { productId: selected.id, quantityDelta },
      ]);
      await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      await productsQuery.refetch();
      showToast(
        isEntryMode
          ? `Entrada de ${quantityDelta} un · ${selected.name}`
          : `Estoque atualizado · ${selected.name}`,
        'success',
      );
      setSelected(null);
      setDelta('10');
      setIsEntryMode(false);
    } catch (error) {
      Alert.alert(
        'Não foi possível salvar',
        error instanceof Error
          ? error.message
          : 'Verifique se sua conta é admin e se a migration do banco foi aplicada.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminScreen title="Estoque">
      <View style={styles.searchRow}>
        <View style={styles.searchFlex}>
          <SearchField
            onChangeText={setSearch}
            placeholder="Buscar produto..."
            value={search}
          />
        </View>
        <Pressable
          accessibilityLabel="Novo produto"
          onPress={() => router.push('/admin/products/new')}
          style={styles.filterButton}
        >
          <Ionicons color={colors.brand.primary} name="add" size={24} />
        </Pressable>
      </View>

      <View style={styles.filters}>
        <Pressable
          onPress={() => setFilterLow(false)}
          style={[styles.chip, !filterLow && styles.chipActive]}
        >
          <Text style={[styles.chipText, !filterLow && styles.chipTextActive]}>
            Todos · {products.length}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFilterLow(true)}
          style={[styles.chip, filterLow && styles.chipActive]}
        >
          <Text
            style={[
              styles.chipText,
              filterLow && styles.chipTextActive,
              !filterLow && styles.chipLowCount,
            ]}
          >
            Estoque baixo · {lowCount}
          </Text>
        </Pressable>
      </View>

      {productsQuery.isPending || isAuthLoading ? (
        <StoreLoadingState />
      ) : productsQuery.isError ? (
        <StoreMessage
          description={
            productsQuery.error instanceof Error
              ? productsQuery.error.message
              : 'Não foi possível carregar o estoque.'
          }
          onRetry={() => void productsQuery.refetch()}
          title="Falha ao carregar"
          variant="error"
        />
      ) : visible.length === 0 ? (
        <StoreMessage
          description="Cadastre um produto ou limpe a busca."
          title="Nenhum produto"
        />
      ) : (
        <View style={styles.list}>
          {visible.map((product) => {
            const isLow = product.stockQuantity <= 5;
            return (
              <View key={product.id} style={styles.row}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/admin/products/[id]',
                      params: { id: product.id },
                    })
                  }
                  style={styles.rowMain}
                >
                  <Image
                    contentFit="cover"
                    source={{ uri: product.imageUrl }}
                    style={styles.image}
                  />
                  <View style={styles.copy}>
                    <Text numberOfLines={1} style={styles.name}>
                      {product.name}
                    </Text>
                    <Text style={styles.unit}>{product.unitLabel}</Text>
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.dot,
                          {
                            backgroundColor: isLow ? colors.warning : colors.success,
                          },
                        ]}
                      />
                      <Text style={styles.status}>
                        {isLow ? 'Estoque baixo' : 'Em estoque'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
                <View style={styles.rightCol}>
                  <Text style={[styles.qty, isLow && styles.qtyLow]}>
                    {product.stockQuantity} un
                  </Text>
                  <Pressable
                    onPress={() => openAdjust(product, false)}
                    style={styles.adjust}
                  >
                    <Text style={styles.adjustText}>Ajustar</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            if (visible[0]) {
              openAdjust(visible[0], true);
              return;
            }
            router.push('/admin/products/new');
          }}
          style={styles.entryButton}
        >
          <Ionicons color={colors.text.inverse} name="add" size={20} />
          <Text style={styles.entryButtonText}>Entrada de estoque</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/admin/products/new')}
          style={styles.newButton}
        >
          <Text style={styles.newButtonText}>Cadastrar novo produto</Text>
        </Pressable>
      </View>

      <Modal animationType="fade" transparent visible={Boolean(selected)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {isEntryMode ? 'Entrada de estoque' : 'Ajustar estoque'}
            </Text>
            <Text style={styles.modalProduct}>{selected?.name}</Text>
            {isEntryMode && visible.length > 1 ? (
              <View style={styles.productPicker}>
                {visible.slice(0, 8).map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => openAdjust(product, true)}
                    style={[
                      styles.pickerChip,
                      selected?.id === product.id && styles.pickerChipActive,
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.pickerChipText,
                        selected?.id === product.id && styles.pickerChipTextActive,
                      ]}
                    >
                      {product.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <Text style={styles.modalHint}>
              {isEntryMode
                ? 'Informe quantas unidades estão entrando.'
                : 'Use número positivo para entrada e negativo para saída.'}
            </Text>
            <TextInput
              editable={!isSaving}
              keyboardType="number-pad"
              onChangeText={setDelta}
              style={styles.modalInput}
              value={delta}
            />
            <AppButton
              disabled={isSaving}
              label={
                isSaving
                  ? 'Salvando…'
                  : isEntryMode
                    ? 'Confirmar entrada'
                    : 'Salvar ajuste'
              }
              onPress={() => void applyAdjustment()}
            />
            <AppButton
              disabled={isSaving}
              label="Cancelar"
              onPress={() => {
                setSelected(null);
                setIsEntryMode(false);
              }}
              variant="secondary"
            />
          </View>
        </View>
      </Modal>
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchFlex: {
    flex: 1,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.brand.deep,
    borderColor: colors.brand.deep,
  },
  chipText: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceMedium,
  },
  chipTextActive: {
    color: colors.text.inverse,
  },
  chipLowCount: {
    color: colors.danger,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    ...shadows.card,
  },
  rowMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  image: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    height: 64,
    width: 64,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 15,
  },
  unit: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
  dot: {
    borderRadius: radii.pill,
    height: 8,
    width: 8,
  },
  status: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  qty: {
    color: colors.brand.deep,
    fontFamily: typography.brandSemibold,
    fontSize: 18,
  },
  qtyLow: {
    color: colors.danger,
  },
  adjust: {
    borderColor: colors.brand.primary,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  adjustText: {
    color: colors.brand.primary,
    fontFamily: typography.interfaceSemibold,
    fontSize: 13,
  },
  actions: {
    gap: spacing.sm,
  },
  entryButton: {
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 52,
  },
  entryButtonText: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceSemibold,
    fontSize: 16,
  },
  newButton: {
    alignItems: 'center',
    borderColor: colors.brand.primary,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  newButtonText: {
    color: colors.brand.primary,
    fontFamily: typography.interfaceSemibold,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(5, 19, 59, 0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.sm,
    padding: spacing.lg,
    width: '100%',
  },
  modalTitle: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 20,
  },
  modalProduct: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
  },
  productPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pickerChip: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pickerChipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  pickerChipText: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceMedium,
    fontSize: 12,
  },
  pickerChipTextActive: {
    color: colors.text.inverse,
  },
  modalHint: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
  },
  modalInput: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    fontFamily: typography.interfaceSemibold,
    fontSize: 20,
    padding: spacing.md,
    textAlign: 'center',
  },
});
