import type { StockAdjustment } from '@/features/catalog/data/catalog-repository';
import type { Basket, Product } from '@/features/catalog/domain/catalog';
import type { OrderItem } from '@/features/orders/domain/order';

export function buildStockAdjustmentsFromOrderItems(input: {
  items: readonly OrderItem[];
  productsById: ReadonlyMap<string, Product>;
  basketsById: ReadonlyMap<string, Basket>;
  multiplier: 1 | -1;
}): StockAdjustment[] {
  const deltas = new Map<string, number>();

  for (const item of input.items) {
    if (item.kind === 'product') {
      deltas.set(item.id, (deltas.get(item.id) ?? 0) + item.quantity * input.multiplier);
      continue;
    }

    const basket = input.basketsById.get(item.id);
    if (!basket) {
      continue;
    }

    for (const component of basket.components) {
      const delta = component.quantity * item.quantity * input.multiplier;
      deltas.set(component.productId, (deltas.get(component.productId) ?? 0) + delta);
    }
  }

  return [...deltas.entries()].map(([productId, quantityDelta]) => ({
    productId,
    quantityDelta,
  }));
}
