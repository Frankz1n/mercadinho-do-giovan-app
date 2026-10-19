import { supabase } from '@/lib/supabase';

export type PushAudience = 'user' | 'admins' | 'customers';

export async function requestPush(input: {
  audience: PushAudience;
  userId?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  try {
    const { data, error } = await supabase.functions.invoke('send-push', {
      body: input,
    });

    if (error) {
      console.warn('[push] falha ao enviar', error.message, input);
      return;
    }

    if (
      data &&
      typeof data === 'object' &&
      'sent' in data &&
      typeof (data as { sent: unknown }).sent === 'number' &&
      (data as { sent: number }).sent === 0
    ) {
      console.warn(
        '[push] nenhum device_token encontrado para o destinatário. Confirme FCM + login no aparelho de destino.',
        input,
      );
    }
  } catch (error) {
    console.warn(
      '[push] invoke send-push falhou (função deployada?)',
      error instanceof Error ? error.message : error,
      input,
    );
  }
}
