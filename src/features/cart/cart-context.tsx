import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from 'react';

import type {
  CartItemKind,
  CartItemReference,
} from '@/features/catalog/domain/catalog';

const CART_STORAGE_KEY = 'mercadinho-giovan:cart:v1';
const MAX_ITEM_QUANTITY = 20;

type CartState = Readonly<{
  isHydrated: boolean;
  items: readonly CartItemReference[];
}>;

type CartAction =
  | { type: 'hydrate'; items: readonly CartItemReference[] }
  | { type: 'add'; id: string; kind: CartItemKind }
  | { type: 'decrement'; id: string; kind: CartItemKind }
  | { type: 'remove'; id: string; kind: CartItemKind }
  | { type: 'clear' };

type CartContextValue = Readonly<{
  items: readonly CartItemReference[];
  isHydrated: boolean;
  totalCount: number;
  addItem: (kind: CartItemKind, id: string) => void;
  decrementItem: (kind: CartItemKind, id: string) => void;
  removeItem: (kind: CartItemKind, id: string) => void;
  clearCart: () => void;
  getItemQuantity: (kind: CartItemKind, id: string) => number;
}>;

const CartContext = createContext<CartContextValue | null>(null);

function hasSameReference(
  item: CartItemReference,
  kind: CartItemKind,
  id: string,
) {
  return item.kind === kind && item.id === id;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'hydrate':
      return { isHydrated: true, items: action.items };
    case 'add': {
      const existingItem = state.items.find((item) =>
        hasSameReference(item, action.kind, action.id),
      );

      if (!existingItem) {
        return {
          ...state,
          items: [...state.items, { id: action.id, kind: action.kind, quantity: 1 }],
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          hasSameReference(item, action.kind, action.id)
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_ITEM_QUANTITY) }
            : item,
        ),
      };
    }
    case 'decrement':
      return {
        ...state,
        items: state.items.flatMap((item) => {
          if (!hasSameReference(item, action.kind, action.id)) {
            return [item];
          }

          return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
        }),
      };
    case 'remove':
      return {
        ...state,
        items: state.items.filter(
          (item) => !hasSameReference(item, action.kind, action.id),
        ),
      };
    case 'clear':
      return { ...state, items: [] };
  }
}

function parseStoredCart(value: string | null): readonly CartItemReference[] {
  if (!value) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.flatMap((item): CartItemReference[] => {
      if (
        typeof item !== 'object' ||
        item === null ||
        !('id' in item) ||
        !('kind' in item) ||
        !('quantity' in item) ||
        typeof item.id !== 'string' ||
        (item.kind !== 'product' && item.kind !== 'basket') ||
        typeof item.quantity !== 'number' ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > MAX_ITEM_QUANTITY
      ) {
        return [];
      }

      return [{ id: item.id, kind: item.kind, quantity: item.quantity }];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(cartReducer, {
    isHydrated: false,
    items: [],
  });

  useEffect(() => {
    void AsyncStorage.getItem(CART_STORAGE_KEY)
      .then((value) => dispatch({ type: 'hydrate', items: parseStoredCart(value) }))
      .catch(() => dispatch({ type: 'hydrate', items: [] }));
  }, []);

  useEffect(() => {
    if (!state.isHydrated) {
      return;
    }

    void AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.isHydrated, state.items]);

  const addItem = useCallback((kind: CartItemKind, id: string) => {
    dispatch({ type: 'add', id, kind });
  }, []);
  const decrementItem = useCallback((kind: CartItemKind, id: string) => {
    dispatch({ type: 'decrement', id, kind });
  }, []);
  const removeItem = useCallback((kind: CartItemKind, id: string) => {
    dispatch({ type: 'remove', id, kind });
  }, []);
  const clearCart = useCallback(() => dispatch({ type: 'clear' }), []);
  const getItemQuantity = useCallback(
    (kind: CartItemKind, id: string) =>
      state.items.find((item) => hasSameReference(item, kind, id))?.quantity ?? 0,
    [state.items],
  );
  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      isHydrated: state.isHydrated,
      totalCount: state.items.reduce((total, item) => total + item.quantity, 0),
      addItem,
      decrementItem,
      removeItem,
      clearCart,
      getItemQuantity,
    }),
    [
      addItem,
      clearCart,
      decrementItem,
      getItemQuantity,
      removeItem,
      state.isHydrated,
      state.items,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider.');
  }

  return context;
}
