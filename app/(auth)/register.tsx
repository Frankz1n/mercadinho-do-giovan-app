import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { AppButton, BrandMark, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import {
  profileNameSchema,
  profilePhoneSchema,
} from '@/features/auth/profile-schema';
import { colors, minimumTouchTarget, radii, spacing, typography } from '@/theme';

const schema = z.object({
  name: profileNameSchema,
  phone: profilePhoneSchema,
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres.'),
  acceptedTerms: z.boolean().refine((value) => value, {
    message: 'Aceite os termos para continuar.',
  }),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { register } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      acceptedTerms: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      router.replace('/(shop)/home');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Não foi possível criar a conta.',
      );
    }
  });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons color={colors.brand.primary} name="arrow-back" size={24} />
          </Pressable>
          <BrandMark size={56} />
          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerCopy}>
            <Text accessibilityRole="header" style={styles.title}>
              Crie sua conta
            </Text>
            <Text style={styles.subtitle}>É rápido e fácil. Vamos lá!</Text>
          </View>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                autoCapitalize="words"
                error={errors.name?.message}
                hideLabel
                label="Nome completo"
                leftIcon="person-outline"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Nome completo"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                error={errors.phone?.message}
                hideLabel
                keyboardType="phone-pad"
                label="WhatsApp"
                leftIcon="logo-whatsapp"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="WhatsApp"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
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

          <Controller
            control={control}
            name="acceptedTerms"
            render={({ field: { value, onChange } }) => (
              <View style={styles.termsRow}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: value }}
                  onPress={() => onChange(!value)}
                  style={[styles.checkbox, value && styles.checkboxChecked]}
                >
                  {value ? (
                    <Ionicons color={colors.text.inverse} name="checkmark" size={14} />
                  ) : null}
                </Pressable>
                <Text style={styles.termsText}>
                  Li e aceito os{' '}
                  <Text
                    onPress={() => router.push('/legal/terms')}
                    style={styles.termsLink}
                  >
                    Termos de Uso
                  </Text>{' '}
                  e a{' '}
                  <Text
                    onPress={() => router.push('/legal/privacy')}
                    style={styles.termsLink}
                  >
                    Política de Privacidade
                  </Text>
                  .
                </Text>
              </View>
            )}
          />
          {errors.acceptedTerms?.message ? (
            <Text style={styles.error}>{errors.acceptedTerms.message}</Text>
          ) : null}
          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <AppButton
            disabled={isSubmitting}
            label={isSubmitting ? 'Criando…' : 'Criar conta'}
            onPress={() => void onSubmit()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    height: minimumTouchTarget,
    justifyContent: 'center',
    width: minimumTouchTarget,
  },
  backPlaceholder: {
    width: minimumTouchTarget,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerCopy: {
    gap: spacing.xs,
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
    fontSize: 15,
  },
  termsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    marginTop: 2,
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  termsLink: {
    color: colors.brand.primary,
    fontFamily: typography.interfaceSemibold,
    textDecorationLine: 'underline',
  },
  termsText: {
    color: colors.text.secondary,
    flex: 1,
    fontFamily: typography.interfaceRegular,
    fontSize: 13,
    lineHeight: 19,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.interfaceMedium,
  },
});
