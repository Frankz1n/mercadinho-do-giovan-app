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
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
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
    setTemporaryPassword(null);
    try {
      const result = await recoverPassword(values.email);
      setTemporaryPassword(result.temporaryPassword);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Não foi possível recuperar a senha.',
      );
    }
  });

  return (
    <AuthShell headline="Vamos te ajudar a voltar" title="Recuperar senha">
      <Text style={styles.subtitle}>
        Informe o e-mail da conta. Em modo local, geramos uma senha temporária.
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

      {temporaryPassword ? (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Senha temporária</Text>
          <Text style={styles.resultCode}>{temporaryPassword}</Text>
        </View>
      ) : null}

      <AppButton
        disabled={isSubmitting}
        label={isSubmitting ? 'Gerando…' : 'Enviar'}
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
  resultCode: {
    color: colors.brand.deep,
    fontFamily: typography.brandSemibold,
    fontSize: 28,
    letterSpacing: 1,
  },
});
