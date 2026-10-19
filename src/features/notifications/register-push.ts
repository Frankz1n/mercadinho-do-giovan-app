import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { getNotifications } from '@/features/notifications/expo-notifications-safe';
import { supabase } from '@/lib/supabase';

let didConfigureHandler = false;

function configureNotificationHandler() {
  if (didConfigureHandler) {
    return;
  }

  const Notifications = getNotifications();
  if (!Notifications) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  didConfigureHandler = true;
}

function resolveProjectId() {
  return (
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    null
  );
}

export async function registerForPushNotifications(userId: string) {
  if (Platform.OS === 'web') {
    return null;
  }

  const Notifications = getNotifications();
  if (!Notifications) {
    return null;
  }

  configureNotificationHandler();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Mercadinho do Giovan',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#061C6C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = resolveProjectId();
  if (!projectId) {
    console.warn(
      '[push] Defina extra.eas.projectId ou EXPO_PUBLIC_EAS_PROJECT_ID para obter o token.',
    );
    return null;
  }

  try {
    const token = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;

    const { error } = await supabase.from('device_tokens').upsert(
      {
        user_id: userId,
        expo_push_token: token,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'expo_push_token' },
    );

    if (error) {
      console.warn('[push] não foi possível salvar o token', error.message);
      return null;
    }

    return token;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Firebase') || message.includes('googleServicesFile')) {
      console.warn(
        '[push] FCM não configurado. Adicione google-services.json (package br.com.mercadinhodogiovan.app), rode npx expo prebuild --clean && npx expo run:android, e envie a chave FCM V1 no EAS (eas credentials).',
        error,
      );
    } else {
      console.warn('[push] token indisponível (use development build atualizado)', error);
    }
    return null;
  }
}

export async function unregisterPushToken(token: string | null) {
  if (!token) {
    return;
  }

  await supabase.from('device_tokens').delete().eq('expo_push_token', token);
}
