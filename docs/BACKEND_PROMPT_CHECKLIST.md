# Checklist de execução do prompt: backend

Este checklist compara os requisitos backend do prompt principal e do relatório de segurança com o estado deste repositório. “Implementado” significa que existe código local; não implica deploy ou validação em ambiente de produção.

## Segurança e requisitos prioritários

| Requisito | Estado | Evidência / pendência |
|---|---|---|
| Senhas Argon2id (19 456 KiB, 2 iterações, paralelismo 1) e migração bcrypt no login | Implementado | `src/utils/argon2id-hasher.ts`, `src/services/authenticate-password.ts`; bcrypt permanece apenas para verificar hashes legados. |
| Turnstile no backend com validação de token, hostname e ação | Implementado | `src/services/turnstile-validator.ts`; frontend e segredo do provedor têm de estar configurados nos respectivos ambientes. |
| Ownership para fluxos de transporte, localização e entrega | Implementado nos pontos auditados | `src/model/transport.model.ts`, `src/model/location.model.ts`, `src/model/flow.model.ts`; existem testes de isolamento cross-account em `tests/unit/idor-ownership.test.ts`. Uma auditoria contínua de todas as queries ainda é recomendada. |
| Erros genéricos, requestId e logs sem body/token | Implementado | `src/middlewares/error-handler.ts`, `src/services/logger.ts`; não foram encontrados `console.log/error/warn` nos diretórios `src/model`, `src/services` e `src/utils/schemas`. |
| Segredos ignorados e exemplo de configuração | Implementado no checkout | `.env` não está rastreado nem aparece no histórico visível deste clone; `.gitignore` e `.env.example` estão presentes. Rotação da chave ativa exige ação no gestor de segredos/deploy. |
| Zod strictObject para entradas HTTP | Implementado nos schemas existentes | Schemas de body, parâmetros e headers auditados usam `z.strictObject`; `DataValidate` foi removida. |
| Rate limits API/auth/pagamentos com Redis e identidade em auth | Implementado com contingência | `src/config/rate-limiting.ts`; auth 5/15 min, API 60/min, pagamento 10/min. O IP e HMAC da identidade formam a chave, sem email/NIF em claro. Redis indisponível é fail-open; produção exige Redis. |
| RBAC e papel admin | Implementado | enum Prisma, migração e middleware `require-admin`; rotas administrativas devem continuar sendo adicionadas com autorização explícita. |
| Geocoding protegido contra SSRF e coordenadas fora de Angola | Implementado | `src/services/geocoder.ts`; host fixo, redirect bloqueado, timeout e limites geográficos. |
| Helmet/CSP | Parcial | Helmet está ativo com política padrão; política estrita com nonce/Trusted Types ainda não foi configurada nem testada para os assets reais. |
| Testes de segurança para IDOR, CAPTCHA, rate limit e erros | Parcialmente implementado | Testes unitários cobrem esses módulos e casos; ainda faltam testes de integração HTTP/DB, SQLi/XSS automatizados no pipeline e testes E2E. |
| Cobertura mínima de negócio 80% e branches 70% | Pendente | Resultado atual: 21,56% statements, 23,70% branches, 34,07% funções e 20,17% linhas. Há gates de 100% para módulos de segurança selecionados em `jest.config.ts`, sem gate global de 80%. |
| CI para build, testes/cobertura e auditoria npm | Implementado localmente, não executado em GitHub | `.github/workflows/backend-ci.yml`; validação do workflow remoto depende de push/PR. O passo de auditoria também pode falhar enquanto houver advisories nas dependências. |
| Classificação de funcionalidades | Implementado | `docs/FEATURE_STATUS.md` distingue recursos implementados, simulados e ausentes. |

| Cache distribuída para reduzir consultas repetidas | Implementado para o catálogo de produtos do consumidor | Redis cache-aside de 30 segundos por padrão, invalidação após criar/editar/apagar produto e fallback ao PostgreSQL; não cobre ainda todas as leituras. |
| Load balancing para múltiplas instâncias | Configuração adicionada | Dockerfile, health checks de Compose e Nginx `least_conn` com descoberta DNS de réplicas em `deploy/`; o Compose foi validado, mas as containers não foram iniciados. |
| Refresh token no login | Implementado | Access JWT 15 min + refresh opaco 30 dias, hash persistido, rotação atómica, revogação e endpoints refresh/logout. Clientes têm de guardar o novo refresh token em armazenamento seguro. |
| Email para confirmar OTP sem Redis | Implementado | O cliente envia email+código; Supabase valida o par e PostgreSQL encontra a conta pendente por email. O envio via NIF usa agora o email associado à empresa. |

## Requisitos de arquitetura e qualidade

| Requisito | Estado | Pendência |
|---|---|---|
| Interfaces de senha, CAPTCHA, logger e geocoder | Parcialmente implementado | As abstrações existem e têm implementações substituíveis; vários controllers ainda constroem models concretos diretamente. |
| DI container/factory e controllers dependentes de interfaces | Pendente | A composição atual usa singletons concretos nos controllers; não foi feita migração global para DI. |
| SRP/ISP, estratégias de pagamento/notificação/transporte e domain events | Parcial | Algumas responsabilidades foram extraídas; estratégias, eventos de domínio e separação completa de contextos ainda não existem. |
| Prisma migrations versionadas | Implementado | A migração de índices foi adicionada junto ao schema. Rollback automatizado não foi testado. |
| Índices recomendados | Implementado no schema e migration | Índices para pedidos, produtos, transport requests e localização; desempenho real requer `EXPLAIN` com volume de produção. |
| Pool PostgreSQL, PgBouncer e read replicas | Parcial/dependente de infraestrutura | Cada instância tem limite `DATABASE_POOL_MAX` (padrão 5); PgBouncer e réplicas de leitura precisam ser configurados no ambiente de banco/deploy. |
| Cache Redis para catálogo/produtos | Parcial | O catálogo do consumidor tem cache com invalidação; outras leituras e métricas de hit/miss ainda faltam. |
| Paginação cursor-based | Pendente | Listas existentes precisam de revisão e alteração compatível com os clientes. |
| Compressão gzip/brotli e ETags | Parcial | Express mantém ETags padrão; compressão ainda não está habilitada. |
| API versioning `/api/v1` | Pendente | As rotas atuais mantêm seus caminhos legados; falta introduzir versão e política de depreciação. |
| Logs JSON e requestId | Implementado | Logger estruturado com contexto escalar allowlisted e correlação HTTP. |
| Métricas Prometheus, tracing e Sentry | Pendente | Requer implementação e, para exportação/tracing, configuração de destinos/credenciais. |
| Health/readiness | Implementado | `/health` e `/ready` verificam PostgreSQL e Redis. |
| CI/CD de deploy, smoke, secret scanning, backup PITR e feature flags | Pendente/parcial | CI local só verifica build, testes/cobertura e `npm audit`; deploy, Gitleaks/TruffleHog, backups e provider de feature flags exigem configuração adicional. |
| Pact, E2E/testcontainers, mutation e load testing | Pendente | Ainda não existem suites de contrato, E2E, mutation ou k6. |
| Audit trail imutável, rate limit adaptativo e detecção de abuso | Pendente | Exige modelo de auditoria, política de retenção e desenho de operação/alertas. |
| Rotação automática de segredos e penetration test | Dependente de operação externa | Política automatizada/terceiro não está disponível neste checkout. |
| OpenAPI completa | Parcial | Swagger existe, mas a cobertura de rotas, exemplos e contrato gerado precisa de revisão. |

## Dependências externas e decisão de produto

Gateway real, webhooks assinados e idempotentes, refunds/chargebacks, email transacional em fila, FCM, DNS DKIM/SPF/DMARC, PCI DSS e credenciais de fornecedores continuam fora do backend local disponível. O fluxo de pagamento de produção permanece bloqueado até existir integração real. Backup, rotação de `SECRET_KEY`, deploy e testes de penetração também precisam de acesso aos ambientes/fornecedores correspondentes.

## Validação local

- `npm run test:coverage -- --runInBand`: 21 suites e 64 testes aprovados; cobertura global abaixo da meta.
- `npm run build`: aprovado.
- `npx prisma validate`: schema Prisma válido após os índices.
- `git diff --check`: sem erros de whitespace; Git mostra apenas avisos de conversão LF/CRLF.
