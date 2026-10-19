import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { AppButton, AuthShell, TextField } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { colors, radii, spacing, typography } from '@/theme';

const schema = z.object({
  email: z.email('Informe um e-mail válido.'),
});

type FormValues = z.infer<typeof schema>;

export default function RecoverScreen() {
  const { recoverPassword } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccessMessage(null);
    try {
      const result = await recoverPassword(values.email);
      setSuccessMessage(result.message);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Não foi possível recuperar a senha.',
      );
    }
  });

  return (
    <AuthShell headline="Vamos te ajudar a voltar" title="Recuperar senha">
      <Text style={styles.subtitle}>
        Informe o e-mail da conta. Enviaremos um link de redefinição pelo Supabase Auth.
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            error={errors.email?.message}
            keyboardType="email-address"
            label="E-mail"
            leftIcon="mail-outline"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="seu@email.com"
            value={value}
          />
        )}
      />

      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      {successMessage ? (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>E-mail enviado</Text>
          <Text style={styles.resultBody}>{successMessage}</Text>
        </View>
      ) : null}

      <AppButton
        disabled={isSubmitting}
        label={isSubmitting ? 'Enviando…' : 'Enviar'}
        onPress={() => void onSubmit()}
      />
      <AppButton href="/(auth)/login" label="Voltar ao login" variant="secondary" />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    lineHeight: 21,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.interfaceMedium,
  },
  result: {
    backgroundColor: colors.surface,
    borderColor: colors.brand.yellowDark,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  resultTitle: {
    color: colors.text.primary,
    fontFamily: typography.interfaceSemibold,
  },
  resultBody: {
    color: colors.text.secondary,
    fontFamily: typography.interfaceRegular,
    lineHeight: 20,
  },
});
