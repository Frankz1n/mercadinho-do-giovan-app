import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  promptProductImageSource,
  type PickedProductImage,
} from '@/features/catalog/data/product-image-upload';
import { colors, radii, spacing, typography } from '@/theme';

type ProductPhotoFieldProps = {
  imageUri: string | null;
  onChange: (image: PickedProductImage) => void;
  hint?: string;
};

export function ProductPhotoField({
  imageUri,
  onChange,
  hint = 'Toque para tirar foto ou escolher da galeria',
}: ProductPhotoFieldProps) {
  return (
    <Pressable
      accessibilityLabel="Adicionar foto do produto"
      onPress={() => promptProductImageSource(onChange)}
      style={styles.photoBox}
    >
      {imageUri ? (
        <Image contentFit="cover" source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons color={colors.brand.primary} name="camera-outline" size={28} />
          <Text style={styles.photoText}>Adicionar foto do produto</Text>
          <Text style={styles.photoHint}>{hint}</Text>
        </View>
      )}
      {imageUri ? (
        <View style={styles.changeBadge}>
          <Ionicons color={colors.text.inverse} name="camera" size={14} />
          <Text style={styles.changeText}>Trocar foto</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  photoBox: {
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    minHeight: 160,
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: 160,
    padding: spacing.md,
  },
  preview: {
    height: 180,
    width: '100%',
  },
  photoText: {
    color: colors.brand.primary,
    fontFamily: typography.interfaceSemibold,
  },
  photoHint: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
    textAlign: 'center',
  },
  changeBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(6, 28, 108, 0.82)',
    bottom: spacing.sm,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: 'absolute',
    right: spacing.sm,
  },
  changeText: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceSemibold,
    fontSize: 12,
  },
});
