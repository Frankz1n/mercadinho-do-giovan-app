import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';
import type { z } from 'zod';

import {
  AppButton,
  Screen,
  StoreHeader,
  StoreMessage,
  TextField,
} from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { profileDetailsSchema } from '@/features/auth/profile-schema';
import { colors, spacing, typography } from '@/theme';

type FormValues = z.infer<typeof profileDetailsSchema>;

export default function AccountScreen() {
  const { user, isLoading, updateProfile } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(profileDetailsSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    reset({
      name: user.name,
      phone: user.phone,
    });
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccessMessage(null);
    try {
      await updateProfile(values);
      setSuccessMessage('Dados atualizados.');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Não foi possível salvar.',
      );
    }
  });

  if (isLoading) {
    return (
      <Screen>
        <StoreHeader title="Meus dados" />
        <StoreMessage description="Carregando sessão…" title="Aguarde" />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <StoreHeader title="Meus dados" />
        <StoreMessage
          description="Entre na sua conta para editar nome e WhatsApp."
          title="Você não está logado"
        />
        <AppButton href="/(auth)/login" label="Entrar" />
      </Screen>
    );
  }

  return (
    <Screen>
      <StoreHeader title="Meus dados" />
      <Text accessibilityRole="header" style={styles.title}>
        Meus dados
      </Text>
      <Text style={styles.subtitle}>
        Atualize nome e WhatsApp usados nos pedidos. O e-mail fica vinculado à
        conta.
      </Text>

      <TextField
        editable={false}
        label="E-mail"
        leftIcon="mail-outline"
        value={user.email}
      />

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            autoCapitalize="words"
            error={errors.name?.message}
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

      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      <AppButton
        disabled={isSubmitting || !isDirty}
        label={isSubmitting ? 'Salvando…' : 'Salvar alterações'}
        onPress={() => void onSubmit()}
      />
      <AppButton
        label="Alterar senha por e-mail"
        onPress={() => router.push('/(auth)/recover')}
        variant="secondary"
      />
      <AppButton
        href="/(shop)/profile"
        label="Voltar ao perfil"
        variant="secondary"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text.primary,
    fontFamily: typography.brandSemibold,
    fontSize: 25,
  },
  subtitle: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    lineHeight: 21,
    marginBottom: spacing.xs,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.interfaceMedium,
    fontSize: 13,
  },
  success: {
    color: colors.success,
    fontFamily: typography.interfaceMedium,
    fontSize: 13,
  },
});
