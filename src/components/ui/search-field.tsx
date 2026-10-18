import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@/theme';

type SearchFieldProps = {
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function SearchField({
  onChangeText,
  placeholder = 'O que você precisa?',
  value,
}: SearchFieldProps) {
  return (
    <View style={styles.container}>
      <Ionicons color={colors.text.secondary} name="search-outline" size={20} />
      <TextInput
        accessibilityLabel={placeholder}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    ...shadows.card,
  },
  input: {
    color: colors.text.primary,
    flex: 1,
    fontFamily: typography.interfaceRegular,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
});
