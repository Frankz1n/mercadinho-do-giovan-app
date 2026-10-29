import type { ImageSource } from 'expo-image';
import { useMemo } from 'react';

import { useCart } from '@/features/cart/cart-context';
import { resolveBasketImageSource } from '@/features/catalog/basket-images';
import {
  useBaskets,
  useProductsByIds,
} from '@/features/catalog/data/catalog-queries';
import type { CartItemKind } from '@/features/catalog/domain/catalog';
import { resolveProductImageSource } from '@/features/catalog/product-images';

export type ResolvedCartItem = Readonly<{
  id: string;
  kind: CartItemKind;
  imageSource: ImageSource | null;
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
  const catalogReady =
    cart.isHydrated &&
    !(productIds.length > 0 && productsQuery.isPending) &&
    !basketsQuery.isPending;

  const resolvedItems = useMemo(
    () =>
      cart.items.flatMap((item): ResolvedCartItem[] => {
        if (item.kind === 'product') {
          const product = productMap.get(item.id);
          return product
            ? [
                {
                  ...item,
                  imageSource: resolveProductImageSource(
                    product.id,
                    product.imageUrl,
                  ),
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
                imageSource: resolveBasketImageSource(
                  basket.id,
                  basket.imageUrl,
                ),
                name: basket.name,
                priceCents: basket.priceCents,
                unitLabel: 'cesta',
              },
            ]
          : [];
      }),
    [basketMap, cart.items, productMap],
  );

  const unavailableItems = useMemo(() => {
    if (!catalogReady) {
      return [] as const;
    }
    return cart.items.filter((item) => {
      if (item.kind === 'product') {
        return !productMap.has(item.id);
      }
      return !basketMap.has(item.id);
    });
  }, [basketMap, cart.items, catalogReady, productMap]);

  const subtotalCents = resolvedItems.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  );

  const removeUnavailableItems = () => {
    for (const item of unavailableItems) {
      cart.removeItem(item.kind, item.id);
    }
  };

  return {
    ...cart,
    isError: productsQuery.isError || basketsQuery.isError,
    isPending: !catalogReady,
    removeUnavailableItems,
    resolvedItems,
    subtotalCents,
    unavailableItems,
  } as const;
}
