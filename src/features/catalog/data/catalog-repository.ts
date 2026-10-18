import type {
  Basket,
  Category,
  Product,
  ProductPage,
  ProductQuery,
} from '@/features/catalog/domain/catalog';

export type StockAdjustment = Readonly<{
  productId: string;
  quantityDelta: number;
}>;

export type ProductDraft = Omit<Product, 'id'> & { id?: string };

export interface CatalogRepository {
  getProduct(productId: string): Promise<Product | null>;
  getProductsByIds(productIds: readonly string[]): Promise<readonly Product[]>;
  listBaskets(): Promise<readonly Basket[]>;
  listCategories(): Promise<readonly Category[]>;
  listProducts(query?: ProductQuery): Promise<ProductPage>;
  applyStockAdjustments(adjustments: readonly StockAdjustment[]): Promise<void>;
  upsertProduct(draft: ProductDraft): Promise<Product>;
  removeProduct(productId: string): Promise<void>;
}
