import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors, minimumTouchTarget, radii, spacing, typography } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type TextFieldProps = TextInputProps & {
  error?: string | null;
  label: string;
  hideLabel?: boolean;
  leftIcon?: IoniconName;
  isPassword?: boolean;
};

export function TextField({
  error,
  label,
  hideLabel = false,
  leftIcon,
  isPassword = false,
  style,
  secureTextEntry,
  ...props
}: TextFieldProps) {
  const [isSecure, setIsSecure] = useState(isPassword || Boolean(secureTextEntry));

  return (
    <View style={styles.container}>
      {!hideLabel ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error ? styles.inputError : null]}>
        {leftIcon ? (
          <Ionicons color={colors.text.secondary} name={leftIcon} size={18} />
        ) : null}
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          placeholderTextColor={colors.text.secondary}
          secureTextEntry={isSecure}
          style={[styles.input, style]}
          {...props}
        />
        {isPassword || secureTextEntry ? (
          <Pressable
            accessibilityLabel={isSecure ? 'Mostrar senha' : 'Ocultar senha'}
            onPress={() => setIsSecure((value) => !value)}
            style={styles.eye}
          >
            <Ionicons
              color={colors.text.secondary}
              name={isSecure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text.primary,
    fontFamily: typography.interfaceMedium,
    fontSize: 14,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.interfaceRegular,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  eye: {
    alignItems: 'center',
    height: minimumTouchTarget,
    justifyContent: 'center',
    width: minimumTouchTarget,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.interfaceRegular,
    fontSize: 12,
  },
});
