# Security status — Mercadinho do Giovan

Atualizado: 2026-10-28. Branch: `main` @ `2c82dc5` + alterações locais não commitadas.  
Plano: `docs/PLANO-SEGURANCA.md`.

Legenda: **implementado** (código/migration no repo) · **testado** (prova executada) · **aplicado** (ambiente remoto confirmado).

---

## Etapa 0 — inventário

### Checkout / commit

| Item | Evidência |
|------|-----------|
| Branch | `main` tracking `origin/main` |
| HEAD remoto conhecido | `2c82dc5` |
| Trabalho local | Muitos arquivos modificados + untracked (endereços, legal, account, images, migrations 2616–2823) — **preservados** |
| Expo | `~57.0.30` |
| supabase-js | `^2.118.0` |
| Service role no cliente | Não; só `EXPO_PUBLIC_*` em `src/lib/supabase.ts`. Service role só em `supabase/functions/send-push/index.ts` via env Deno |

### Artefatos localizados

| Artefato | Onde |
|----------|------|
| `place_order` | Migrations `…120000`, `…820000`, `…822000` (última redefine) |
| `cancel_order` | `…820000`, `…822000` |
| `adjust_stock` | `…120000` |
| `order_stock_ledger` | `…822000` |
| Trigger anti-cancel direto | `…822000` `prevent_direct_order_cancel` |
| Storage product-images | `…912000` (5MB, jpeg/png/webp, write admin) |
| `send-push` | `supabase/functions/send-push/index.ts` |
| Recuperação senha | `app/(auth)/recover.tsx` + `authRepository.recoverPassword` (sem tela de set-password) |
| `resolveSafeReturnTo` | `src/lib/safe-navigation.ts` |

### Migrations locais vs aplicadas

| Migration | No repo | Aplicada no remoto |
|-----------|---------|-------------------|
| `20260318120000_init_schema.sql` | sim | **não verificado** nesta sessão |
| `20260318140000_notifications.sql` | sim | **não verificado** |
| `20260319120000_product_images_storage.sql` | sim | **não verificado** |
| `20260326160000_real_baskets.sql` | sim (untracked) | usuário reportou ter rodado parte; **não verificado** pelo agente |
| `20260328190000_feature_packshot_products.sql` | sim | **não verificado** |
| `20260328200000_secure_order_price_and_cancel.sql` | sim | **não verificado** |
| `20260328210000_user_addresses.sql` | sim | **não verificado** |
| `20260328220000_harden_security.sql` | sim | **não verificado** |
| `20260328230000_etapa1_authz_hardening.sql` | sim (nova Etapa 1) | **não aplicada** (aguardando revisão) |

### Mapa de exposição (resumo)

| Objeto | anon | customer | admin |
|--------|------|----------|-------|
| categories/products/baskets/components | SELECT (catálogo) | SELECT | SELECT + CRUD products |
| profiles | — | SELECT/UPDATE own | SELECT any |
| addresses | — | CRUD own | (sem policy admin extra; só own) |
| orders / order_items | — | SELECT own | SELECT all; UPDATE (RLS admin); cancel via RPC |
| order_stock_ledger | — | SELECT own/admin | SELECT |
| device_tokens | — | CRUD own | — |
| storage product-images | SELECT | SELECT | INSERT/UPDATE/DELETE |
| RPC place_order | — | execute | execute |
| RPC cancel_order / adjust_stock | — | execute (falha se não admin) | execute |
| Edge send-push | — | JWT; audience admins | JWT; user/customers |

### Checks executados (esta sessão)

| Comando | Resultado |
|---------|-----------|
| `npx tsc --noEmit` | exit 0 |
| `npx expo lint` | 1 erro prévio/local em `app/account` (import type) — **corrigido nesta etapa**; 1 warning RHF em addresses/form (pré-existente / incompatível compiler) |
| Testes unitários automatizados de RLS | **não existem**; matriz manual em `docs/security/rls-matrix-checks.md` (**não executada**) |

---

## Requisitos × status

| Requisito | Evidência | Risco confirmado? | Impl. | Testado | Aplicado |
|-----------|-----------|-------------------|-------|---------|----------|
| Sem service role no app | `src/lib/supabase.ts` | Não encontrado no bundle client | sim | inspeção estática | n/a |
| Catálogo público de propósito | policies `*_read_*` init | Intencional | sim | **não** (API) | ? |
| RLS pedidos/itens | init | — | sim | **não** | ? |
| Preço no servidor | `…820000` / `…822000` | Relatório anterior; código local presente | sim | **não** | ? |
| Ledger + cancel via RPC | `…822000` | — | sim | **não** | ? |
| Bloqueio cancel UPDATE direto | trigger `…822000` | — | sim | **não** | ? |
| Limites place_order | `…822000` | — | sim | **não** | ? |
| Profiles sem promoção role/email | trigger Etapa 1 `…823000` | RLS recursiva era problema; mitigada | sim (nova) | **não** | **não** |
| Endereços own-only + CHECKs | `…821000` + `…822000` | — | sim | **não** | ? |
| Storage upload admin + mime/size | `…912000` | — | sim | **não** | ? |
| Open-redirect returnTo | `safe-navigation.ts` | — | sim | **não** | n/a app |
| Idempotência place_order | — | **Ausente** (Etapa 2) | não | — | — |
| Máquina de estados completa | só cancel bloqueado | ready/completed ainda UPDATE admin | parcial | **não** | ? |
| Push outbox / sem texto livre | send-push aceita title/body do client | Confirmado no código: cliente pode avisar admins com texto arbitrário | parcial | **não** | ? |
| Rate limit pedidos | — | Ausente (Etapa 4) | não | — | — |
| Reset senha completo | só e-mail | Sem set-password screen | parcial | **não** | — |
| MFA admin | — | Ausente (Etapa 5) | não | — | — |
| Exclusão de conta | — | Ausente (Etapa 6) | não | — | — |

---

## Problemas confirmados (Etapa 0+1)

1. **RLS de profile com subquery recursiva** (`profiles` → `profiles`) na policy antiga / harden — risco de erros RLS e manutenção frágil. **Mitigado** na migration `…823000` (trigger + WITH CHECK simples).
2. **Migrations recentes não verificadas no remoto** — risco de “código assume ledger/trigger e banco não tem”.
3. **send-push**: qualquer customer autenticado pode chamar audience `admins` com `title`/`body` livres (spam/phishing interno). Etapa 4 no plano; não reescrito agora.
4. **Sem idempotência** em `place_order` — Etapa 2.
5. **UPDATE de status ready/completed** ainda direto — Etapa 3.
6. **Matriz A/B/admin não executada** nesta sessão.

---

## Pendências externas

- Acesso somente-leitura ao projeto Supabase (listar migrations aplicadas).
- Contas sintéticas A/B/admin para matriz em `docs/security/rls-matrix-checks.md`.
- Deploy Edge `send-push` e status FCM (fora desta etapa).
- Aplicar `20260328230000_etapa1_authz_hardening.sql` em homologação após revisão.

---

## Etapa 1 — o que mudou

| Arquivo | Motivo |
|---------|--------|
| `supabase/migrations/20260328230000_etapa1_authz_hardening.sql` | Trigger imutável email/role/id; RLS profile sem recursão; revoke PUBLIC nas RPCs; `generate_order_code` sem grant a clients |
| `docs/security-status.md` | Evidências |
| `docs/security/rls-matrix-checks.md` | Roteiro de teste (não executado) |
| `docs/PLANO-SEGURANCA.md` | Plano oficial |
| `app/account/index.tsx` | Lint `import type` |

Compatibilidade: apps antigos que atualizavam só name/phone continuam OK. Tentativa de mudar email/role via API passa a falhar explicitamente (desejado).

Reversão: `drop trigger profiles_protect_immutable`; restaurar policy anterior (não recomendado). Não usar reset de banco.
