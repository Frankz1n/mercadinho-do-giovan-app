import type { ImageSource } from 'expo-image';

const PRODUCT_LOCAL_IMAGES: Record<string, ImageSource> = {
  'rice-5kg': require('../../../assets/images/products/rice-5kg.jpg'),
  'sugar-2kg': require('../../../assets/images/products/sugar-2kg.jpg'),
  'coffee-coamo': require('../../../assets/images/products/coffee-coamo.jpg'),
  'oil-900ml': require('../../../assets/images/products/oil-900ml.jpg'),
  'milk-1l': require('../../../assets/images/products/milk-1l.jpg'),
  'tomato-sauce': require('../../../assets/images/products/tomato-sauce.jpg'),
  'salt-1kg': require('../../../assets/images/products/salt-1kg.webp'),
  'wheat-1kg': require('../../../assets/images/products/wheat-1kg.jpg'),
  wafer: require('../../../assets/images/products/wafer.jpg'),
  'pasta-500g': require('../../../assets/images/products/pasta-500g.jpg'),
  'soda-coke-2l': require('../../../assets/images/products/soda-coke-2l.jpg'),
  'margarine-250g': require('../../../assets/images/products/margarine-250g.jpg'),
  'softener-ype-2l': require('../../../assets/images/products/softener-ype-2l.jpg'),
  'disinfectant-2l': require('../../../assets/images/products/disinfectant-2l.jpg'),
  'detergent-ype': require('../../../assets/images/products/detergent-ype.jpg'),
  'bleach-1l': require('../../../assets/images/products/bleach-1l.jpg'),
  'soap-powder-800g': require('../../../assets/images/products/soap-powder-800g.jpg'),
  'laundry-bar': require('../../../assets/images/products/laundry-bar.jpg'),
  'toilet-paper-4': require('../../../assets/images/products/toilet-paper-4.jpg'),
  'soap-unit': require('../../../assets/images/products/soap-unit.jpg'),
  'toothpaste-colgate': require('../../../assets/images/products/toothpaste-colgate.jpg'),
};

export function hasLocalProductImage(productId: string): boolean {
  return productId in PRODUCT_LOCAL_IMAGES;
}

export function resolveProductImageSource(
  productId: string,
  remoteUrl?: string | null,
): ImageSource | null {
  const local = PRODUCT_LOCAL_IMAGES[productId];
  if (local) {
    return local;
  }
  if (remoteUrl) {
    return { uri: remoteUrl };
  }
  return null;
}
