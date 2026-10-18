import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

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
  imageUrl?: string | null;
  visual: ProductVisualType;
};

export function ProductVisual({
  compact = false,
  imageUrl,
  visual,
}: ProductVisualProps) {
  if (imageUrl) {
    return (
      <Image
        contentFit="cover"
        source={{ uri: imageUrl }}
        style={[styles.image, compact && styles.compactImage]}
        transition={200}
      />
    );
  }

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Ionicons
        color={colors.brand.primary}
        name={visualIcons[visual]}
        size={compact ? 26 : 44}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.md,
    height: 112,
    justifyContent: 'center',
    width: '100%',
  },
  compactContainer: {
    height: 64,
    width: 64,
  },
  image: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    height: 112,
    width: '100%',
  },
  compactImage: {
    height: 64,
    width: 64,
  },
});
