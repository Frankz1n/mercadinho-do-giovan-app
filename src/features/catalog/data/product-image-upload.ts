import { Alert } from 'react-native';

import { assertSupabaseConfigured, supabase } from '@/lib/supabase';

import { getImagePicker } from './expo-image-picker-safe';

export type PickedProductImage = Readonly<{
  uri: string;
  mimeType: string;
  fileExt: string;
}>;

async function ensureCameraPermission() {
  const ImagePicker = getImagePicker();
  if (!ImagePicker) {
    return false;
  }

  try {
    const current = await ImagePicker.getCameraPermissionsAsync();
    if (current.granted) {
      return true;
    }

    const requested = await ImagePicker.requestCameraPermissionsAsync();
    if (!requested.granted) {
      Alert.alert(
        'Permissão da câmera',
        'Autorize o acesso à câmera para fotografar o produto.',
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn('[image-picker] Falha ao pedir permissão da câmera', error);
    Alert.alert(
      'Câmera indisponível',
      'Este build não inclui o módulo de imagens. Gere um novo APK com npx expo run:android.',
    );
    return false;
  }
}

async function ensureLibraryPermission() {
  const ImagePicker = getImagePicker();
  if (!ImagePicker) {
    return false;
  }

  try {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (current.granted) {
      return true;
    }

    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!requested.granted) {
      Alert.alert(
        'Permissão da galeria',
        'Autorize o acesso às fotos para escolher a imagem do produto.',
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn('[image-picker] Falha ao pedir permissão da galeria', error);
    Alert.alert(
      'Galeria indisponível',
      'Este build não inclui o módulo de imagens. Gere um novo APK com npx expo run:android.',
    );
    return false;
  }
}

function extensionFromMime(mimeType: string | undefined, uri: string) {
  if (mimeType?.includes('png')) {
    return 'png';
  }
  if (mimeType?.includes('webp')) {
    return 'webp';
  }
  const fromUri = uri.split('.').pop()?.toLowerCase();
  if (fromUri === 'png' || fromUri === 'webp' || fromUri === 'jpg' || fromUri === 'jpeg') {
    return fromUri === 'jpg' ? 'jpeg' : fromUri;
  }
  return 'jpeg';
}

async function pickFrom(
  source: 'camera' | 'library',
): Promise<PickedProductImage | null> {
  const ImagePicker = getImagePicker();
  if (!ImagePicker) {
    Alert.alert(
      'Câmera indisponível',
      'Este build não inclui o módulo de imagens. Gere um novo APK com npx expo run:android.',
    );
    return null;
  }

  const allowed =
    source === 'camera'
      ? await ensureCameraPermission()
      : await ensureLibraryPermission();

  if (!allowed) {
    return null;
  }

  try {
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.72,
            allowsEditing: true,
            aspect: [1, 1],
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.72,
            allowsEditing: true,
            aspect: [1, 1],
          });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'image/jpeg';
    return {
      uri: asset.uri,
      mimeType,
      fileExt: extensionFromMime(mimeType, asset.uri),
    };
  } catch (error) {
    console.warn('[image-picker] Falha ao abrir seletor de imagem', error);
    Alert.alert(
      'Imagem indisponível',
      'Este build não inclui o módulo de imagens. Gere um novo APK com npx expo run:android.',
    );
    return null;
  }
}

export function promptProductImageSource(
  onPicked: (image: PickedProductImage) => void,
) {
  if (!getImagePicker()) {
    Alert.alert(
      'Câmera indisponível',
      'Este build não inclui o módulo de imagens. Gere um novo APK com npx expo run:android.',
    );
    return;
  }

  Alert.alert('Foto do produto', 'Como deseja adicionar a imagem?', [
    {
      text: 'Câmera',
      onPress: () => {
        void pickFrom('camera').then((image) => {
          if (image) {
            onPicked(image);
          }
        });
      },
    },
    {
      text: 'Galeria',
      onPress: () => {
        void pickFrom('library').then((image) => {
          if (image) {
            onPicked(image);
          }
        });
      },
    },
    { text: 'Cancelar', style: 'cancel' },
  ]);
}

export async function uploadProductImage(
  image: PickedProductImage,
  productKey: string,
): Promise<string> {
  assertSupabaseConfigured();

  const response = await fetch(image.uri);
  const arrayBuffer = await response.arrayBuffer();
  const path = `${productKey}/${Date.now()}.${image.fileExt}`;

  const { error } = await supabase.storage.from('product-images').upload(path, arrayBuffer, {
    contentType: image.mimeType,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  if (!data.publicUrl) {
    throw new Error('Não foi possível obter a URL da imagem.');
  }

  const separator = data.publicUrl.includes('?') ? '&' : '?';
  return `${data.publicUrl}${separator}t=${Date.now()}`;
}
