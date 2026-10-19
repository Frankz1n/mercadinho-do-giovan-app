import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Mercadinho do Giovan',
  slug: 'mercadinho-do-giovan',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/logo-mercadinho-do-giovan.png',
  scheme: 'mercadinhogiovan',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#061C6C',
      foregroundImage: './assets/images/logo-mercadinho-do-giovan.png',
    },
    package: 'br.com.mercadinhodogiovan.app',
    predictiveBackGestureEnabled: true,
    // Obrigatório no Android para Expo Push (FCM). Sem este arquivo o token nunca é gerado.
    googleServicesFile: './google-services.json',
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-sqlite',
    [
      'expo-notifications',
      {
        color: '#061C6C',
        defaultChannel: 'default',
      },
    ],
    [
      'expo-image-picker',
      {
        cameraPermission:
          'O Mercadinho do Giovan precisa da câmera para fotografar produtos.',
        photosPermission:
          'O Mercadinho do Giovan precisa da galeria para escolher fotos de produtos.',
        microphonePermission: false,
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#061C6C',
        image: './assets/images/logo-mercadinho-do-giovan.png',
        imageWidth: 180,
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          buildToolsVersion: '36.0.0',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId:
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
        '2269064d-167b-4b82-80af-7937d63aef3d',
    },
  },
});
