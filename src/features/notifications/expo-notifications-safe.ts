import type * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';

type NotificationsModule = typeof ExpoNotifications;

let notificationsModule: NotificationsModule | null | undefined;

/**
 * Carrega expo-notifications só se o módulo nativo existir.
 * Builds antigos / Expo Go desatualizado quebram no import estático.
 */
export function getNotifications(): NotificationsModule | null {
  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  if (Platform.OS === 'web') {
    notificationsModule = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notificationsModule = require('expo-notifications') as NotificationsModule;
    return notificationsModule;
  } catch (error) {
    console.warn(
      '[push] Módulo nativo de notificações indisponível. Gere um novo development build.',
      error,
    );
    notificationsModule = null;
    return null;
  }
}

export function isPushNativeAvailable() {
  return getNotifications() !== null;
}
