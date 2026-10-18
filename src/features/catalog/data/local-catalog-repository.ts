import type {
  CatalogRepository,
  ProductDraft,
  StockAdjustment,
} from '@/features/catalog/data/catalog-repository';
import type {
  Basket,
  Category,
  Product,
  ProductPage,
  ProductQuery,
} from '@/features/catalog/domain/catalog';
import { readJson, writeJson } from '@/lib/storage';

const STOCK_KEY = '@mercadinho/stock-overrides';
const CUSTOM_PRODUCTS_KEY = '@mercadinho/custom-products';
const REMOVED_PRODUCTS_KEY = '@mercadinho/removed-products';
const PRODUCT_OVERRIDES_KEY = '@mercadinho/product-overrides';

const categories: readonly Category[] = [
  { id: 'produce', name: 'Hortifruti', visual: 'produce' },
  { id: 'pantry', name: 'Mercearia', visual: 'rice' },
  { id: 'beverages', name: 'Bebidas', visual: 'milk' },
  { id: 'cleaning', name: 'Limpeza', visual: 'cleaning' },
];

const baseProducts: readonly Product[] = [
  {
    id: 'rice-5kg',
    categoryId: 'pantry',
    name: 'Arroz tipo 1',
    description: 'Arroz branco tipo 1, grãos selecionados para o dia a dia.',
    unitLabel: 'pacote 5 kg',
    priceCents: 2490,
    stockQuantity: 40,
    isFeatured: true,
    visual: 'rice',
    imageUrl:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'beans-1kg',
    categoryId: 'pantry',
    name: 'Feijão carioca',
    description: 'Feijão carioca de cozimento rápido, ideal para o almoço.',
    unitLabel: 'pacote 1 kg',
    priceCents: 899,
    stockQuantity: 55,
    isFeatured: true,
    visual: 'beans',
    imageUrl:
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pasta-500g',
    categoryId: 'pantry',
    name: 'Macarrão espaguete',
    description: 'Massa de semolina, cozimento al dente.',
    unitLabel: 'pacote 500 g',
    priceCents: 449,
    stockQuantity: 60,
    isFeatured: false,
    visual: 'pasta',
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'coffee-500g',
    categoryId: 'pantry',
    name: 'Café torrado e moído',
    description: 'Café tradicional torrado e moído, embalagem familiar.',
    unitLabel: 'pacote 500 g',
    priceCents: 1890,
    stockQuantity: 28,
    isFeatured: true,
    visual: 'coffee',
    imageUrl:
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'oil-900ml',
    categoryId: 'pantry',
    name: 'Óleo de soja',
    description: 'Óleo de soja refinado para frituras e refogados.',
    unitLabel: 'garrafa 900 ml',
    priceCents: 699,
    stockQuantity: 45,
    isFeatured: false,
    visual: 'rice',
    imageUrl:
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'milk-1l',
    categoryId: 'beverages',
    name: 'Leite integral UHT',
    description: 'Leite integral longa vida, caixa de 1 litro.',
    unitLabel: 'caixa 1 L',
    priceCents: 549,
    stockQuantity: 70,
    isFeatured: true,
    visual: 'milk',
    imageUrl:
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'eggs-12',
    categoryId: 'pantry',
    name: 'Ovos brancos',
    description: 'Bandeja com uma dúzia de ovos brancos frescos.',
    unitLabel: 'dúzia',
    priceCents: 1290,
    stockQuantity: 35,
    isFeatured: true,
    visual: 'eggs',
    imageUrl:
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cheese-200g',
    categoryId: 'pantry',
    name: 'Queijo mussarela fatiado',
    description: 'Queijo mussarela fatiado para lanches e sanduíches.',
    unitLabel: 'pacote 200 g',
    priceCents: 1490,
    stockQuantity: 18,
    isFeatured: false,
    visual: 'milk',
    imageUrl:
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'soda-2l',
    categoryId: 'beverages',
    name: 'Refrigerante 2L',
    description: 'Refrigerante tradicional em garrafa de 2 litros.',
    unitLabel: 'garrafa 2 L',
    priceCents: 999,
    stockQuantity: 40,
    isFeatured: true,
    visual: 'milk',
    imageUrl:
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'juice-1l',
    categoryId: 'beverages',
    name: 'Suco de uva integral',
    description: 'Suco de uva 100% integral, sem adição de açúcar.',
    unitLabel: 'garrafa 1 L',
    priceCents: 1490,
    stockQuantity: 22,
    isFeatured: false,
    visual: 'produce',
    imageUrl:
      'https://images.unsplash.com/photo-1600271886742-f049cd341b88?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'water-1_5l',
    categoryId: 'beverages',
    name: 'Água mineral',
    description: 'Água mineral sem gás, garrafa familiar.',
    unitLabel: 'garrafa 1,5 L',
    priceCents: 299,
    stockQuantity: 80,
    isFeatured: false,
    visual: 'milk',
    imageUrl:
      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'banana-1kg',
    categoryId: 'produce',
    name: 'Banana prata',
    description: 'Banana prata selecionada, bandeja com cerca de 1 kg.',
    unitLabel: 'bandeja 1 kg',
    priceCents: 799,
    stockQuantity: 25,
    isFeatured: true,
    visual: 'produce',
    imageUrl:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tomato-500g',
    categoryId: 'produce',
    name: 'Tomate',
    description: 'Tomate fresco para saladas e molhos.',
    unitLabel: 'bandeja 500 g',
    priceCents: 649,
    stockQuantity: 22,
    isFeatured: false,
    visual: 'produce',
    imageUrl:
      'https://images.unsplash.com/photo-1546470427-e26264be0d16?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'potato-1kg',
    categoryId: 'produce',
    name: 'Batata inglesa',
    description: 'Batata inglesa lavada, embalagem de 1 kg.',
    unitLabel: 'pacote 1 kg',
    priceCents: 599,
    stockQuantity: 30,
    isFeatured: false,
    visual: 'produce',
    imageUrl:
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'onion-1kg',
    categoryId: 'produce',
    name: 'Cebola',
    description: 'Cebola amarela selecionada, pacote de 1 kg.',
    unitLabel: 'pacote 1 kg',
    priceCents: 549,
    stockQuantity: 27,
    isFeatured: false,
    visual: 'produce',
    imageUrl:
      'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'detergent-500ml',
    categoryId: 'cleaning',
    name: 'Detergente neutro',
    description: 'Detergente líquido neutro para louças.',
    unitLabel: 'frasco 500 ml',
    priceCents: 279,
    stockQuantity: 50,
    isFeatured: false,
    visual: 'cleaning',
    imageUrl:
      'https://images.unsplash.com/photo-1583947215259-38e31bebd861?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'soap-powder-800g',
    categoryId: 'cleaning',
    name: 'Sabão em pó',
    description: 'Sabão em pó concentrado para máquina e tanque.',
    unitLabel: 'pacote 800 g',
    priceCents: 1290,
    stockQuantity: 20,
    isFeatured: true,
    visual: 'cleaning',
    imageUrl:
      'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'disinfectant-1l',
    categoryId: 'cleaning',
    name: 'Desinfetante',
    description: 'Desinfetante aromático para pisos e superfícies.',
    unitLabel: 'frasco 1 L',
    priceCents: 799,
    stockQuantity: 32,
    isFeatured: false,
    visual: 'cleaning',
    imageUrl:
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80',
  },
];

const baskets: readonly Basket[] = [
  {
    id: 'basket-basic',
    name: 'Cesta básica',
    description: 'Arroz, feijão, macarrão e café para a semana.',
    priceCents: 6990,
    imageUrl:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    components: [
      { productId: 'rice-5kg', quantity: 1 },
      { productId: 'beans-1kg', quantity: 2 },
      { productId: 'pasta-500g', quantity: 2 },
      { productId: 'coffee-500g', quantity: 1 },
    ],
  },
  {
    id: 'basket-breakfast',
    name: 'Cesta café da manhã',
    description: 'Leite, café, ovos e banana para começar o dia.',
    priceCents: 4290,
    imageUrl:
      'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=800&q=80',
    components: [
      { productId: 'milk-1l', quantity: 3 },
      { productId: 'coffee-500g', quantity: 1 },
      { productId: 'eggs-12', quantity: 1 },
      { productId: 'banana-1kg', quantity: 1 },
    ],
  },
];

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

async function getStockOverrides(): Promise<Record<string, number>> {
  return readJson<Record<string, number>>(STOCK_KEY, {});
}

async function getCatalogProducts(): Promise<Product[]> {
  const [custom, removed, overrides, stock] = await Promise.all([
    readJson<Product[]>(CUSTOM_PRODUCTS_KEY, []),
    readJson<string[]>(REMOVED_PRODUCTS_KEY, []),
    readJson<Record<string, Product>>(PRODUCT_OVERRIDES_KEY, {}),
    getStockOverrides(),
  ]);
  const removedSet = new Set(removed);
  const merged = [
    ...baseProducts.filter((product) => !removedSet.has(product.id)),
    ...custom.filter((product) => !removedSet.has(product.id)),
  ].map((product) => overrides[product.id] ?? product);

  return merged.map((product) => ({
    ...product,
    stockQuantity:
      stock[product.id] !== undefined ? stock[product.id] : product.stockQuantity,
  }));
}

class LocalCatalogRepository implements CatalogRepository {
  async getProduct(productId: string) {
    const products = await getCatalogProducts();
    return products.find((product) => product.id === productId) ?? null;
  }

  async getProductsByIds(productIds: readonly string[]) {
    const products = await getCatalogProducts();
    const productMap = new Map(products.map((product) => [product.id, product]));
    return productIds.flatMap((productId) => {
      const product = productMap.get(productId);
      return product ? [product] : [];
    });
  }

  async listBaskets() {
    return baskets;
  }

  async listCategories() {
    return categories;
  }

  async listProducts(query: ProductQuery = {}): Promise<ProductPage> {
    const {
      categoryId,
      featuredOnly = false,
      limit = 8,
      offset = 0,
      search = '',
    } = query;
    const normalizedSearch = normalizeSearchValue(search);
    const products = await getCatalogProducts();
    const filteredProducts = products.filter((product) => {
      const matchesCategory = !categoryId || product.categoryId === categoryId;
      const matchesFeatured = !featuredOnly || product.isFeatured;
      const searchableText = normalizeSearchValue(
        `${product.name} ${product.description} ${product.unitLabel}`,
      );
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesCategory && matchesFeatured && matchesSearch;
    });
    const items = filteredProducts.slice(offset, offset + limit);
    const nextOffset = offset + items.length;

    return {
      items,
      hasNextPage: nextOffset < filteredProducts.length,
      nextOffset: nextOffset < filteredProducts.length ? nextOffset : null,
    };
  }

  async applyStockAdjustments(adjustments: readonly StockAdjustment[]) {
    if (adjustments.length === 0) {
      return;
    }

    const products = await getCatalogProducts();
    const stockById = new Map(products.map((product) => [product.id, product.stockQuantity]));

    for (const adjustment of adjustments) {
      const current = stockById.get(adjustment.productId);
      if (current === undefined) {
        continue;
      }
      stockById.set(
        adjustment.productId,
        Math.max(0, current + adjustment.quantityDelta),
      );
    }

    const overrides: Record<string, number> = {};
    for (const [productId, quantity] of stockById) {
      overrides[productId] = quantity;
    }
    await writeJson(STOCK_KEY, overrides);
  }

  async upsertProduct(draft: ProductDraft) {
    const id = draft.id ?? `product-${Date.now()}`;
    const nextProduct: Product = {
      id,
      categoryId: draft.categoryId,
      name: draft.name.trim(),
      description: draft.description.trim(),
      unitLabel: draft.unitLabel.trim(),
      priceCents: draft.priceCents,
      stockQuantity: Math.max(0, draft.stockQuantity),
      isFeatured: draft.isFeatured,
      visual: draft.visual,
      imageUrl: draft.imageUrl.trim(),
    };

    const existsInBase = baseProducts.some((product) => product.id === id);
    if (existsInBase) {
      const overrides = await readJson<Record<string, Product>>(PRODUCT_OVERRIDES_KEY, {});
      overrides[id] = nextProduct;
      await writeJson(PRODUCT_OVERRIDES_KEY, overrides);
    } else {
      const custom = await readJson<Product[]>(CUSTOM_PRODUCTS_KEY, []);
      const index = custom.findIndex((product) => product.id === id);
      const nextCustom =
        index >= 0
          ? custom.map((product, productIndex) =>
              productIndex === index ? nextProduct : product,
            )
          : [...custom, nextProduct];
      await writeJson(CUSTOM_PRODUCTS_KEY, nextCustom);
    }

    const stock = await getStockOverrides();
    stock[id] = nextProduct.stockQuantity;
    await writeJson(STOCK_KEY, stock);

    const removed = await readJson<string[]>(REMOVED_PRODUCTS_KEY, []);
    await writeJson(
      REMOVED_PRODUCTS_KEY,
      removed.filter((productId) => productId !== id),
    );

    return nextProduct;
  }

  async removeProduct(productId: string) {
    const removed = await readJson<string[]>(REMOVED_PRODUCTS_KEY, []);
    if (!removed.includes(productId)) {
      await writeJson(REMOVED_PRODUCTS_KEY, [...removed, productId]);
    }

    const custom = await readJson<Product[]>(CUSTOM_PRODUCTS_KEY, []);
    await writeJson(
      CUSTOM_PRODUCTS_KEY,
      custom.filter((product) => product.id !== productId),
    );

    const overrides = await readJson<Record<string, Product>>(PRODUCT_OVERRIDES_KEY, {});
    if (overrides[productId]) {
      delete overrides[productId];
      await writeJson(PRODUCT_OVERRIDES_KEY, overrides);
    }
  }
}

export const catalogRepository: CatalogRepository = new LocalCatalogRepository();
