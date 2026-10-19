# Mercadinho do Giovan

App Android de compras com React Native, Expo Router, TypeScript e **Supabase**
(Auth + Postgres + RLS). Não há pagamento no app: o cliente fecha o pedido, recebe
um código (`MG-XXXXXX`) e paga na retirada.

## Versões

- Expo SDK `57`
- React Native `0.86`
- `@supabase/supabase-js` + `expo-sqlite` (sessão)

## Setup rápido

### 1. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha no [Dashboard Supabase](https://supabase.com/dashboard) → Project Settings → API:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable ou anon key)

Ou, com EAS: `npx eas-cli integrations:supabase:connect`

### 2. Banco (migration + seed)

No SQL Editor do projeto (ou `supabase db push` + seed):

1. Rode `supabase/migrations/20260318120000_init_schema.sql`
2. Rode `supabase/seed.sql` (categorias, produtos, cestas)

Em **Authentication → Providers → Email**, desative “Confirm email” em desenvolvimento
para o `signUp` já retornar sessão.

### 3. Conta admin

1. Cadastre-se pelo app.
2. No SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'seu@email.com';
```

### 4. App

```bash
npm ci
npm start
```

## Fluxo do pedido

1. Cliente monta o carrinho e faz checkout autenticado.
2. RPC `place_order` cria o pedido, gera o código e baixa o estoque de forma atômica.
3. Pedido entra na fila admin (`awaiting_pickup`).
4. Na retirada, Giovan dá baixa (`completed`).

## Qualidade

```bash
npm run lint
npm run typecheck
npm run check
npm run doctor
```

## Estrutura

- `app/` — rotas (loja, auth, checkout, pedidos, admin)
- `src/features/` — auth, cart, catalog, orders (repositórios Supabase)
- `src/lib/supabase.ts` — cliente
- `supabase/migrations/` — schema, RLS, RPCs
- `supabase/seed.sql` — catálogo inicial

## Notificações

- Toasts in-app (carrinho, pedido, fila admin via Realtime).
- Push remoto (`expo-notifications` + Edge Function `send-push`): novo pedido → admins; pedido pronto → cliente; queda de preço → clientes.
- Rode a migration `20260318140000_notifications.sql` e faça deploy de `supabase/functions/send-push`.
- Push no Android exige **development build** (não Expo Go). Defina `EXPO_PUBLIC_EAS_PROJECT_ID`.

## Estoque / fotos de produto

- Ajuste e edição salvam no Supabase (`adjust_stock` / `upsertProduct`).
- Fotos via câmera/galeria (`expo-image-picker`) → bucket Storage `product-images`.
- Rode também `supabase/migrations/20260319120000_product_images_storage.sql`.
- Câmera exige development build atualizado (plugin no `app.config.ts`).

## Pendências

- Ícones finais da Play Store
- EAS Build / submit + credenciais FCM
- Validação em aparelho Android
