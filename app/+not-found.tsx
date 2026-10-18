import { StyleSheet, Text, View } from 'react-native';

import { AppButton, Screen, StoreHeader } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';

export default function NotFoundScreen() {
  return (
    <Screen>
      <StoreHeader showCart={false} title="Mercadinho do Giovan" />
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>
          Página não encontrada
        </Text>
        <Text style={styles.subtitle}>
          Esse caminho não existe. Volte para a loja e continue comprando.
        </Text>
      </View>
      <AppButton href="/(shop)/home" label="Ir para o início" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 24,
  },
  subtitle: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    lineHeight: 21,
  },
});
