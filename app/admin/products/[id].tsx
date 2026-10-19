import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import {
  AdminScreen,
  AppButton,
  StoreLoadingState,
  StoreMessage,
  TextField,
} from '@/components/ui';
import { ProductPhotoField } from '@/components/ui/product-photo-field';
import { useAuth } from '@/features/auth/auth-context';
import {
  catalogQueryKeys,
  useCategories,
  useProduct,
} from '@/features/catalog/data/catalog-queries';
import type { PickedProductImage } from '@/features/catalog/data/product-image-upload';
import { uploadProductImage } from '@/features/catalog/data/product-image-upload';
import { catalogRepository } from '@/features/catalog/data/supabase-catalog-repository';
import type { Product } from '@/features/catalog/domain/catalog';
import { useToast } from '@/features/feedback/toast-context';
import { colors, radii, spacing, typography } from '@/theme';

function EditProductForm({ product }: { product: Product }) {
  const categoriesQuery = useCategories();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [name, setName] = useState(product.name);
  const [unitLabel, setUnitLabel] = useState(product.unitLabel);
  const [price, setPrice] = useState(
    (product.priceCents / 100).toFixed(2).replace('.', ','),
  );
  const [stock, setStock] = useState(String(product.stockQuantity));
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [isAvailable, setIsAvailable] = useState(product.stockQuantity > 0);
  const [pickedImage, setPickedImage] = useState<PickedProductImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const previewUri = pickedImage?.uri ?? product.imageUrl;

  const onSave = async () => {
    setError(null);
    const priceCents = Math.round(Number.parseFloat(price.replace(',', '.')) * 100);
    const stockQuantity = Number.parseInt(stock, 10);
    if (!name.trim() || !unitLabel.trim() || Number.isNaN(priceCents) || priceCents <= 0) {
      setError('Preencha nome, unidade e preço válidos.');
      return;
    }
    if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
      setError('Informe um estoque válido.');
      return;
    }

    setIsSaving(true);
    try {
      const category = categoriesQuery.data?.find((entry) => entry.id === categoryId);
      let imageUrl = product.imageUrl;
      if (pickedImage) {
        imageUrl = await uploadProductImage(pickedImage, product.id);
      }

      await catalogRepository.upsertProduct({
        id: product.id,
        categoryId,
        name,
        description: product.description,
        unitLabel,
        priceCents,
        stockQuantity: isAvailable ? Math.max(0, stockQuantity) : 0,
        isFeatured: product.isFeatured,
        visual: category?.visual ?? product.visual,
        imageUrl,
      });
      await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      showToast('Produto atualizado', 'success');
      router.replace('/admin/stock');
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Não foi possível salvar.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      await catalogRepository.removeProduct(product.id);
      await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      setShowDelete(false);
      showToast('Produto removido', 'success');
      router.replace('/admin/stock');
    } catch (deleteError) {
      setShowDelete(false);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Não foi possível remover o produto.',
      );
    }
  };

  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        Editar produto
      </Text>

      <ProductPhotoField imageUri={previewUri} onChange={setPickedImage} />

      <TextField label="Nome" onChangeText={setName} value={name} />
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categories}>
        {categoriesQuery.data?.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setCategoryId(category.id)}
            style={[styles.chip, categoryId === category.id && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                categoryId === category.id && styles.chipTextActive,
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextField label="Unidade / peso" onChangeText={setUnitLabel} value={unitLabel} />
      <TextField
        keyboardType="decimal-pad"
        label="Preço (R$)"
        onChangeText={setPrice}
        value={price}
      />
      <TextField
        keyboardType="number-pad"
        label="Estoque"
        onChangeText={setStock}
        value={stock}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Disponível para venda</Text>
        <Switch
          onValueChange={setIsAvailable}
          thumbColor={colors.surface}
          trackColor={{ false: colors.border, true: colors.brand.primary }}
          value={isAvailable}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton
        disabled={isSaving}
        label={isSaving ? 'Salvando…' : 'Salvar alterações'}
        onPress={() => void onSave()}
      />
      <Pressable onPress={() => setShowDelete(true)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>Remover produto</Text>
      </Pressable>

      <Modal animationType="fade" transparent visible={showDelete}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons color={colors.danger} name="trash-outline" size={32} />
            </View>
            <Text style={styles.modalTitle}>Remover produto?</Text>
            <Text style={styles.modalCopy}>
              {product.name} será retirado do catálogo.
            </Text>
            <Pressable onPress={() => void onDelete()} style={styles.modalDelete}>
              <Text style={styles.modalDeleteText}>Remover produto</Text>
            </Pressable>
            <AppButton
              label="Cancelar"
              onPress={() => setShowDelete(false)}
              variant="secondary"
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function AdminEditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const productQuery = useProduct(id);
  const product = productQuery.data;

  if (!isAuthLoading && (!user || !isAdmin)) {
    return <Redirect href="/(auth)/login" />;
  }

  if (productQuery.isPending || isAuthLoading) {
    return (
      <AdminScreen title="Editar produto">
        <StoreLoadingState />
      </AdminScreen>
    );
  }

  if (!product) {
    return (
      <AdminScreen title="Editar produto">
        <StoreMessage description="Produto não encontrado." title="Indisponível" />
      </AdminScreen>
    );
  }

  return (
    <AdminScreen title="Editar produto">
      <EditProductForm key={product.id} product={product} />
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 25,
  },
  label: {
    color: colors.text.primary,
    fontFamily: typography.interfaceMedium,
    fontSize: 14,
  },
  categories: {
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
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchLabel: {
    color: colors.text.primary,
    fontFamily: typography.interfaceMedium,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.interfaceMedium,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#FDECEC',
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 48,
  },
  deleteText: {
    color: colors.danger,
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
    gap: spacing.md,
    padding: spacing.lg,
    width: '100%',
  },
  modalIconWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FDECEC',
    borderRadius: radii.pill,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  modalTitle: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 20,
    textAlign: 'center',
  },
  modalCopy: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalDelete: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 48,
  },
  modalDeleteText: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceSemibold,
    fontSize: 16,
  },
});
