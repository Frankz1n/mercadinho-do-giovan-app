import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

type ScreenProps = PropsWithChildren<{
  hasBottomNavigation?: boolean;
  header?: ReactNode;
  backgroundColor?: string;
  scrollable?: boolean;
}>;

export function Screen({
  children,
  hasBottomNavigation = false,
  header,
  backgroundColor = colors.background,
  scrollable = true,
}: ScreenProps) {
  const body = (
    <View
      style={[
        styles.maxWidth,
        hasBottomNavigation && styles.contentWithBottomNavigation,
        !scrollable && styles.paddedBody,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={header ? ['left', 'right'] : ['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor }]}
    >
      {header}
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            hasBottomNavigation && styles.contentWithBottomNavigation,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.maxWidth}>{children}</View>
        </ScrollView>
      ) : (
        <View style={styles.flex}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  paddedBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  contentWithBottomNavigation: {
    paddingBottom: 100,
  },
  maxWidth: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: spacing.md,
    maxWidth: 720,
    width: '100%',
  },
});
