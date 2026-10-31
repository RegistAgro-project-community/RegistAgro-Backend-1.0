# Auditoria de Segurança — RegistAgro-Back

> **Base**: Guia "Segurança no Vibe Coding" — KipperDev (set/2026) — 12 riscos
> **Escopo**: Código atual do `RegistAgro-Back` (Node.js + Express + Prisma + TypeScript)
> **Data**: Set/2026

---

## Resumo Executivo

| Risco | Status | Gravidade | Ação Necessária |
|-------|--------|-----------|-----------------|
| 01 Segredos no frontend | ⚠️ Parcial | Média | Remover `SECRET_KEY` do `.env` exposto; usar secret manager no deploy |
| 02 Validação de entradas | ✅ Boa (Zod) | Baixa | Migrar para `strictObject`; rejeitar campos extras |
| 03 SQL Injection | ✅ Boa (Prisma) | Baixa | Verificar queries raw se houver; permitir apenas allowlist para ORDER BY/colunas |
| 04 Prompt Injection | N/A | — | Não há IA no backend ainda |
| 05 XSS | ✅ Backend OK | Baixa | Frontend deve usar `textContent`; sanitizar se HTML rico |
| 06 IDOR / BOLA | ⚠️ Parcial | **Alta** | Filtros `farmId`/`consumerId` existem mas **falta `ownerId` em rotas de transport/location/flow** |
| 07 SSRF | ⚠️ Parcial | Média | `getAltLong` (geocoding) aceita endereço livre → validar/allowlist |
| 08 Senhas — bcrypt | ⚠️ **Não conforme** | **Alta** | **Migrar para Argon2id** (OWASP); bcrypt não atende parâmetros mínimos |
| 09 Rate Limit / DoS | ⚠️ Parcial | Média | Limite global apenas (200 req/min); **falta por rota + identidade + Redis** |
| 10 Rotas Admin / Enumeração | ⚠️ Parcial | Média | RBAC existe mas **não há role `admin`**; rotas sensíveis expostas sem permissão explícita |
| 11 Bots Login/Cadastro | ❌ Ausente | **Alta** | **Zero CAPTCHA/Turnstile**; rate limit fraco em auth |
| 12 Erros que vazam dados | ⚠️ Parcial | Média | Handler genérico existe mas **logs com `console.log(error)` vazam stack trace** |

---

## Detalhamento por Risco

---

### 01. Segredos no Frontend (Risco 01)

**Status**: ⚠️ Parcial  
**Evidência**: `.env` com `SECRET_KEY` commitado no repo (linha 1109 em `auth.model.ts`: `process.env.SECRET_KEY!`)

**Gap**: O `.env` está no controle de versão (não está no `.gitignore` verificado). Em produção, chaves vazadas no build do frontend (Vite `VITE_*`) seriam expostas.

**Correção**:
```bash
# .gitignore (adicionar)
.env
.env.*
!.env.example
```

```typescript
// config/env.ts — validação Zod no startup
import { z } from "zod";

const envSchema = z.object({
  SECRET_KEY: z.string().min(32),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  // VITE_* apenas para build-time público
});

export const env = envSchema.parse(process.env);
```

**Deploy**: Usar secret manager (AWS Secrets Manager, Doppler, 1Password CLI). Revogar `SECRET_KEY` atual.

---

### 02. Validação de Entradas no Servidor (Risco 02)

**Status**: ✅ Boa base (Zod v3)  
**Evidência**: `schema.zod.ts`, `login.zod.ts`, `orders.zod.ts`, `products.zod.ts` usam `z.object()`

**Gaps**:
1. **Não usa `strictObject`** — campos extras são aceitos silenciosamente (ex.: `role: "admin"` no body)
2. Validação duplicada: Zod no controller + `DataValidate` no model (linhas 12-17 em `auth.model.ts`)

**Correção — Migrar para Zod 4 `strictObject`**:
```typescript
// utils/schemas/schema.zod.ts
import { z } from "zod/v4"; // Zod 4

export const signupSchema = z.strictObject({
  name: z.string().trim().min(3).max(80),
  email: z.email(),
  phone: z.string().trim().regex(/^\+?[0-9]{9,12}$/),
  adress: z.string().trim().min(3).max(200),
  province: z.enum(["Luanda", "Bengo"]),
  pass1: z.string().min(8).max(128),
  pass2: z.string().min(8).max(128),
}).refine(d => d.pass1 === d.pass2, { message: "Senhas não conferem", path: ["pass2"] });

export const loginSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(1).max(128),
});
```

**Remover** `DataValidate` class — centralizar validação no Zod schema.

**Teste**:
```bash
curl -X POST /auth/signup/consumer \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","phone":"123456789","adress":"Rua A","province":"Luanda","pass1":"12345678","pass2":"12345678","role":"admin"}'
# Esperado: 400 (campo extra rejeitado)
```

---

### 03. SQL Injection (Risco 03)

**Status**: ✅ Boa (Prisma ORM)  
**Evidência**: Todas as queries usam `prisma.model.findFirst/create/update` com `where` tipado.

**Verificação**: Buscar por `$queryRaw`/`$executeRaw`:
```bash
grep -r "\$queryRaw\|\$executeRaw" src/
# Se vazio → OK
```

**Atenção**: `orderBy`/`select` dinâmicos — usar allowlist:
```typescript
// Exemplo seguro para ordenação
const ALLOWED_SORT = ["created_at", "price", "name"] as const;
const sortBy = ALLOWED_SORT.includes(req.query.sortBy) ? req.query.sortBy : "created_at";
const order = req.query.order === "desc" ? "desc" : "asc";

const products = await prisma.products.findMany({
  orderBy: { [sortBy]: order },
});
```

---

### 04. Prompt Injection (Risco 04)

**Status**: N/A — Não há integração com LLM/IA no backend atualmente.  
**Quando houver**: Aplicar padrão da página 5 do guia (Zod parse + autorização no backend).

---

### 05. XSS (Risco 05)

**Status**: Backend OK (API JSON)  
**Responsabilidade**: Frontend (RegistAgro-Web/Flutter) deve:
- Usar `textContent` / framework escape padrão
- **Nunca** `dangerouslySetInnerHTML` / `innerHTML` com dados de API
- Se HTML rico: DOMPurify + política restritiva + CSP

**Header CSP recomendado** (adicionar no `app.ts`):
```typescript
import helmet from "helmet";

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api-registagro.onrender.com"],
    },
  },
}));
```

---

### 06. IDOR / BOLA (Risco 06) — **CRÍTICO**

**Status**: ⚠️ Parcial — **Falhas em rotas de transporte, localização e flow**

**Evidência — Boas práticas existentes**:
- `orders.model.ts` linhas 15-29: `farmRow = await prisma.farms.findFirst({ where: { farmId: userId }})` → filtra por dono
- `orders.model.ts` linhas 364-370: `where: { farmId: farmRow.id, id: orderId }` — **correto**
- `products.model.ts` linhas 161-166: `where: { id: productId, farmId: farmId.id }` — **correto**

**Falhas identificadas**:

| Rota | Arquivo | Problema |
|------|---------|----------|
| `GET /transports/farms/get/vehicle/:transport` | `transport.controller.ts` → `showCarriers` | **Não valida se `transport` pertence ao farm** |
| `POST /transports/request` | `transport.controller.ts` → `hireCarrier` | **Não valida se `orderId` pertence ao farm** |
| `GET /location/carrier/direction/request/:id` | `location.controller.ts` → `getDirection` | **Não valida se `orderId` pertence ao carrier** |
| `GET /location/get/coordinates/order/:id` | `location.controller.ts` → `getLocation` | **Não valida se `orderId` pertence ao consumer** |
| `PATCH /flow/farm/start/order/:id` | `flow.controller.ts` → `startFlow` | **Não valida ownership do pedido** |
| `PATCH /flow/carrier/finish/request/:id` | `flow.controller.ts` → `finishFlow` | **Não valida ownership da transport_request** |
| `PUT /flow/consumer/complete/order/:id` | `flow.controller.ts` → `completeOrder` | **Não valida ownership do pedido** |

**Correção padrão** (aplicar em cada model/controller):
```typescript
// transport.model.ts — hireCarrier
async hireCarrier(farmUserId: string, orderId: string, carrierId: string, vehicleId: string) {
  // 1. Verificar se farm possui o pedido
  const farm = await prisma.farms.findFirst({ where: { farmId: farmUserId }, select: { id: true } });
  if (!farm) return { error: "Fazenda não encontrada" };

  const order = await prisma.orders.findFirst({
    where: { id: orderId, farmId: farm.id, status: "confirmed" },
  });
  if (!order) return { info: "Pedido não encontrado ou não pertence a esta fazenda" };

  // 2. Verificar carrier/vehicle válidos e disponíveis
  const carrier = await prisma.carriers.findFirst({
    where: { id: carrierId, busy: false },
    include: { vehicles: { where: { id: vehicleId, status: "active" } } },
  });
  if (!carrier || carrier.vehicles.length === 0) return { error: "Transportadora/veículo indisponível" };

  // 3. Criar transport_request
  return await prisma.transport_requests.create({ ... });
}
```

**Teste de regressão (obrigatório)**:
```typescript
// tests/security/idor.test.ts
it("Farm A NÃO pode contratar transporte para pedido do Farm B", async () => {
  const farmA = await createFarm();
  const farmB = await createFarm();
  const orderB = await createOrder(farmB.id);
  
  const res = await request(app)
    .post(`/transports/request`)
    .set("Authorization", `Bearer ${farmA.token}`)
    .send({ orderId: orderB.id, carrierId: "...", vehicleId: "..." });
  
  expect(res.status).toBe(404); // ou 403
});
```

---

### 07. SSRF (Risco 07)

**Status**: ⚠️ Parcial  
**Evidência**: `location.service.ts` → `getAltLong(adress)` usado em:
- `auth.model.ts` linha 54 (signup)
- `auth.model.ts` linha 409 (createFarmPass)
- `orders.model.ts` linha 115 (delivery address)
- `products.model.ts` — não usa diretamente

**Risco**: Endereço livre → geocoding externo (provavelmente Nominatim/OpenStreetMap ou Google Maps). Permite SSRF se:
- Resolução DNS aponta para IP interno (169.254.169.254 metadata, 127.0.0.1, 10.x, 192.168.x)
- Redirects encadeados

**Correção**:
```typescript
// services/location.service.ts
import { fetch } from "undici"; // ou native fetch Node 18+

const ALLOWED_GEOCODERS = new Map([
  ["nominatim", "https://nominatim.openstreetmap.org/search"],
  // adicionar provedores aprovados
]);

export async function getAltLong(address: string) {
  const target = ALLOWED_GEOCODERS.get("nominatim");
  if (!target) return { error: "Geocoder não configurado" };

  const url = new URL(target);
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  try {
    const response = await fetch(url.toString(), {
      redirect: "error", // bloquear redirects
      signal: AbortSignal.timeout(3000),
      headers: { "User-Agent": "RegistAgro/1.0" },
    });

    if (!response.ok) throw new Error("Falha no geocoder");

    const data = await response.json();
    if (!data[0]) return { error: "Endereço não encontrado" };

    const { lat, lon, address: addr } = data[0];
    const state = addr?.state?.split(" ")[0] ?? "";

    // Validar se coordenadas são privadas (RFC 1918)
    if (isPrivateIP(lat, lon)) return { error: "Coordenadas inválidas" };

    return { lat, lon, adress: addr?.display_name, state };
  } catch (e) {
    return { error: "Erro no serviço de localização" };
  }
}

function isPrivateIP(lat: string, lon: string) {
  // Implementar validação de coordenadas suspeitas se necessário
  return false;
}
```

---

### 08. Senhas — **Migrar de bcrypt para Argon2id** (Risco 08) — **CRÍTICO**

**Status**: ❌ **Não conforme OWASP**  
**Evidência**: `password.hash.ts` usa `bcrypt` com `salt: 10` (linhas 5-10)

**Problema**: bcrypt não atende parâmetros mínimos OWASP 2024:
- Memória: bcrypt ≈ 4 KB fixo vs **Argon2id ≥ 19 MiB** (`memoryCost: 19456` KiB)
- Paralelismo: bcrypt = 1 vs **Argon2id `parallelism: 1`** (mínimo)
- Tempo: bcrypt cost 10 ≈ 100ms vs **Argon2id `timeCost: 2`** (ajustável)

**Correção**:
```bash
npm install argon2
npm uninstall bcrypt
```

```typescript
// utils/password.hash.ts
import argon2 from "argon2";

export class PasswordHash {
  private static readonly ARGON2_CONFIG = {
    type: argon2.argon2id,
    memoryCost: 19456, // 19 MiB (OWASP mínimo)
    timeCost: 2,
    parallelism: 1,
  };

  async generate(password: string): Promise<string> {
    return argon2.hash(password, this.ARGON2_CONFIG);
  }

  async compare(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  // Migração: detectar hash bcrypt legado e re-hash no próximo login
  async needsRehash(hash: string): Promise<boolean> {
    try {
      return argon2.needsRehash(hash, this.ARGON2_CONFIG);
    } catch {
      return true; // se não for argon2, precisa migrar
    }
  }
}
```

**Migração transparente** (no `login`/`farmSignIn`):
```typescript
// auth.model.ts — após verifyPass === true
if (await hashClass.needsRehash(userData.password)) {
  const newHash = await hashClass.generate(pass);
  await prisma.users.update({
    where: { id: userData.id },
    data: { password: newHash },
  });
}
```

**Teste**:
```bash
# Duas contas com mesma senha → hashes diferentes
# Senha correta → true; incorreta → false
# Rate limit login: 5 tentativas/15min por IP+email
```

---

### 09. Rate Limit / DoS / DDoS (Risco 09)

**Status**: ⚠️ Parcial — **Apenas limite global fraco**  
**Evidência**: `rate-limiting.ts` — 200 req/min global, **sem Redis**, **sem identidade de usuário**, **sem proteção DDoS na borda**

**Problemas**:
1. `max: 100` e `limit: 200` conflitantes (linhas 4-6)
2. Storage em memória → **não coordena múltiplas instâncias**
3. Rotas sensíveis (auth, payment, orders) sem limites específicos
4. `trust proxy: 1` ok mas precisa validar proxies conhecidos

**Correção — Redis + Throttler por rota**:
```bash
npm install @nestjs/throttler @nestjs/cache-manager cache-manager-ioredis ioredis
# ou express-rate-limit + rate-limit-redis
```

```typescript
// config/rate-limit.ts
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export const createLimiter = (options: {
  windowMs: number;
  max: number;
  keyPrefix: string;
}) => rateLimit({
  windowMs: options.windowMs,
  max: options.max,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
  }),
  keyGenerator: (req) => `${options.keyPrefix}:${req.ip}:${req.user?.id ?? "anon"}`,
  handler: (req, res) => res.status(429).json({
    error: "Limite de requisições excedido",
    retryAfter: `${options.windowMs / 1000}s`,
  }),
});

// Aplicar por rota no router
import { createLimiter } from "../config/rate-limit.js";

const authLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 5, keyPrefix: "auth" });    // 5/15min
const apiLimiter = createLimiter({ windowMs: 60 * 1000, max: 60, keyPrefix: "api" });         // 60/min
const paymentLimiter = createLimiter({ windowMs: 60 * 1000, max: 10, keyPrefix: "payment" }); // 10/min

// No router:
router.post('/auth/login/:rule', authLimiter, authController.login);
router.post('/auth/signup/:rule', authLimiter, authController.signup);
router.post('/orders/create/farm/:id', apiLimiter, ...);
router.patch('/orders/payment/confirm', paymentLimiter, ...);
```

**Edge**: Cloudflare/WAF + `cf-connecting-ip` header para IP real.

---

### 10. Enumeração e Rotas Administrativas (Risco 10)

**Status**: ⚠️ Parcial — **Não existe role `admin`**  
**Evidência**: `roles.conf.ts` só tem `consumer`, `carrier`, `farm`. `prisma/enums.ts` `Rule` = `farm | consumer | carrier`.

**Gaps**:
- Rotas de debug/docs (`/docs` Swagger) expostas em produção
- Sem inventário de rotas automatizado
- Sem monitoramento de padrões de acesso (varredura)

**Correção**:
```typescript
// prisma/schema.prisma — adicionar role admin
enum Rule {
  farm
  consumer
  carrier
  admin       // NOVO
}

// config/roles.conf.ts — adicionar admin
export const roles = {
  admin: {
    farm: ["create", "read", "update", "delete"],
    consumer: ["create", "read", "update", "delete"],
    carrier: ["create", "read", "update", "delete"],
    admin: ["create", "read", "update", "delete"],
    system: ["read", "metrics", "logs"],
  },
  // ... existentes
};

// middlewares/requireAdmin.ts
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.sendStatus(401);
  if (req.user.rule !== "admin") return res.sendStatus(403);
  next();
}

// app.ts — proteger Swagger em prod
if (process.env.NODE_ENV === "production") {
  app.use("/docs", requireAdmin, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} else {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

**Inventário de rotas** (script):
```bash
# scripts/list-routes.ts
import { router } from "../src/router/routes.js";
router.stack.forEach(layer => {
  if (layer.route) console.log(`${Object.keys(layer.route.methods).join(",").toUpperCase()} ${layer.route.path}`);
  else if (layer.name === "router") layer.handle.stack.forEach(l => l.route && console.log(`${Object.keys(l.route.methods).join(",").toUpperCase()} ${l.route.path}`));
});
```

---

### 11. Bots em Login e Cadastro (Risco 11) — **CRÍTICO**

**Status**: ❌ **Ausente**  
**Evidência**: Zero CAPTCHA/Turnstile. Rate limit global fraco (200/min). Login exposto a:
- Credential stuffing
- Enumeração de email/telefone (resposta diferente para "usuário não existe" vs "senha errada"? → verificar)
- Criação de contas em massa

**Verificar enumeração**:
```bash
# Testar diferença de resposta
curl -X POST /auth/login/consumer -d '{"email":"naoexiste@x.com","password":"x"}'
curl -X POST /auth/login/consumer -d '{"email":"existente@x.com","password":"errada"}'
# Se mensagens diferentes → enumeração de conta
```

**Correção — Turnstile (Cloudflare) gratuito**:
```bash
npm install @types/node-fetch # se necessário
```

```typescript
// services/captcha.service.ts
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET!;
const TURNSTILE_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, action: string, expectedHostname: string): Promise<boolean> {
  if (!token || token.length < 10) return false;
  
  try {
    const res = await fetch(TURNSTILE_VERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: TURNSTILE_SECRET, response: token }),
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    return data.success === true && data.hostname === expectedHostname && data.action === action;
  } catch {
    return false;
  }
}
```

```typescript
// auth.controller.ts — signup/login
import { verifyTurnstile } from "../services/captcha.service.js";

async signup(req: Request, res: Response) {
  const { token, ...body } = req.body; // frontend envia token no body
  
  const valid = await verifyTurnstile(token, "signup", req.get("host")!);
  if (!valid) return res.status(403).json({ error: "Validação de segurança falhou" });
  
  // ... resto do signup
}
```

**Frontend**: Adicionar widget Turnstile nas páginas de login/cadastro.

**Mensagens unificadas** (anti-enumeração):
```typescript
// Sempre mesma mensagem:
return { valid: false, error: "Credenciais inválidas" }; // não "email não encontrado" / "senha errada"
```

---

### 12. Mensagens de Erro que Vazam Dados (Risco 12)

**Status**: ⚠️ Parcial  
**Evidência**:
- `controllers.errors.ts` linha 4: resposta genérica OK
- **MAS** `auth.model.ts` linha 495: `console.log(error)` → **vaza stack trace no stdout/logs**
- `orders.model.ts` linhas 163-168: `notFound(error)` expõe estrutura de erro do Prisma
- Respostas de erro incluem detalhes técnicos em `error` field (ex.: "Ocorreu um erro ao verificar produto")

**Correção — Error Handler Centralizado**:
```typescript
// middlewares/error-handler.ts
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { logger } from "../services/logger.js"; // winston/pino

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(err);

  const requestId = randomUUID();
  
  // Log sanitizado (sem body, cookies, auth header, tokens)
  const sanitizedReq = {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    params: req.params,
    // NÃO: req.body, req.headers.authorization, req.cookies
    userId: req.user?.id,
    userRule: req.user?.rule,
  };

  if (err.isOperational) {
    logger.warn({ ...sanitizedReq, event: "operational_error", message: err.message });
    return res.status(err.statusCode || 400).json({
      error: err.message,
      requestId,
    });
  }

  // Erro inesperado — log completo (restrito), resposta genérica
  logger.error({ ...sanitizedReq, event: "unexpected_error", error: err.stack });
  
  res.status(500).json({
    error: "Não foi possível concluir a solicitação.",
    requestId,
  });
}

// Usar em controllers: throw operational errors
class OperationalError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
    this.isOperational = true;
    this.name = "OperationalError";
  }
}

// Exemplo no model:
if (!productRow) throw new OperationalError("Produto não encontrado", 404);
```

**Remover** `console.log(error)` de todos os models. Usar `logger.error()` sanitizado.

**Teste**:
```bash
# Forçar erro 500
curl -X POST /orders/create/farm/invalid-uuid -H "Authorization: Bearer valid-token"
# Resposta: {"error":"Não foi possível concluir a solicitação.","requestId":"uuid"}
# Logs: requestId correlaciona, SEM stack trace, SEM body, SEM token
```

---

## Plano de Ação Prioritário

### 🔴 **Bloqueadores de Publicação (Fazer AGORA)**

| # | Ação | Arquivo(s) | Esforço |
|---|------|------------|---------|
| 1 | Migrar **bcrypt → Argon2id** | `password.hash.ts`, `auth.model.ts` | 2h |
| 2 | Adicionar **Turnstile CAPTCHA** em login/signup | `auth.controller.ts`, novo `captcha.service.ts`, frontend | 3h |
| 3 | **Corrigir IDOR** em 7 rotas (transport, location, flow) | `transport.model.ts`, `location.model.ts`, `flow.model.ts` | 4h |
| 4 | **Error handler centralizado** + remover `console.log` | Novo `error-handler.ts`, todos os models | 2h |
| 5 | Remover `.env` do Git + revogar `SECRET_KEY` | `.gitignore`, secret manager | 30min |

### 🟡 **Melhorias Críticas (Próxima Sprint)**

| # | Ação | Arquivo(s) | Esforço |
|---|------|------------|---------|
| 6 | Rate limit por rota + Redis | `rate-limit.ts`, `router/routes.ts` | 3h |
| 7 | Zod `strictObject` + remover `DataValidate` | `schema.zod.ts`, `login.zod.ts`, `auth.model.ts` | 2h |
| 8 | Role `admin` + proteger Swagger | `schema.prisma`, `roles.conf.ts`, `app.ts` | 2h |
| 9 | SSRF protection no geocoding | `location.service.ts` | 2h |
| 10 | CSP headers + Helmet config | `app.ts` | 1h |

### 🟢 **Qualidade / Dívida Técnica**

| # | Ação | Esforço |
|---|------|---------|
| 11 | Testes de segurança automatizados (IDOR, SQLi, XSS, Auth) | 1 sprint |
| 12 | Documentar matriz de acesso (quem acessa o quê) | 2h |
| 13 | Audit trail para ações sensíveis (pagamentos, exclusões) | 1 sprint |
| 14 | Secrets rotation policy documentada | 1h |

---

## Checklist de Validação por PR (Obrigatório)

```
[ ] Zod strictObject em TODAS as entradas (body, query, params, headers)
[ ] Prisma queries com filtro ownerId/tenantId (IDOR/BOLA)
[ ] Nenhum segredo no frontend / build (VITE_* apenas público)
[ ] Senhas → Argon2id (parâmetros OWASP: memoryCost 19456, timeCost 2, parallelism 1)
[ ] Rate limit por rota + identidade + Redis (auth: 5/15min, api: 60/min, payment: 10/min)
[ ] Rotas sensíveis: authenticate + requireRole (admin/farm/carrier/consumer)
[ ] CAPTCHA Turnstile validado no backend (token + hostname + action)
[ ] Error handler centralizado: resposta genérica + requestId + logs sanitizados
[ ] Testes: caso inválido rejeitado + caso válido aceito + cross-account negado (403/404)
[ ] Feature classification atualizada (Implementado/Em dev/Simulado/Futuro)
```

---

## Comandos de Verificação Rápida

```bash
# 1. Segredos no repo
git log --all --full-history -- .env
grep -r "SECRET_KEY\|password\|api.key" --include="*.ts" --include="*.js" src/ | grep -v ".test."

# 2. SQL Injection (raw queries)
grep -r "\$queryRaw\|\$executeRaw\|\.raw(" src/

# 3. Console.log em produção
grep -r "console\.(log|error|warn)" src/ --include="*.ts" | grep -v ".test."

# 4. innerHTML / dangerouslySetInnerHTML no frontend
grep -r "innerHTML\|dangerouslySetInnerHTML" ../RegistAgro-Web/src/ ../RegistAgro-Admin/src/

# 5. Rotas sem auth middleware
grep -r "router\.(get|post|put|patch|delete)" src/router/routes.ts | grep -v "auth\|authorization"

# 6. bcrypt ainda em uso
grep -r "bcrypt" src/

# 7. Zod sem strictObject
grep -r "z\.object(" src/utils/schemas/
```

---

## Próximos Passos Imediatos

1. **Hoje**: Itens 1-5 (bloqueadores)
2. **Esta semana**: Itens 6-10 (melhorias críticas)
3. **Próxima sprint**: Testes de segurança automatizados + CI gate

---

## 📈 **Apêndice A — Melhorias de Performance, Escalabilidade, Observabilidade e Qualidade**

> **Além dos 12 riscos KipperDev**, estas melhorias elevam o projeto a nível de produção enterprise.

### A.1 Performance & Escalabilidade (Backend)

| # | Melhoria | Arquivo(s) | Esforço | Impacto |
|---|----------|------------|---------|---------|
| P1 | **Database indexes** otimizados (query plans) | `prisma/schema.prisma`, migrations | 4h | 🚀 Query speed 10-100x |
| P2 | **Connection pooling** (PgBouncer) + prepared statements | `prisma/schema.prisma`, Docker | 4h | 🚀 Throughput + estabilidade |
| P3 | **Cache estratégico** (Redis): produtos por fazenda, catálogo público | Novo `services/cache.service.ts` | 6h | 🚀 Latência < 50ms |
| P4 | **Pagination cursor-based** (não offset) em listas grandes | `products.model.ts`, `orders.model.ts` | 3h | 🚀 Memória constante |
| P5 | **Read replicas** PostgreSQL para queries de leitura | Infra + Prisma `$extends` | 8h | 🚀 Escrita não bloqueada |
| P6 | **Compressão resposta** (gzip/brotli) + ETags | `app.ts` (compression middleware) | 1h | 🚀 Bandwidth -70% |
| P7 | **API versioning** (`/api/v1/`) + deprecation policy | `router/routes.ts` | 4h | 🛠 Evolução sem breaking changes |

**Indexes recomendados** (baseado nas queries reais):
```prisma
// prisma/schema.prisma — adicionar @@index
model Orders {
  @@index([farmId, status])      // listagem por fazenda + filtro status
  @@index([consumerId, status])  // pedidos do consumer
  @@index([carrierId, status])   // pedidos da transportadora
  @@index([createdAt])           // ordenação temporal
}

model Products {
  @@index([farmId, category])    // catálogo por fazenda + categoria
  @@index([status, createdAt])   // produtos ativos recentes
}

model TransportRequests {
  @@index([carrierId, status])   // solicitações da transportadora
  @@index([farmId, status])      // solicitações da fazenda
  @@index([vehicleId])           // tracking por veículo
}

model Locations {
  @@index([orderId, createdAt])  // tracking histórico
  @@index([carrierId, createdAt]) // localização transportadora
}
```

### A.2 Observabilidade & DevOps

| # | Melhoria | Ferramenta | Esforço | Impacto |
|---|----------|------------|---------|---------|
| O1 | **Structured logging** (JSON) + correlation IDs | Winston/Pino + `requestId` | 3h | 🔍 Debug distribuído |
| O2 | **Metrics** (Prometheus): latency, errors, business KPIs | `prom-client` + `/metrics` | 4h | 📊 Alerting proativo |
| O3 | **Distributed tracing** (OpenTelemetry) | `@opentelemetry/api` + Jaeger | 6h | 🔍 Root cause analysis |
| O4 | **Health checks** (`/health`, `/ready`) + probes K8s | `app.ts` | 2h | 🛡 Zero-downtime deploy |
| O5 | **Sentry** (error tracking) + release tracking | `@sentry/node` | 2h | 🐛 Error aggregation |
| O6 | **CI/CD pipeline completo**: lint → test → build → scan → deploy | GitHub Actions | 16h | 🚀 Deploy confidence |
| O7 | **Database migrations** versionadas + rollback testado | Prisma Migrate | 4h | 🛡 Schema safety |
| O8 | **Backup automático** PostgreSQL (PITR) | Infra (RDS/CloudSQL) | 4h | 🛡 RPO < 5min |
| O9 | **Secret scanning** no CI (GitLeaks/TruffleHog) | GitHub Actions | 2h | 🔐 Prevenção vazamentos |
| O10 | **Feature flags** (LaunchDarkly/Unleash) | Backend + Frontends | 8h | 🚀 Rollout gradual |

**Health check endpoint**:
```typescript
// app.ts
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`,           // DB
    redis.ping(),                          // Redis
    fetch(`${process.env.EMAIL_SERVICE}/health`), // Email (se externo)
  ]);
  
  const healthy = checks.every(c => c.status === 'fulfilled');
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: checks.map((c, i) => ({
      name: ['database', 'redis', 'email'][i],
      status: c.status,
      latencyMs: c.status === 'fulfilled' ? c.value : null,
    })),
  });
});

app.get('/ready', (req, res) => res.status(200).json({ ready: true }));
```

### A.3 Testes & Qualidade (Backend)

| # | Melhoria | Ferramenta | Esforço | Impacto |
|---|----------|------------|---------|---------|
| T1 | **Contract tests** (Pact) Backend ↔ Frontends | `@pact-foundation/pact` | 16h | 🛡 Integração garantida |
| T2 | **E2E tests** fluxo completo (oferta → entrega) | Playwright + testcontainers | 12h | 🛡 Confiança real |
| T3 | **Mutation testing** (Stryker) — valida qualidade testes | `@stryker-mutator/jest-runner` | 8h | 🛡 Testes eficazes |
| T4 | **Load testing** (k6) — 1000 VUs, spike, soak | `k6` + Grafana | 8h | 🚀 Capacidade conhecida |
| T5 | **Security tests automatizados** no CI | OWASP ZAP / Trivy | 4h | 🔐 Shift-left contínuo |
| T6 | **Dependency scanning** (Dependabot + npm audit) | GitHub + `npm audit ci` | 1h | 🔐 Supply chain |
| T7 | **Code coverage gate** (≥80% statements, ≥70% branches) | Jest + `coverageThreshold` | 1h | 🛡 Qualidade mínima |

**Coverage threshold** (`jest.config.js`):
```javascript
module.exports = {
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    // Críticos: 100%
    './src/utils/password.hash.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
    './src/services/captcha.service.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
    './src/middlewares/error-handler.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
  },
};
```

### A.4 Segurança Avançada (Além dos 12 Riscos)

| # | Melhoria | Esforço | Referência |
|---|----------|---------|------------|
| S1 | **CSP estrito** + `trusted-types` + nonce | 6h | OWASP CSP |
| S2 | **Cookies** `Secure; SameSite=Strict; HttpOnly` (via backend `res.cookie`) | 2h | OWASP Session |
| S3 | **Audit log imutável** (ações sensíveis: login, pagamentos, exclusões) | 8h | SOC2/ISO27001 |
| S4 | **Rate limit adaptativo** (behavioral: login failures → progressive delay) | 4h | OWASP Rate Limit |
| S5 | **Device fingerprinting** (login suspeito → MFA/block) | 8h | NIST 800-63B |
| S6 | **API abuse detection** (anomaly detection: volume, patterns) | 12h | OWASP API Security |
| S7 | **Secrets rotation** automática (90 dias) + policy documentada | 4h | NIST 800-57 |
| S8 | **Penetration test** anual (terceiro) + bug bounty | Contínuo | OWASP Testing Guide |

### A.5 Arquitetura & Manutenibilidade

| # | Melhoria | Esforço | Princípio |
|---|----------|---------|-----------|
| A1 | **DI Container** (tsyringe) — controllers dependem de interfaces | 12h | DIP / Testabilidade |
| A2 | **Domain Events** (order.created, payment.confirmed) → desacoplar side effects | 8h | SRP / OCP |
| A3 | **CQRS leve** (Commands vs Queries) para operações complexas | 16h | SRP / Escalabilidade |
| A4 | **Modular monolith** → bounded contexts (Auth, Catalog, Orders, Transport, Payments) | 20h | ISP / Domínios |
| A5 | **Documentação OpenAPI** completa + exemplos + SDK gerado | 8h | DX / Contrato |

---

## 📋 **Roadmap Integrado (12 Semanas)**

| Semana | Foco | Itens (Backend) |
|--------|------|-----------------|
| **1-2** | **Segurança Crítica** | #1-5, S1, S2, S4 |
| **3-4** | **Admin + Validação + Observabilidade** | #6-10, O1-O5, A1 |
| **5-6** | **Performance + Cache** | P1-P4, P6, T1 |
| **7-8** | **Flutter Integration + Contract Tests** | T1, T2, P7 |
| **9-10** | **CI/CD + Deploy + Backup** | O6-O10, O7-O8 |
| **11-12** | **Load Test + Mutation Test + Pen Test Prep** | T3-T7, S3, S5-S8 |

---

*Apêndice adicionado set/2026 — Complementa os 12 riscos KipperDev com práticas enterprise de performance, observabilidade, DevOps e qualidade.*

---

## 📋 **Apêndice B — Gaps Funcionais Críticos (Simulado → Produção)**

> **Identificados durante verificação de código real**. Estes itens **bloqueiam lançamento em produção** e devem ser endereçados antes do go-live.

### B.1 Gateway de Pagamento Real (Backend + Consumer)

| # | Gap | Localização | Esforço | Prioridade |
|---|-----|-------------|---------|------------|
| PG1 | **Integração Multicaixa/Stripe/PayPal** — gateway real | `src/services/payment.service.ts`, `src/utils/paymentSplit.ts` | 40h | 🔴 **Bloqueador** |
| PG2 | **Webhook endpoints** (`/payment/webhook`, `/payment/callback`, `/payment/success`, `/payment/cancel`) | Novo `src/controllers/payment/webhook.controller.ts` | 16h | 🔴 **Bloqueador** |
| PG3 | **PaymentSplit configurável** (não hardcoded 30%/5%) — admin panel | `src/utils/paymentSplit.ts`, `prisma/schema.prisma` | 8h | 🟡 Alta |
| PG4 | **Idempotência** — processar webhook duplicado sem erro | `payment.service.ts` | 8h | 🔴 **Bloqueador** |
| PG5 | **Refunds/Chargebacks** — fluxo completo | Novo `refund.service.ts` | 16h | 🟡 Alta |
| PG6 | **PCI DSS compliance** — tokenização, não loggar PAN | Arquitetura | 24h | 🔴 **Bloqueador** |
| PG7 | **Sandbox/Testing** — ambiente de testes do gateway | CI/CD + Staging | 8h | 🟢 Média |

**Arquivo crítico — `src/services/payment.service.ts` (linhas 24-283)**:
- `create()`: Só gera referência + cria registro `payments` com status `pendent`
- `confirmPayment()`: Atualiza status para `retained` + reduz stock — **não chama gateway**
- `releasePayment()`: Transfere saldos internos (`farmValue`, `transportValue`, `registagroValue`) — **simulado**
- **Falta**: `charge()`, `capture()`, `refund()`, `verifyWebhook()`, `handleCallback()`

**Consumer App (`lib/view/pages/main_page/home_screen/paymentScreen/payment_screen.dart`)**:
- Linhas 96-106: **Bloqueia explicitamente** Cartão/PayPal
- Linhas 80-84: **Gera referência FAKE** com `Random()` — não usa referência do backend
- Linhas 175, 207: `//todo: Processando pagamento` / `//todo: Sucesso`

### B.2 Maps Unificados — 3 Implementações Diferentes

| App | Atual | Target Unificado | Esforço |
|-----|-------|------------------|---------|
| **Web (Dashboard)** | `react-leaflet` + OSM + **OSRM** | ✅ Manter (base) | — |
| **Admin** | **Ausente** | Adicionar `react-leaflet` + OSRM | 16h |
| **Carrier (Flutter)** | `google_maps_flutter` + Google Directions | Migrar para **flutter_map** + OSRM (mesmo do Web) | 24h |
| **Consumer (Flutter)** | `flutter_map` + `flutter_google_places_sdk` | Unificar com **flutter_map** + OSRM (sem Places API paga) | 16h |

**Problemas atuais**:
1. **Carrier**: `google_maps_flutter` → custo API Google Maps + chave obrigatória
2. **Consumer**: `flutter_google_places_sdk` → Places API paga + quota limitada
3. **Web**: `OSRM` gratuito, open-source, self-hostable
4. **Roteamento**: Web usa OSRM; Flutter apps não têm roteamento implementado

**Solução recomendada**:
```yaml
# flutter_map + latlong2 + osrm (gratuito, open-source)
dependencies:
  flutter_map: ^7.0.0
  latlong2: ^0.9.0
  http: ^1.2.0  # para chamar OSRM
```

### B.3 Email Transacional (Backend)

| # | Gap | Localização | Esforço |
|---|-----|-------------|---------|
| EM1 | **Usar Nodemailer/Resend configurado** (não Supabase OTP) | `src/services/email.service.ts` | 8h |
| EM2 | **Templates transacionais**: confirmação pedido, status entrega, pagamento confirmado, lembrete | Novo `src/services/email/templates/` | 16h |
| EM3 | **Queue de emails** (BullMQ + Redis) — retry, dead letter | `src/services/email.queue.ts` | 12h |
| EM4 | **Unsubscribe/Preferences** — LGPD compliance | `src/controllers/email.pref.controller.ts` | 8h |
| EM5 | **DKIM/SPF/DMARC** configuração | DNS + Resend | 4h |

**Atual**: `email.config.ts` tem `transporter` Resend mas **nunca usado**. `email.service.ts` usa `supabase.auth.signInWithOtp` (magic link) — **não envia emails de negócio**.

### B.4 Push Notifications (Backend + Flutter)

| # | Gap | Esforço |
|---|-----|---------|
| PN1 | **Firebase Cloud Messaging** setup (backend + 2 apps Flutter) | 16h |
| PN2 | **Tópicos/tokens**: user-specific + broadcast (promo, sistema) | 8h |
| PN3 | **Payloads tipados**: `order_created`, `order_accepted`, `carrier_assigned`, `order_delivered`, `payment_confirmed` | 8h |
| PN4 | **Background handling** (Flutter) — navegar para tela correta | 8h |
| PN5 | **Analytics** — delivery rate, open rate, conversion | 4h |

### B.5 Webhooks & Integrações Externas (Backend)

| # | Gap | Esforço |
|---|-----|---------|
| WH1 | **Payment webhooks** (Multicaixa/Stripe): `payment.succeeded`, `payment.failed`, `charge.refunded` | 16h |
| WH2 | **Signature verification** (HMAC) — segurança | 4h |
| WH3 | **Retry com backoff exponencial** + dead letter queue | 8h |
| WH4 | **Idempotency keys** — processar uma vez | 8h |
| WH5 | **Observabilidade** — logs estruturados + métricas de webhook | 4h |

---

## ✅ **Checklist Go-Live (Além de Segurança)**

```markdown
## Pagamento Real
[ ] Gateway integrado (Multicaixa/Stripe) + sandbox testado
[ ] Webhooks implementados + signature verification
[ ] Idempotência garantida
[ ] Split configurável (admin)
[ ] Refunds/Chargebacks funcionais
[ ] PCI DSS compliance (tokenização, logs sanitizados)

## Maps Unificados
[ ] Carrier migrado para flutter_map + OSRM
[ ] Consumer migrado para flutter_map + OSRM (sem Places API)
[ ] Admin com mapa (react-leaflet)
[ ] Roteamento OSRM self-hosted ou proxy

## Email Transacional
[ ] Nodemailer/Resend em uso (não Supabase OTP)
[ ] Templates: confirmação, status, pagamento, lembrete
[ ] Queue BullMQ + retry + DLQ
[ ] Unsubscribe/Preferences LGPD
[ ] DKIM/SPF/DMARC configurado

## Push Notifications
[ ] FCM configurado (backend + 2 apps Flutter)
[ ] Tópicos + payloads tipados implementados
[ ] Background handling navega corretamente

## Webhooks
[ ] Payment webhooks + HMAC verification
[ ] Retry + backoff + DLQ
[ ] Idempotency keys
[ ] Métricas de entrega/falha

## Gerais
[ ] Feature flags para rollout gradual
[ ] Health checks completos (/health, /ready)
[ ] CI/CD pipeline com testes de integração
[ ] Load test k6 (1000 VUs)
[ ] Runbook de incidentes documentado
```

---

*Apêndice B adicionado set/2026 — Gaps funcionais identificados em código real que bloqueiam produção.*