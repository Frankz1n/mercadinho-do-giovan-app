export const colors = {
  brand: {
    primary: '#061C6C',
    deep: '#01074B',
    mid: '#1B3D9C',
    yellow: '#F5D240',
    yellowDark: '#E7AD00',
  },
  surface: '#FFFFFF',
  background: '#F4F6FB',
  text: {
    primary: '#05133B',
    secondary: '#5B6475',
    inverse: '#FFFFFF',
  },
  border: '#E1E6F0',
  danger: '#D32F2F',
  success: '#1B8A4A',
  warning: '#C47A00',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  brandRegular: 'Poppins_400Regular',
  brandSemibold: 'Poppins_600SemiBold',
  interfaceRegular: 'Geist_400Regular',
  interfaceMedium: 'Geist_500Medium',
  interfaceSemibold: 'Geist_600SemiBold',
} as const;

export const shadows = {
  card: {
    shadowColor: '#061C6C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export const storeLocation = 'São Francisco, Reserva';

export const minimumTouchTarget = 48;
