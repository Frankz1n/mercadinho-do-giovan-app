import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import {
  AppButton,
  Screen,
  StoreHeader,
  StoreLoadingState,
  TextField,
} from '@/components/ui';
import {
  useAddress,
  useSaveAddress,
} from '@/features/addresses/data/address-queries';
import {
  digitsOnly,
  formatZipCode,
  lookupZipCode,
} from '@/features/addresses/data/via-cep';
import { useAuth } from '@/features/auth/auth-context';
import { colors, radii, spacing, typography } from '@/theme';

const schema = z.object({
  label: z
    .string()
    .trim()
    .min(2, 'Informe um apelido (ex.: Casa).')
    .max(40, 'Apelido muito longo.'),
  zipCode: z
    .string()
    .refine((value) => digitsOnly(value).length === 8, {
      message: 'Informe um CEP com 8 dígitos.',
    }),
  street: z.string().trim().min(2, 'Informe a rua.').max(120),
  number: z.string().trim().min(1, 'Informe o número.').max(20),
  complement: z.string().max(80),
  neighborhood: z.string().trim().min(2, 'Informe o bairro.').max(80),
  city: z.string().trim().min(2, 'Informe a cidade.').max(80),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .length(2, 'UF com 2 letras.'),
  isDefault: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function AddressFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const addressId = typeof id === 'string' && id.length > 0 ? id : undefined;
  const isEditing = Boolean(addressId);
  const { user } = useAuth();
  const addressQuery = useAddress(addressId);
  const saveAddress = useSaveAddress(user?.id);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLookingUpCep, setIsLookingUpCep] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: 'Casa',
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      isDefault: true,
    },
  });

  const isDefault = watch('isDefault');
  const zipCode = watch('zipCode');

  useEffect(() => {
    if (!addressQuery.data) {
      return;
    }

    reset({
      label: addressQuery.data.label,
      zipCode: addressQuery.data.zipCode,
      street: addressQuery.data.street,
      number: addressQuery.data.number,
      complement: addressQuery.data.complement,
      neighborhood: addressQuery.data.neighborhood,
      city: addressQuery.data.city,
      state: addressQuery.data.state,
      isDefault: addressQuery.data.isDefault,
    });
  }, [addressQuery.data, reset]);

  const onLookupCep = async () => {
    setFormError(null);
    setIsLookingUpCep(true);
    try {
      const result = await lookupZipCode(zipCode);
      if (result.street) {
        setValue('street', result.street, { shouldValidate: true });
      }
      if (result.neighborhood) {
        setValue('neighborhood', result.neighborhood, { shouldValidate: true });
      }
      setValue('city', result.city, { shouldValidate: true });
      setValue('state', result.state, { shouldValidate: true });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Não foi possível buscar o CEP.',
      );
    } finally {
      setIsLookingUpCep(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await saveAddress.mutateAsync({
        addressId,
        draft: values,
      });
      router.replace('/addresses');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Não foi possível salvar.',
      );
    }
  });

  if (!user) {
    return (
      <Screen>
        <StoreHeader title="Endereço" />
        <Text style={styles.title}>Faça login para continuar</Text>
        <AppButton href="/(auth)/login" label="Entrar" />
      </Screen>
    );
  }

  if (isEditing && addressQuery.isPending) {
    return (
      <Screen>
        <StoreHeader title="Editar endereço" />
        <StoreLoadingState />
      </Screen>
    );
  }

  return (
    <Screen>
      <StoreHeader title={isEditing ? 'Editar endereço' : 'Novo endereço'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Text accessibilityRole="header" style={styles.title}>
          {isEditing ? 'Editar endereço' : 'Novo endereço'}
        </Text>
        <Text style={styles.subtitle}>
          Salve para usar quando a entrega estiver disponível. Hoje os pedidos
          são só para retirada na loja.
        </Text>

        <Controller
          control={control}
          name="label"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              autoCapitalize="words"
              error={errors.label?.message}
              label="Apelido"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Casa, Trabalho…"
              value={value}
            />
          )}
        />

        <View style={styles.cepRow}>
          <View style={styles.cepField}>
            <Controller
              control={control}
              name="zipCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  error={errors.zipCode?.message}
                  keyboardType="number-pad"
                  label="CEP"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(formatZipCode(text))}
                  placeholder="00000-000"
                  value={value}
                />
              )}
            />
          </View>
          <Pressable
            disabled={isLookingUpCep}
            onPress={() => void onLookupCep()}
            style={styles.cepButton}
          >
            <Text style={styles.cepButtonText}>
              {isLookingUpCep ? 'Buscando…' : 'Buscar'}
            </Text>
          </Pressable>
        </View>

        <Controller
          control={control}
          name="street"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              autoCapitalize="words"
              error={errors.street?.message}
              label="Rua"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Rua / Avenida"
              value={value}
            />
          )}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Controller
              control={control}
              name="number"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  error={errors.number?.message}
                  label="Número"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="123"
                  value={value}
                />
              )}
            />
          </View>
          <View style={styles.half}>
            <Controller
              control={control}
              name="complement"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  error={errors.complement?.message}
                  label="Complemento"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Apto, bloco…"
                  value={value}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="neighborhood"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              autoCapitalize="words"
              error={errors.neighborhood?.message}
              label="Bairro"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Bairro"
              value={value}
            />
          )}
        />

        <View style={styles.row}>
          <View style={styles.city}>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  autoCapitalize="words"
                  error={errors.city?.message}
                  label="Cidade"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Cidade"
                  value={value}
                />
              )}
            />
          </View>
          <View style={styles.uf}>
            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  autoCapitalize="characters"
                  error={errors.state?.message}
                  label="UF"
                  maxLength={2}
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(text.toUpperCase())}
                  placeholder="PR"
                  value={value}
                />
              )}
            />
          </View>
        </View>

        <Pressable
          onPress={() => setValue('isDefault', !isDefault)}
          style={styles.defaultRow}
        >
          <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
            {isDefault ? (
              <Text style={styles.checkboxMark}>✓</Text>
            ) : null}
          </View>
          <Text style={styles.defaultText}>Usar como endereço padrão</Text>
        </Pressable>

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <AppButton
          disabled={isSubmitting || saveAddress.isPending}
          label={
            isSubmitting || saveAddress.isPending
              ? 'Salvando…'
              : isEditing
                ? 'Salvar alterações'
                : 'Salvar endereço'
          }
          onPress={() => void onSubmit()}
        />
        <AppButton
          label="Cancelar"
          onPress={() => router.back()}
          variant="secondary"
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: spacing.sm,
  },
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
  cepRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cepField: {
    flex: 1,
  },
  cepButton: {
    alignItems: 'center',
    backgroundColor: colors.brand.primary,
    borderRadius: radii.md,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cepButtonText: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceSemibold,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  half: {
    flex: 1,
  },
  city: {
    flex: 1,
  },
  uf: {
    width: 88,
  },
  defaultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  checkboxMark: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '700',
  },
  defaultText: {
    color: colors.text.primary,
    fontFamily: typography.interfaceRegular,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.interfaceMedium,
    fontSize: 13,
  },
});
