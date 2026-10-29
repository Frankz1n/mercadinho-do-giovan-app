import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  ProductCard,
  SearchField,
  ShopScreen,
  StoreLoadingState,
  StoreMessage,
} from '@/components/ui';
import { useCart } from '@/features/cart/cart-context';
import { useCategories, useProducts } from '@/features/catalog/data/catalog-queries';
import type { ProductVisual as ProductVisualType } from '@/features/catalog/domain/catalog';
import { hasLocalProductImage } from '@/features/catalog/product-images';
import { colors, radii, shadows, spacing, typography } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const categoryIcons: Record<ProductVisualType, IoniconName> = {
  rice: 'nutrition-outline',
  milk: 'water-outline',
  beans: 'ellipse-outline',
  eggs: 'egg-outline',
  produce: 'leaf-outline',
  cleaning: 'sparkles-outline',
  coffee: 'cafe-outline',
  pasta: 'restaurant-outline',
};

const bannerImage =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const categoriesQuery = useCategories();
  const productsQuery = useProducts({ search });
  const { addItem, decrementItem, getItemQuantity } = useCart();
  const products = useMemo(() => {
    const items = productsQuery.data?.pages.flatMap((page) => page.items) ?? [];
    if (search.trim()) {
      return items;
    }
    return items.filter((product) => hasLocalProductImage(product.id));
  }, [productsQuery.data, search]);

  return (
    <ShopScreen showCart={false} title="Mercadinho do Giovan">
      <SearchField onChangeText={setSearch} value={search} />

      <View style={styles.banner}>
        <Image contentFit="cover" source={{ uri: bannerImage }} style={styles.bannerImage} />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Qualidade e preço justo todo dia!</Text>
        </View>
      </View>

      <View style={styles.section}>
        {categoriesQuery.isPending ? (
          <StoreLoadingState />
        ) : (
          <ScrollView
            contentContainerStyle={styles.chips}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categoriesQuery.data?.map((category) => (
              <Pressable
                key={category.id}
                onPress={() =>
                  router.push({
                    pathname: '/(shop)/categories',
                    params: { categoryId: category.id },
                  })
                }
                style={styles.categoryItem}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons
                    color={colors.brand.primary}
                    name={categoryIcons[category.visual]}
                    size={24}
                  />
                </View>
                <Text style={styles.categoryLabel}>{category.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {search.trim() ? 'Resultado da busca' : 'Para o seu dia a dia'}
          </Text>
          {!search.trim() ? (
            <Pressable onPress={() => router.push('/(shop)/categories')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </Pressable>
          ) : null}
        </View>

        {productsQuery.isPending ? (
          <StoreLoadingState />
        ) : productsQuery.isError ? (
          <StoreMessage
            description="Não foi possível carregar o catálogo."
            onRetry={() => void productsQuery.refetch()}
            title="Falha ao carregar"
            variant="error"
          />
        ) : products.length === 0 ? (
          <StoreMessage
            description="Tente outro termo ou explore as categorias."
            title="Nenhum produto encontrado"
          />
        ) : (
          <View style={styles.grid}>
            {products.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard
                  onAdd={() => addItem('product', product.id)}
                  onDecrement={() => decrementItem('product', product.id)}
                  onOpen={() =>
                    router.push({
                      pathname: '/product/[id]',
                      params: { id: product.id },
                    })
                  }
                  product={product}
                  quantity={getItemQuantity('product', product.id)}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </ShopScreen>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radii.lg,
    height: 140,
    overflow: 'hidden',
    ...shadows.card,
  },
  bannerImage: {
    ...StyleSheet.absoluteFill,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 28, 108, 0.7)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  bannerTitle: {
    color: colors.text.inverse,
    fontFamily: typography.brandSemibold,
    fontSize: 22,
    lineHeight: 28,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 19,
  },
  seeAll: {
    color: colors.brand.mid,
    fontFamily: typography.interfaceMedium,
    fontSize: 13,
  },
  chips: {
    gap: spacing.md,
    paddingVertical: spacing.xxs,
  },
  categoryItem: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 76,
  },
  categoryIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    height: 64,
    justifyContent: 'center',
    width: 64,
    ...shadows.card,
  },
  categoryLabel: {
    color: colors.text.primary,
    fontFamily: typography.interfaceMedium,
    fontSize: 12,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  gridItem: {
    width: '48%',
  },
});
