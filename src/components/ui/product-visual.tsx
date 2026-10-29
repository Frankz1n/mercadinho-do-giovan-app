import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { resolveProductImageSource } from '@/features/catalog/product-images';
import type { ProductVisual as ProductVisualType } from '@/features/catalog/domain/catalog';
import { colors, radii } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const visualIcons: Record<ProductVisualType, IoniconName> = {
  rice: 'nutrition-outline',
  milk: 'water-outline',
  beans: 'ellipse-outline',
  eggs: 'egg-outline',
  produce: 'leaf-outline',
  cleaning: 'sparkles-outline',
  coffee: 'cafe-outline',
  pasta: 'restaurant-outline',
};

type ProductVisualProps = {
  compact?: boolean;
  imageSource?: ImageSource | null;
  imageUrl?: string | null;
  productId?: string;
  visual: ProductVisualType;
};

export function ProductVisual({
  compact = false,
  imageSource,
  imageUrl,
  productId,
  visual,
}: ProductVisualProps) {
  const resolved =
    imageSource ??
    (productId ? resolveProductImageSource(productId, imageUrl) : null) ??
    (imageUrl ? { uri: imageUrl } : null);

  return (
    <View style={[styles.frame, compact && styles.compactFrame]}>
      {resolved ? (
        <Image
          cachePolicy="memory-disk"
          contentFit="contain"
          recyclingKey={productId ?? imageUrl ?? undefined}
          source={resolved}
          style={styles.image}
          transition={150}
        />
      ) : (
        <Ionicons
          color={colors.brand.primary}
          name={visualIcons[visual]}
          size={compact ? 26 : 44}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: radii.md,
    height: 112,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  compactFrame: {
    height: 64,
    width: 64,
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
