import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import {
  AdminScreen,
  AppButton,
  StoreLoadingState,
  TextField,
} from '@/components/ui';
import { ProductPhotoField } from '@/components/ui/product-photo-field';
import { useAuth } from '@/features/auth/auth-context';
import { catalogQueryKeys, useCategories } from '@/features/catalog/data/catalog-queries';
import type { PickedProductImage } from '@/features/catalog/data/product-image-upload';
import { uploadProductImage } from '@/features/catalog/data/product-image-upload';
import { catalogRepository } from '@/features/catalog/data/supabase-catalog-repository';
import { useToast } from '@/features/feedback/toast-context';
import { colors, radii, spacing, typography } from '@/theme';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

export default function AdminNewProductScreen() {
  const { user, isAdmin, isLoading } = useAuth();
  const { showToast } = useToast();
  const categoriesQuery = useCategories();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [unitLabel, setUnitLabel] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [categoryId, setCategoryId] = useState('pantry');
  const [pickedImage, setPickedImage] = useState<PickedProductImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isLoading && (!user || !isAdmin)) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isLoading) {
    return (
      <AdminScreen title="Novo produto">
        <StoreLoadingState />
      </AdminScreen>
    );
  }

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
      const productKey = name
        .trim()
        .toLocaleLowerCase('pt-BR')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);

      let imageUrl = FALLBACK_IMAGE;
      if (pickedImage) {
        imageUrl = await uploadProductImage(
          pickedImage,
          productKey || `product-${Date.now()}`,
        );
      }

      await catalogRepository.upsertProduct({
        categoryId,
        name,
        description: name,
        unitLabel,
        priceCents,
        stockQuantity,
        isFeatured: false,
        visual: category?.visual ?? 'rice',
        imageUrl,
      });
      await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      showToast('Produto cadastrado', 'success');
      router.replace('/admin/stock');
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Não foi possível salvar.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminScreen title="Novo produto">
      <Text accessibilityRole="header" style={styles.title}>
        Novo produto
      </Text>

      <ProductPhotoField
        imageUri={pickedImage?.uri ?? null}
        onChange={setPickedImage}
      />

      <TextField label="Nome" onChangeText={setName} placeholder="Ex.: Arroz 5 kg" value={name} />
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categories}>
        {categoriesQuery.data?.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => setCategoryId(category.id)}
            style={[
              styles.chip,
              categoryId === category.id && styles.chipActive,
            ]}
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
      <TextField
        label="Unidade / peso"
        onChangeText={setUnitLabel}
        placeholder="pacote 5 kg"
        value={unitLabel}
      />
      <TextField
        keyboardType="decimal-pad"
        label="Preço (R$)"
        onChangeText={setPrice}
        placeholder="24,90"
        value={price}
      />
      <TextField
        keyboardType="number-pad"
        label="Estoque"
        onChangeText={setStock}
        placeholder="24"
        value={stock}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton
        disabled={isSaving}
        label={isSaving ? 'Salvando…' : 'Cadastrar produto'}
        onPress={() => void onSave()}
      />
      <AppButton
        label="Cancelar"
        onPress={() => router.back()}
        variant="secondary"
      />
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
  error: {
    color: colors.danger,
    fontFamily: typography.interfaceMedium,
  },
});
