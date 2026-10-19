import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, shadows, spacing, typography } from '@/theme';

type ToastTone = 'default' | 'success' | 'danger';

type ToastMessage = Readonly<{
  id: number;
  title: string;
  tone: ToastTone;
}>;

type ToastContextValue = {
  showToast: (title: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_MS = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (title: string, tone: ToastTone = 'default') => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      idRef.current += 1;
      setToast({ id: idRef.current, title, tone });
      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, DISMISS_MS);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View
          pointerEvents="box-none"
          style={[styles.host, { paddingTop: insets.top + spacing.xs }]}
        >
          <Pressable
            accessibilityRole="alert"
            onPress={dismiss}
            style={[
              styles.banner,
              toast.tone === 'success' && styles.bannerSuccess,
              toast.tone === 'danger' && styles.bannerDanger,
            ]}
          >
            <Text style={styles.bannerText}>{toast.title}</Text>
          </Pressable>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider.');
  }
  return context;
}

const styles = StyleSheet.create({
  host: {
    left: 0,
    paddingHorizontal: spacing.md,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  banner: {
    backgroundColor: colors.brand.deep,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.card,
  },
  bannerSuccess: {
    backgroundColor: colors.success,
  },
  bannerDanger: {
    backgroundColor: colors.danger,
  },
  bannerText: {
    color: colors.text.inverse,
    fontFamily: typography.interfaceSemibold,
    fontSize: 14,
    textAlign: 'center',
  },
});
