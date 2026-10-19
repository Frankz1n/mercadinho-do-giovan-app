#!/usr/bin/env bash
# Configura FCM + rebuild Android + (opcional) deploy send-push
set -euo pipefail

cd "$(dirname "$0")/.."

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

if [[ ! -f google-services.json ]]; then
  echo "Falta google-services.json na raiz do projeto."
  exit 1
fi

if [[ ! -f firebase-service-account.json ]]; then
  echo "Falta firebase-service-account.json na raiz (chave FCM V1)."
  exit 1
fi

echo "==> 1/4 Prebuild Android (inclui google-services.json)"
npx expo prebuild --platform android --clean

echo "==> 2/4 Build + instala no emulador/device"
adb devices
npx expo run:android

echo "==> 3/4 Upload FCM V1 no EAS (interativo — selecione o arquivo firebase-service-account.json)"
echo "    Se preferir pelo site: https://expo.dev/accounts/orbyts-software/projects/mercadinho-do-giovan/credentials"
npx eas-cli@latest credentials -p android || true

echo "==> 4/4 Deploy Edge Function send-push (precisa estar logado no Supabase)"
if command -v supabase >/dev/null 2>&1 || npx supabase --version >/dev/null 2>&1; then
  npx supabase functions deploy send-push || echo "Deploy da função falhou — rode depois: npx supabase functions deploy send-push"
else
  echo "Supabase CLI não encontrado — rode: npx supabase functions deploy send-push"
fi

echo
echo "Pronto. Abra o app, faça login (admin e cliente) e aceite a permissão de notificação."
echo "No Metro não deve mais aparecer o erro do Firebase."
