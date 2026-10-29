import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { AppButton, BrandMark, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { resolveSafeReturnTo } from '@/lib/safe-navigation';
import { colors, spacing, typography } from '@/theme';

const schema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres.'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { height, width } = useWindowDimensions();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const logoSize = Math.min(168, Math.max(120, Math.round(height * 0.18)));
  const stripes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        key: `stripe-${index}`,
        left: index * 36 - width * 0.35,
      })),
    [width],
  );

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const user = await login(values.email, values.password);
      if (user.role === 'admin') {
        router.replace('/admin');
        return;
      }
      router.replace(resolveSafeReturnTo(returnTo));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível entrar.');
    }
  });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.root}>
          <View style={styles.hero}>
            <View pointerEvents="none" style={styles.stripesLayer}>
              {stripes.map((stripe) => (
                <View
                  key={stripe.key}
                  style={[styles.stripe, { left: stripe.left }]}
                />
              ))}
            </View>

            <BrandMark size={logoSize} />
            <View style={styles.heroCopy}>
              <Text style={styles.greeting}>Bom te ver por aqui</Text>
              <Text style={styles.tagline}>
                Tudo o que você precisa, pertinho de você.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text accessibilityRole="header" style={styles.title}>
                Entrar
              </Text>
              <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
            </View>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  autoComplete="email"
                  error={errors.email?.message}
                  hideLabel
                  keyboardType="email-address"
                  label="E-mail"
                  leftIcon="mail-outline"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="E-mail"
                  value={value}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  autoComplete="password"
                  error={errors.password?.message}
                  hideLabel
                  isPassword
                  label="Senha"
                  leftIcon="lock-closed-outline"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Senha"
                  value={value}
                />
              )}
            />

            <Pressable onPress={() => router.push('/(auth)/recover')}>
              <Text style={styles.forgot}>Esqueci minha senha?</Text>
            </Pressable>

            {formError ? <Text style={styles.error}>{formError}</Text> : null}

            <AppButton
              disabled={isSubmitting}
              label={isSubmitting ? 'Entrando…' : 'Entrar'}
              onPress={() => void onSubmit()}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <AppButton
              href="/(auth)/register"
              label="Criar conta"
              variant="secondary"
            />

            <Pressable onPress={() => router.replace('/(shop)/home')}>
              <Text style={styles.explore}>Explorar produtos sem fazer login</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  root: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  stripesLayer: {
    ...StyleSheet.absoluteFill,
  },
  stripe: {
    backgroundColor: 'rgba(1, 7, 75, 0.28)',
    height: '180%',
    position: 'absolute',
    top: '-40%',
    transform: [{ rotate: '28deg' }],
    width: 18,
  },
  heroCopy: {
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: 320,
  },
  greeting: {
    color: colors.text.inverse,
    fontFamily: typography.brandSemibold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontFamily: typography.interfaceRegular,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  cardHeader: {
    gap: spacing.xxs,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.brand.deep,
    fontFamily: typography.brandSemibold,
    fontSize: 28,
  },
  subtitle: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 14,
  },
  forgot: {
    color: colors.brand.mid,
    fontFamily: typography.interfaceMedium,
    fontSize: 13,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  error: {
    color: colors.danger,
    fontFamily: typography.interfaceMedium,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
  },
  dividerText: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    fontSize: 13,
  },
  explore: {
    color: colors.brand.mid,
    fontFamily: typography.interfaceMedium,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
