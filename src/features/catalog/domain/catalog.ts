export type ProductVisual =
  | 'rice'
  | 'milk'
  | 'beans'
  | 'eggs'
  | 'produce'
  | 'cleaning'
  | 'coffee'
  | 'pasta';

export type Category = Readonly<{
  id: string;
  name: string;
  visual: ProductVisual;
}>;

export type Product = Readonly<{
  id: string;
  categoryId: string;
  name: string;
  description: string;
  unitLabel: string;
  priceCents: number;
  stockQuantity: number;
  isFeatured: boolean;
  visual: ProductVisual;
  imageUrl: string;
}>;

export type BasketComponent = Readonly<{
  productId: string;
  quantity: number;
}>;

export type Basket = Readonly<{
  id: string;
  name: string;
  description: string;
  priceCents: number;
  components: readonly BasketComponent[];
  imageUrl: string;
}>;

export type ProductQuery = Readonly<{
  categoryId?: string;
  search?: string;
  offset?: number;
  limit?: number;
  featuredOnly?: boolean;
}>;

export type ProductPage = Readonly<{
  items: readonly Product[];
  hasNextPage: boolean;
  nextOffset: number | null;
}>;

export type CartItemKind = 'product' | 'basket';

export type CartItemReference = Readonly<{
  id: string;
  kind: CartItemKind;
  quantity: number;
}>;
