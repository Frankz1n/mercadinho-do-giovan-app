import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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
import { spacing } from '@/theme';

export default function CategoriesScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const initialCategoryId =
    typeof params.categoryId === 'string' ? params.categoryId : undefined;
  const [categoryId, setCategoryId] = useState<string | undefined>(initialCategoryId);
  const [search, setSearch] = useState('');
  const categoriesQuery = useCategories();
  const productsQuery = useProducts({ categoryId, search });
  const { addItem, decrementItem, getItemQuantity } = useCart();
  const products = useMemo(
    () => productsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [productsQuery.data],
  );
  const selectedCategoryName = useMemo(
    () => categoriesQuery.data?.find((category) => category.id === categoryId)?.name,
    [categoriesQuery.data, categoryId],
  );

  useEffect(() => {
    setCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  return (
    <ShopScreen title="Produtos">
      <SearchField onChangeText={setSearch} value={search} />

      <ScrollView
        contentContainerStyle={styles.chips}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
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
          description={
            selectedCategoryName
              ? `Ainda não há itens em ${selectedCategoryName}. Toque em Todos para ver o catálogo.`
              : 'Altere a busca ou selecione outra categoria.'
          }
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
  chipsScroll: {
    flexGrow: 0,
  },
  chips: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingEnd: spacing.md,
    paddingVertical: spacing.xxs,
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
