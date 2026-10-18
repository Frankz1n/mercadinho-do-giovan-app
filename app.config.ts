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
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
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
});
