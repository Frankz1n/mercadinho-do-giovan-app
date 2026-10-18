import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const officialLogo = require('../../../assets/images/logo-mercadinho-do-giovan.png');

type BrandMarkSize = 'sm' | 'md' | 'lg' | number;

type BrandMarkProps = {
  compact?: boolean;
  size?: BrandMarkSize;
};

export function BrandMark({ compact = false, size }: BrandMarkProps) {
  const resolvedSize = size ?? (compact ? 'sm' : 'lg');
  const dimensions =
    typeof resolvedSize === 'number'
      ? { height: resolvedSize, width: resolvedSize }
      : sizeStyles[resolvedSize];

  return (
    <View accessibilityLabel="Mercadinho do Giovan" style={styles.container}>
      <Image
        accessibilityLabel="Logo oficial do Mercadinho do Giovan"
        contentFit="contain"
        source={officialLogo}
        style={dimensions}
      />
    </View>
  );
}

const sizeStyles = StyleSheet.create({
  sm: {
    height: 48,
    width: 48,
  },
  md: {
    height: 140,
    width: 140,
  },
  lg: {
    height: 180,
    width: 180,
  },
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
