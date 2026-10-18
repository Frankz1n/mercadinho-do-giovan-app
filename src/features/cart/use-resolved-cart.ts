import { useMemo } from 'react';

import { useCart } from '@/features/cart/cart-context';
import {
  useBaskets,
  useProductsByIds,
} from '@/features/catalog/data/catalog-queries';
import type { CartItemKind } from '@/features/catalog/domain/catalog';

export type ResolvedCartItem = Readonly<{
  id: string;
  kind: CartItemKind;
  imageUrl: string | null;
  name: string;
  priceCents: number;
  quantity: number;
  unitLabel: string;
}>;

export function useResolvedCart() {
  const cart = useCart();
  const productIds = useMemo(
    () => cart.items.filter((item) => item.kind === 'product').map((item) => item.id),
    [cart.items],
  );
  const productsQuery = useProductsByIds(productIds);
  const basketsQuery = useBaskets();
  const productMap = useMemo(
    () => new Map(productsQuery.data?.map((product) => [product.id, product]) ?? []),
    [productsQuery.data],
  );
  const basketMap = useMemo(
    () => new Map(basketsQuery.data?.map((basket) => [basket.id, basket]) ?? []),
    [basketsQuery.data],
  );
  const resolvedItems = useMemo(
    () =>
      cart.items.flatMap((item): ResolvedCartItem[] => {
        if (item.kind === 'product') {
          const product = productMap.get(item.id);
          return product
            ? [
                {
                  ...item,
                  imageUrl: product.imageUrl,
                  name: product.name,
                  priceCents: product.priceCents,
                  unitLabel: product.unitLabel,
                },
              ]
            : [];
        }

        const basket = basketMap.get(item.id);
        return basket
          ? [
              {
                ...item,
                imageUrl: basket.imageUrl,
                name: basket.name,
                priceCents: basket.priceCents,
                unitLabel: 'cesta',
              },
            ]
          : [];
      }),
    [basketMap, cart.items, productMap],
  );
  const subtotalCents = resolvedItems.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  );

  return {
    ...cart,
    isError: productsQuery.isError || basketsQuery.isError,
    isPending:
      !cart.isHydrated ||
      (productIds.length > 0 && productsQuery.isPending) ||
      basketsQuery.isPending,
    resolvedItems,
    subtotalCents,
  } as const;
}
