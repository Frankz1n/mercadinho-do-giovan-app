import type * as ExpoImagePicker from 'expo-image-picker';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

type ImagePickerModule = typeof ExpoImagePicker;

let imagePickerModule: ImagePickerModule | null | undefined;

/**
 * Só carrega o JS do expo-image-picker se o módulo nativo existir.
 * O require do pacote JS sozinho não basta: o nativo pode falhar na 1ª API.
 */
export function getImagePicker(): ImagePickerModule | null {
  if (imagePickerModule !== undefined) {
    return imagePickerModule;
  }

  if (Platform.OS === 'web') {
    imagePickerModule = null;
    return null;
  }

  const native = requireOptionalNativeModule('ExponentImagePicker');
  if (!native) {
    console.warn(
      '[image-picker] Módulo nativo ExponentImagePicker ausente. Gere um novo APK com npx expo run:android.',
    );
    imagePickerModule = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    imagePickerModule = require('expo-image-picker') as ImagePickerModule;
    return imagePickerModule;
  } catch (error) {
    console.warn(
      '[image-picker] Falha ao carregar expo-image-picker. Gere um novo development build.',
      error,
    );
    imagePickerModule = null;
    return null;
  }
}

export function isImagePickerNativeAvailable() {
  return getImagePicker() !== null;
}
