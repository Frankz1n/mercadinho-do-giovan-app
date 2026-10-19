import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

type Audience = 'user' | 'admins' | 'customers';

type Body = {
  audience: Audience;
  userId?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: 'Missing Supabase env' }, 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const payload = (await req.json()) as Body;
    if (!payload?.audience || !payload.title || !payload.body) {
      return json({ error: 'Invalid payload' }, 400);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = callerProfile?.role === 'admin';

    // Cliente autenticado só pode avisar admins (novo pedido).
    // Admin pode notificar cliente específico ou todos os customers.
    if (payload.audience === 'customers' && !isAdmin) {
      return json({ error: 'Forbidden' }, 403);
    }

    if (payload.audience === 'user') {
      if (!payload.userId) {
        return json({ error: 'userId required' }, 400);
      }
      if (!isAdmin) {
        return json({ error: 'Forbidden' }, 403);
      }
    }

    if (payload.audience === 'admins' && !isAdmin) {
      // permitido: cliente notificando fila após checkout
    }

    let tokens: string[] = [];

    if (payload.audience === 'user' && payload.userId) {
      const { data } = await admin
        .from('device_tokens')
        .select('expo_push_token')
        .eq('user_id', payload.userId);
      tokens = (data ?? []).map((row) => row.expo_push_token);
    } else if (payload.audience === 'admins') {
      const { data: admins } = await admin
        .from('profiles')
        .select('id')
        .eq('role', 'admin');
      const adminIds = (admins ?? []).map((row) => row.id);
      if (adminIds.length > 0) {
        const { data } = await admin
          .from('device_tokens')
          .select('expo_push_token')
          .in('user_id', adminIds);
        tokens = (data ?? []).map((row) => row.expo_push_token);
      }
    } else if (payload.audience === 'customers') {
      const { data: customers } = await admin
        .from('profiles')
        .select('id')
        .eq('role', 'customer');
      const customerIds = (customers ?? []).map((row) => row.id);
      if (customerIds.length > 0) {
        const { data } = await admin
          .from('device_tokens')
          .select('expo_push_token')
          .in('user_id', customerIds);
        tokens = (data ?? []).map((row) => row.expo_push_token);
      }
    }

    tokens = [...new Set(tokens.filter(Boolean))];
    if (tokens.length === 0) {
      return json({ sent: 0 });
    }

    const messages = tokens.map((to) => ({
      to,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    }));

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const expoJson = await expoResponse.json();
    return json({ sent: tokens.length, expo: expoJson });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
