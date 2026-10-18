import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/ui/brand-mark';
import { colors, radii, shadows, spacing, typography } from '@/theme';

type AuthShellProps = PropsWithChildren<{
  headline: string;
  title: string;
  /** Layout fixo sem scroll, com hero e logo grandes (login). */
  spaciousHero?: boolean;
}>;

export function AuthShell({
  children,
  headline,
  title,
  spaciousHero = false,
}: AuthShellProps) {
  const { height } = useWindowDimensions();
  const logoSize = Math.min(148, Math.max(100, Math.round(height * 0.16)));

  if (spaciousHero) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View style={styles.loginRoot}>
            <View style={styles.loginHero}>
              <View style={styles.logoFrame}>
                <BrandMark size={logoSize} />
              </View>
              <View style={styles.copySpacious}>
                <Text style={styles.brandSpacious}>Mercadinho do Giovan</Text>
                <Text style={styles.headlineSpacious}>{headline}</Text>
              </View>
            </View>

            <View style={styles.loginCard}>
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
              {children}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <BrandMark size="sm" />
          <View style={styles.copy}>
            <Text style={styles.brand}>Mercadinho do Giovan</Text>
            <Text style={styles.headline}>{headline}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.brand.primary,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  loginRoot: {
    flex: 1,
  },
  loginHero: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  logoFrame: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radii.pill,
    justifyContent: 'center',
    padding: spacing.xs,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  copySpacious: {
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: 300,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  brand: {
    color: colors.text.inverse,
    fontFamily: typography.brandSemibold,
    fontSize: 18,
    textAlign: 'center',
  },
  brandSpacious: {
    color: colors.text.inverse,
    fontFamily: typography.brandSemibold,
    fontSize: 22,
    letterSpacing: 0.2,
    lineHeight: 28,
    textAlign: 'center',
  },
  headline: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceRegular,
    fontSize: 15,
    opacity: 0.9,
    textAlign: 'center',
  },
  headlineSpacious: {
    color: colors.brand.yellow,
    fontFamily: typography.interfaceMedium,
    fontSize: 16,
    letterSpacing: 0.15,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    flexGrow: 1,
    gap: spacing.md,
    minHeight: 480,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    ...shadows.card,
  },
  loginCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadows.card,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 24,
    marginBottom: spacing.xxs,
  },
});
