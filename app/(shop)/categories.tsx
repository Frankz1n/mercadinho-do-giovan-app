import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  AppButton,
  CategoryChip,
  ProductCard,
  SearchField,
  ShopScreen,
  StoreLoadingState,
  StoreMessage,
} from '@/components/ui';
import { useCart } from '@/features/cart/cart-context';
import { useCategories, useProducts } from '@/features/catalog/data/catalog-queries';
import { colors, radii, spacing } from '@/theme';

export default function CategoriesScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [categoryId, setCategoryId] = useState<string | undefined>(params.categoryId);
  const [search, setSearch] = useState('');
  const categoriesQuery = useCategories();
  const productsQuery = useProducts({ categoryId, search });
  const { addItem, decrementItem, getItemQuantity } = useCart();
  const products = useMemo(
    () => productsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [productsQuery.data],
  );

  return (
    <ShopScreen title="Produtos">
      <View style={styles.searchRow}>
        <View style={styles.searchFlex}>
          <SearchField onChangeText={setSearch} value={search} />
        </View>
        <Pressable accessibilityLabel="Filtros" style={styles.filterButton}>
          <Ionicons color={colors.brand.primary} name="options-outline" size={22} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.chips}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <CategoryChip
          isSelected={!categoryId}
          label="Todos"
          onPress={() => setCategoryId(undefined)}
        />
        {categoriesQuery.data?.map((category) => (
          <CategoryChip
            isSelected={category.id === categoryId}
            key={category.id}
            label={category.name}
            onPress={() => setCategoryId(category.id)}
          />
        ))}
      </ScrollView>

      {productsQuery.isPending ? (
        <StoreLoadingState />
      ) : productsQuery.isError ? (
        <StoreMessage
          description="Não foi possível consultar os produtos."
          onRetry={() => void productsQuery.refetch()}
          title="Falha ao carregar"
          variant="error"
        />
      ) : products.length === 0 ? (
        <StoreMessage
          description="Altere a busca ou selecione outra categoria."
          title="Nenhum produto encontrado"
        />
      ) : (
        <>
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
          {productsQuery.hasNextPage ? (
            <AppButton
              disabled={productsQuery.isFetchingNextPage}
              label={
                productsQuery.isFetchingNextPage ? 'Carregando...' : 'Carregar mais'
              }
              onPress={() => void productsQuery.fetchNextPage()}
              variant="secondary"
            />
          ) : null}
        </>
      )}
    </ShopScreen>
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
  chips: {
    gap: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 148,
  },
});
