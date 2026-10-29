import type { ImageSource } from 'expo-image';

const BASKET_LOCAL_IMAGES: Record<string, ImageSource> = {
  'basket-120': require('../../../assets/images/baskets/basket-120.jpg'),
  'basket-150': require('../../../assets/images/baskets/basket-150.jpg'),
  'basket-210': require('../../../assets/images/baskets/basket-210.jpg'),
};

export function resolveBasketImageSource(
  basketId: string,
  remoteUrl?: string | null,
): ImageSource | null {
  const local = BASKET_LOCAL_IMAGES[basketId];
  if (local) {
    return local;
  }
  if (remoteUrl) {
    return { uri: remoteUrl };
  }
  return null;
}
