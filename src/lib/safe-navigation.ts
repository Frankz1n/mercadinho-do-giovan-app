import type { Href } from 'expo-router';

const ALLOWED_RETURN_PATHS = new Set([
  '/checkout',
  '/orders',
  '/addresses',
  '/account',
  '/(shop)/home',
  '/(shop)/cart',
  '/(shop)/profile',
  '/(shop)/baskets',
  '/(shop)/categories',
]);

/** Evita open-redirect: só rotas internas conhecidas. */
export function resolveSafeReturnTo(
  value: string | string[] | undefined,
  fallback: Href = '/(shop)/home',
): Href {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== 'string') {
    return fallback;
  }

  const path = raw.split('?')[0]?.trim();
  if (!path || path.includes('://') || path.startsWith('//')) {
    return fallback;
  }

  if (ALLOWED_RETURN_PATHS.has(path)) {
    return path as Href;
  }

  return fallback;
}
