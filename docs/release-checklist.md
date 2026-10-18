# Checklist de release Android

Este documento registra pendências; a Fase 0 não está pronta para publicação.

## Identidade e configuração

- [x] Receber e incorporar o logo oficial.
- [ ] Gerar ícone final 1024 × 1024 e revisar adaptive icon e splash.
- [ ] Confirmar `br.com.mercadinhodogiovan.app` como package definitivo.
- [ ] Vincular projeto EAS e configurar credenciais com responsáveis definidos.
- [ ] Confirmar API alvo exigida pela Play Store na data da publicação.

## Produto e operação

- [ ] Validar catálogo, cestas, estoque, horários e pedido mínimo.
- [ ] Confirmar retirada, entrega, bairros, taxa e prazo.
- [ ] Confirmar substituição, cancelamento e canais de atendimento.
- [ ] Definir forma real de pagamento combinado com a loja.

## Segurança e privacidade

- [ ] Concluir testes de RLS, RPCs e concorrência das fases seguintes.
- [ ] Publicar política de privacidade e página de exclusão de conta.
- [ ] Preencher Data safety com base no aplicativo e SDKs reais.
- [ ] Auditar permissões Android e checklist OWASP MASVS.

## Distribuição

- [ ] Gerar e inspecionar o AAB de produção.
- [ ] Confirmar `targetSdkVersion` no artefato.
- [ ] Testar login, recuperação, pedido e admin em aparelho físico.
- [ ] Concluir teste interno/fechado aplicável à conta Play Console.
