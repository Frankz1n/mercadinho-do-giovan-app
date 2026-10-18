# Mercadinho do Giovan

App Android de compras com React Native, Expo Router e TypeScript. Catálogo, auth,
carrinho e pedidos funcionam localmente (sem Supabase ainda). Não há pagamento no app:
o cliente fecha o pedido, recebe um código e paga na retirada.

## Versões aprovadas

- Expo SDK `57.0.30`
- React Native `0.86.3`
- React `19.2.3`
- Android `compileSdkVersion 36` e `targetSdkVersion 36`
- Node.js `>= 20.19.4`

## Executar

```bash
cp .env.example .env.local
npm ci
npm start
```

## Fluxo do pedido (sem pagamento online)

1. Cliente escolhe produtos/cestas e adiciona ao carrinho.
2. No checkout, com login, fecha o pedido e recebe um código único (`MG-XXXXXX`).
3. O pedido aparece na fila do painel admin com todos os itens.
4. Cliente retira no mercado; Giovan recebe o pagamento e dá baixa no sistema.
5. O estoque é reduzido ao fechar o pedido (ajuste local).

### Conta admin local

- E-mail: `giovan@mercadinho.local`
- Senha: `giovan123`

## Qualidade

```bash
npm run lint
npm run typecheck
npm run check
npm run doctor
```

## Dados locais

- Catálogo: `src/features/catalog/data/local-catalog-repository.ts` (imagens remotas).
- Auth/sessão: AsyncStorage + SecureStore (`src/features/auth`).
- Pedidos: AsyncStorage (`src/features/orders`).
- Carrinho: só IDs/quantidades no AsyncStorage; preço/nome resolvidos pelo catálogo.

Backend Supabase (migrations, RLS, RPC) fica para a próxima fase.

## Estrutura

- `app/`: rotas Expo Router (loja, auth, checkout, pedidos, admin).
- `src/components/ui/`: componentes compartilhados.
- `src/features/`: auth, cart, catalog, orders.
- `src/lib/`: utilitários.
- `src/theme/`: tokens visuais.

## Pendências

- Ícone 1024×1024 e adaptive icon finais para a Play Store.
- Projetos Supabase (dev/homolog/prod) e EAS.
- Validação em aparelho Android e build release.
