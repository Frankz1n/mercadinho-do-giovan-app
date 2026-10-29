# Matriz de autorização (Etapa 1) — execução manual

Não inventar resultados. Preencher após rodar com usuários sintéticos A, B, admin e anon.

Pré-requisitos: projeto Supabase acessível, Auth com e-mails de teste, migration `20260328230000_etapa1_authz_hardening.sql` aplicada.

## Contas

| Papel | E-mail | Observação |
|-------|--------|------------|
| A | `sec-a@example.com` | customer |
| B | `sec-b@example.com` | customer |
| Admin | `sec-admin@example.com` | `profiles.role = admin` |
| Visitante | — | só anon key |

## Checklist API (PostgREST / supabase-js)

Use JWT do usuário (nunca service role como cliente).

| # | Ação | Esperado | Resultado | Evidência |
|---|------|----------|-----------|-----------|
| 1 | A `select` orders de B | 0 linhas / sem erro de leak | | |
| 2 | A `update` order de B | falha RLS | | |
| 3 | A `select` addresses de B | 0 linhas | | |
| 4 | A `update` address de B | falha | | |
| 5 | A `update` profiles set role=admin | falha (trigger) | | |
| 6 | A `update` profiles set email=... | falha (trigger) | | |
| 7 | A `update` profiles set name/phone próprios | ok | | |
| 8 | A `rpc place_order` com unit_price adulterado | pedido com preço do catálogo | | |
| 9 | A `rpc cancel_order` | Forbidden / não admin | | |
| 10 | A `rpc adjust_stock` | Forbidden | | |
| 11 | A `update` products stock | falha RLS | | |
| 12 | Anon `select` products ativos | ok (catálogo público) | |
| 13 | Anon `select` orders | falha / vazio | | |
| 14 | Admin `update` order status cancelled direto | falha (trigger; usar cancel_order) | | |
| 15 | Admin `rpc cancel_order` em awaiting | ok + ledger | | |

## Comando exemplo (local)

```bash
# Preencher URL e keys de homologação; não versionar tokens.
# npx supabase ... ou script próprio com @supabase/supabase-js
```

Status deste arquivo: **não executado nesta sessão** (ambiente remoto / contas sintéticas não provisionadas pelo agente).
