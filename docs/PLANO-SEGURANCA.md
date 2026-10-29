# Mercadinho do Giovan — plano de implementação no Cursor

Data: 28/10/2026. Stack: React Native + Expo + TypeScript + Supabase.

## 1. Objetivo e limites

Preparar o aplicativo para publicação, protegendo dados pessoais, pedidos e estoque, e medir seu comportamento com 100 usuários simultâneos. Milhares de contas cadastradas e 100 usuários ativos são cargas diferentes: capacidade será comprovada com um cenário reproduzível e a configuração real da infraestrutura.

Este documento é um plano, não uma certificação de segurança nem uma nova auditoria do código. O relatório fornecido descreve correções que precisam ser confrontadas com o checkout local, migrations e ambiente implantado. A revisão anterior do repositório público encontrou uma versão anterior a várias dessas correções.

Escopo: pagamento na retirada, catálogo, cestas, pedidos, perfil, notificações e administração. Preservar o visual e as funcionalidades atuais. Não adicionar pagamentos, microserviços ou trocar o backend.

## 2. Como executar

1. Colocar este arquivo em `docs/PLANO-SEGURANCA.md` no projeto.
2. Usar o prompt da seção 13 no Cursor para executar uma etapa por vez.
3. Fazer uma alteração revisável por etapa; separar mudanças grandes em PRs menores.
4. Validar localmente e em homologação com dados sintéticos. Produção fica para uma implantação explícita, após a revisão do resultado.
5. Registrar evidências em `docs/security-status.md`, distinguindo implementado, testado e aplicado no ambiente. Não marcar como concluído só porque existe uma função ou política.

Não reescrever migrations já aplicadas. Criar migrations incrementais usando a CLI instalada e documentar compatibilidade com versões antigas do aplicativo. Se não houver acesso a um ambiente, registrar “não verificado”; continuar o trabalho local possível.

## 3. Ordem de entrega

| Etapa | Prioridade | Entrega | Dependência |
|-------|------------|---------|-------------|
| 0 | P0 | Inventário e diagnóstico comprovável | Nenhuma |
| 1 | P0 | Permissões, RLS e proteção de funções | 0 |
| 2 | P0 | Pedido idempotente e estoque consistente | 1 |
| 3 | P0 | Máquina de estados e cancelamento | 2 |
| 4 | P0 | Push seguro e limites de abuso | 1–3 |
| 5 | P1 | Recuperação de senha e MFA do admin | 1 |
| 6 | P1 | Exclusão de conta e privacidade | 1, 3, 5 |
| 7 | P1 | Consultas, métricas e teste de carga | 2–4 |
| 8 | P1 | Auditoria, CI, recuperação e publicação | Todas |

P0 bloqueia o piloto com dados reais. P1 deve ser concluído antes da publicação pública conforme os critérios deste plano. A prioridade é de execução, não uma classificação de severidade de vulnerabilidades ainda não confirmadas.

## 4. Etapa 0 — confirmar o estado real

### Implementação

- Ler AGENTS.md, configuração Expo, dependências, lockfile, serviços, hooks, migrations e Edge Functions.
- Registrar branch, commit e alterações locais sem sobrescrever trabalho existente.
- Localizar place_order, cancel_order, adjust_stock, ledger, triggers, políticas, send-push, recuperação de senha e resolveSafeReturnTo. Os nomes são pistas; seguir a estrutura real.
- Comparar migrations locais e aplicadas quando houver acesso autorizado. Inspeção inicial deve ser somente leitura.
- Montar mapa dos endpoints e objetos expostos: papel, operações permitidas, propriedade dos dados e limites.
- Executar lint, verificação de tipos e testes existentes; registrar falhas anteriores.
- Conferir versões e documentação oficial compatível antes de escolher APIs ou comandos.

### Aceite

Cada item do relatório tem evidência de arquivo/migration/configuração e situação verificável. Nenhuma correção é recriada sem necessidade. Configurações desconhecidas ficam em uma lista de pendências externas.

## 5. Etapa 1 — autorização e isolamento

### Implementação

- Revisar grants e RLS de todas as tabelas, views, buckets e funções expostos. Definir quais leituras de catálogo são públicas de propósito.
- Testar USING e WITH CHECK, especialmente propriedade em UPDATE. Conceder somente operações necessárias.
- Restringir alteração de role e campos administrativos no servidor. Não usar user_metadata editável pelo usuário como fonte de autorização.
- Evitar política de perfil que faça consulta recursiva à própria tabela. Escolher proteção de colunas, trigger ou função controlada conforme o esquema real.
- Definir a fonte de verdade do e-mail e manter compatibilidade com troca legítima via Auth; bloquear apenas alteração indevida direta.
- Inspecionar SQL dinâmico dentro das RPCs: parâmetros no cliente não garantem segurança se a função concatenar SQL internamente.
- Revisar funções SECURITY DEFINER: necessidade, dono, search_path seguro, referências qualificadas, validação do chamador e grants de execução, incluindo privilégios herdados de PUBLIC e overloads antigos.
- Revisar views e acesso a Storage. Evitar bypass de RLS em views; uploads de produtos apenas por admin, com tamanho e tipo limitados.
- Conferir que o app e seu bundle não contêm service role, chaves privadas ou credenciais de servidor.

### Testes e aceite

Usar chamadas diretas à API com usuários sintéticos A, B, admin e visitante. A não lê nem altera pedidos, itens, endereço, perfil ou tokens de B. Não consegue promover a si mesmo, trocar user_id, alterar estoque/preço/status ou invocar funções internas. Admin só acessa operações previstas. Não executar estes testes de autorização com service role como cliente.

## 6–12. Etapas 2–8

(Ver plano completo nas seções do documento original do produto; mantidas integralmente no histórico do chat e aplicadas etapa a etapa.)

### Etapa 2 — pedidos e estoque

Servidor calcula preços; idempotência; ledger; locks; limites; cestas no servidor.

### Etapa 3 — estados e cancelamento

RPCs de transição; estados terminais; reposição pelo ledger; ajustes manuais auditados.

### Etapa 4 — push e abuso

Push derivado de evento; Edge autorizada; limites Auth/RPC; outbox.

### Etapa 5 — recuperação e MFA admin

Reset de senha completo; MFA admin no servidor.

### Etapa 6 — exclusão e privacidade

Exclusão de conta; política; Play Console.

### Etapa 7 — desempenho e carga

Paginação no banco; k6 100 VUs; métricas no servidor.

### Etapa 8 — auditoria, CI e publicação

Logs de auditoria; CI; backups; release Android.

## 13. Prompt inicial

Trabalhe no projeto Mercadinho do Giovan seguindo docs/PLANO-SEGURANCA.md.

Comece pela Etapa 0. Inspecione o checkout atual, AGENTS.md, código, migrations,
Edge Functions e testes. O relatório anterior não é prova de implementação.
Preserve alterações locais e funcionalidades existentes.

Crie docs/security-status.md com requisito, evidência, risco confirmado,
implementado/testado/aplicado por ambiente e pendência. Execute os checks
existentes e diferencie falhas anteriores das introduzidas pelo trabalho.

Após o diagnóstico, implemente a Etapa 1 e seus testes em mudanças pequenas.
Consulte documentação oficial compatível com as versões instaladas. Não
reescreva migrations aplicadas, não introduza dependências sem necessidade,
não use service role no cliente e não confunda controles da UI com autorização.

Use ambiente local ou homologação com dados sintéticos. Não aplique alterações
em produção nem execute carga contra usuários reais. Se uma configuração
externa não estiver acessível, documente passos e validação pendentes e siga
com o trabalho local possível. Nunca invente resultados de testes.

Ao terminar a etapa, entregue:

1. Problemas confirmados e evidências.
2. Arquivos/migrations alterados e motivo.
3. Comandos executados e resultados dos testes.
4. Configurações externas ainda necessárias.
5. Riscos, compatibilidade, implantação e reversão.
6. Próxima etapa recomendada.

Não avance automaticamente por todas as etapas nesta primeira execução.
Conclua o diagnóstico e a Etapa 1 para que possamos revisar o primeiro lote.

## 14. Referências oficiais

- Supabase, segurança da Data API — grants e RLS: https://supabase.com/docs/guides/api/securing-your-api
- Supabase, limites nativos de Auth: https://supabase.com/docs/guides/auth/rate-limits
- Google Play, exclusão de conta e dados: https://support.google.com/googleplay/android-developer/answer/13327111?hl=pt-BR
