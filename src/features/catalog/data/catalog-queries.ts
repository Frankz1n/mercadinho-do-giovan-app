import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { catalogRepository } from '@/features/catalog/data/supabase-catalog-repository';

export const catalogQueryKeys = {
  all: ['catalog'] as const,
  baskets: () => [...catalogQueryKeys.all, 'baskets'] as const,
  categories: () => [...catalogQueryKeys.all, 'categories'] as const,
  product: (productId: string) =>
    [...catalogQueryKeys.all, 'product', productId] as const,
  productsByIds: (productIds: readonly string[]) =>
    [...catalogQueryKeys.all, 'products-by-ids', ...productIds] as const,
  products: (categoryId: string | undefined, search: string, featuredOnly: boolean) =>
    [...catalogQueryKeys.all, 'products', categoryId, search, featuredOnly] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: catalogQueryKeys.categories(),
    queryFn: () => catalogRepository.listCategories(),
    staleTime: 30_000,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: catalogQueryKeys.product(productId),
    queryFn: () => catalogRepository.getProduct(productId),
    enabled: Boolean(productId),
    staleTime: 30_000,
  });
}

export function useProductsByIds(productIds: readonly string[]) {
  return useQuery({
    queryKey: catalogQueryKeys.productsByIds(productIds),
    queryFn: () => catalogRepository.getProductsByIds(productIds),
    enabled: productIds.length > 0,
    staleTime: 30_000,
  });
}

export function useProducts({
  categoryId,
  featuredOnly = false,
  search = '',
}: {
  categoryId?: string;
  featuredOnly?: boolean;
  search?: string;
}) {
  return useInfiniteQuery({
    queryKey: catalogQueryKeys.products(categoryId, search, featuredOnly),
    queryFn: ({ pageParam }) =>
      catalogRepository.listProducts({
        categoryId,
        featuredOnly,
        limit: 6,
        offset: pageParam,
        search,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: 30_000,
  });
}

export function useBaskets() {
  return useQuery({
    queryKey: catalogQueryKeys.baskets(),
    queryFn: () => catalogRepository.listBaskets(),
    staleTime: 30_000,
  });
}

/** Lista completa para o painel admin (sem paginação de 6 itens da loja). */
export function useAdminProducts(search = '') {
  return useQuery({
    queryKey: [...catalogQueryKeys.all, 'admin-products', search] as const,
    queryFn: async () => {
      const page = await catalogRepository.listProducts({
        search,
        limit: 500,
        offset: 0,
      });
      return page.items;
    },
    staleTime: 10_000,
  });
}
