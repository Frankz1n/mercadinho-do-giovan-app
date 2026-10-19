import type {
  CatalogRepository,
  ProductDraft,
  StockAdjustment,
} from '@/features/catalog/data/catalog-repository';
import type {
  Basket,
  BasketComponent,
  Category,
  Product,
  ProductPage,
  ProductQuery,
  ProductVisual,
} from '@/features/catalog/domain/catalog';
import { requestPush } from '@/features/notifications/push-api';
import { formatCurrencyFromCents } from '@/lib/currency';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';

type ProductRow = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  unit_label: string;
  price_cents: number;
  stock_quantity: number;
  is_featured: boolean;
  visual: string;
  image_url: string;
};

type BasketRow = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
  basket_components: { product_id: string; quantity: number }[] | null;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    unitLabel: row.unit_label,
    priceCents: row.price_cents,
    stockQuantity: row.stock_quantity,
    isFeatured: row.is_featured,
    visual: row.visual as ProductVisual,
    imageUrl: row.image_url,
  };
}

function mapBasket(row: BasketRow): Basket {
  const components: BasketComponent[] = (row.basket_components ?? []).map((component) => ({
    productId: component.product_id,
    quantity: component.quantity,
  }));

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    imageUrl: row.image_url,
    components,
  };
}

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

class SupabaseCatalogRepository implements CatalogRepository {
  async getProduct(productId: string) {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('products')
      .select(
        'id, category_id, name, description, unit_label, price_cents, stock_quantity, is_featured, visual, image_url',
      )
      .eq('id', productId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapProduct(data as ProductRow) : null;
  }

  async getProductsByIds(productIds: readonly string[]) {
    if (productIds.length === 0) {
      return [];
    }

    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('products')
      .select(
        'id, category_id, name, description, unit_label, price_cents, stock_quantity, is_featured, visual, image_url',
      )
      .in('id', [...productIds])
      .eq('is_active', true);

    if (error) {
      throw new Error(error.message);
    }

    const productMap = new Map(
      ((data ?? []) as ProductRow[]).map((row) => [row.id, mapProduct(row)]),
    );

    return productIds.flatMap((productId) => {
      const product = productMap.get(productId);
      return product ? [product] : [];
    });
  }

  async listBaskets() {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('baskets')
      .select(
        'id, name, description, price_cents, image_url, basket_components(product_id, quantity)',
      )
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as BasketRow[]).map(mapBasket);
  }

  async listCategories() {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, visual')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as { id: string; name: string; visual: string }[]).map(
      (row): Category => ({
        id: row.id,
        name: row.name,
        visual: row.visual as ProductVisual,
      }),
    );
  }

  async listProducts(query: ProductQuery = {}): Promise<ProductPage> {
    assertSupabaseConfigured();

    const {
      categoryId,
      featuredOnly = false,
      limit = 8,
      offset = 0,
      search = '',
    } = query;

    let request = supabase
      .from('products')
      .select(
        'id, category_id, name, description, unit_label, price_cents, stock_quantity, is_featured, visual, image_url',
      )
      .eq('is_active', true)
      .order('name');

    if (categoryId) {
      request = request.eq('category_id', categoryId);
    }

    if (featuredOnly) {
      request = request.eq('is_featured', true);
    }

    // Busca no cliente após fetch filtrado por categoria/destaque — evita dependência de extensão unaccent.
    const { data, error } = await request;

    if (error) {
      throw new Error(error.message);
    }

    const normalizedSearch = normalizeSearchValue(search);
    const filtered = ((data ?? []) as ProductRow[])
      .map(mapProduct)
      .filter((product) => {
        if (!normalizedSearch) {
          return true;
        }
        const searchableText = normalizeSearchValue(
          `${product.name} ${product.description} ${product.unitLabel}`,
        );
        return searchableText.includes(normalizedSearch);
      });

    const items = filtered.slice(offset, offset + limit);
    const nextOffset = offset + items.length;

    return {
      items,
      hasNextPage: nextOffset < filtered.length,
      nextOffset: nextOffset < filtered.length ? nextOffset : null,
    };
  }

  async applyStockAdjustments(adjustments: readonly StockAdjustment[]) {
    if (adjustments.length === 0) {
      return;
    }

    assertSupabaseConfigured();

    const { error } = await supabase.rpc('adjust_stock', {
      p_adjustments: adjustments.map((adjustment) => ({
        productId: adjustment.productId,
        quantityDelta: adjustment.quantityDelta,
      })),
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async upsertProduct(draft: ProductDraft) {
    assertSupabaseConfigured();

    let previousPriceCents: number | null = null;
    if (draft.id) {
      const { data: existing } = await supabase
        .from('products')
        .select('price_cents')
        .eq('id', draft.id)
        .maybeSingle();
      previousPriceCents = existing?.price_cents ?? null;
    }

    const basePayload = {
      category_id: draft.categoryId,
      name: draft.name.trim(),
      description: draft.description.trim(),
      unit_label: draft.unitLabel.trim(),
      price_cents: draft.priceCents,
      stock_quantity: Math.max(0, draft.stockQuantity),
      is_featured: draft.isFeatured,
      visual: draft.visual,
      image_url: draft.imageUrl.trim(),
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const query = draft.id
      ? supabase
          .from('products')
          .upsert({ ...basePayload, id: draft.id }, { onConflict: 'id' })
      : supabase.from('products').insert(basePayload);

    const { data, error } = await query
      .select(
        'id, category_id, name, description, unit_label, price_cents, stock_quantity, is_featured, visual, image_url',
      )
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Não foi possível salvar o produto.');
    }

    const product = mapProduct(data as ProductRow);

    if (
      previousPriceCents !== null &&
      product.priceCents < previousPriceCents
    ) {
      void requestPush({
        audience: 'customers',
        title: 'Promoção no Mercadinho',
        body: `${product.name} agora por ${formatCurrencyFromCents(product.priceCents)}`,
        data: { productId: product.id, type: 'price_drop' },
      });
    }

    return product;
  }

  async removeProduct(productId: string) {
    assertSupabaseConfigured();

    const { error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', productId);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export const catalogRepository: CatalogRepository = new SupabaseCatalogRepository();
