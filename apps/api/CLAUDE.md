# CLAUDE.md — apps/api (Backend)

> Arquitetura e padrões do workspace `@optsolv/api`.
> **Leia antes de qualquer trabalho no backend.**
> Para contexto do produto, leia também `../../CLAUDE.md`.

---

## 1. Identidade

- **Package**: `@optsolv/api`
- **Dev server**: `http://localhost:3333`
- **Swagger UI**: `http://localhost:3333/docs`
- **Entry point**: `src/server.ts` → `buildServer()`
- O backend usa `@optsolv/db` para acesso ao banco e `@optsolv/shared` para schemas e types.

---

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework HTTP | Fastify 5 |
| Linguagem | TypeScript strict (`any` proibido) |
| Autenticação | better-auth (Microsoft Entra ID + email/senha) |
| ORM | Drizzle ORM |
| Banco | PostgreSQL |
| Validação | Zod via `fastify-type-provider-zod` |
| Logs | pino (default do Fastify) |
| Testes | Vitest + supertest |
| Documentação | @fastify/swagger + @fastify/swagger-ui |
| Runner dev | tsx watch |

---

## 3. Estrutura de pastas

```
apps/api/src/
├── server.ts              # Bootstrap: buildServer() + listen
├── config/
│   └── env.ts             # Zod schema do .env — validado no boot
│
├── plugins/               # Plugins Fastify globais (registrados em server.ts)
│   ├── auth.ts            # better-auth integration
│   ├── db.ts              # Drizzle client como decorator do Fastify
│   ├── cors.ts
│   ├── helmet.ts
│   ├── rate-limit.ts
│   ├── error-handler.ts   # Trata AppError → HTTP response
│   └── swagger.ts
│
└── modules/               # Bounded contexts — um por domínio
    ├── health/
    │   └── health.routes.ts
    ├── dashboard/
    │   ├── dashboard.routes.ts
    │   └── dashboard.service.ts
    ├── projects/
    │   ├── project.routes.ts
    │   ├── project.controller.ts
    │   ├── project.service.ts
    │   ├── project.repository.ts
    │   └── project.schemas.ts
    ├── tasks/
    │   └── tasks.routes.ts
    └── resources/
        └── resources.routes.ts
```

> **Nota**: módulos simples podem ter tudo em `.routes.ts`. Módulos com lógica complexa devem separar em `controller`, `service` e `repository`.

---

## 4. Camadas e responsabilidades

### 4.1 Routes (`*.routes.ts`)

Registra rotas Fastify. Declara schema de request/response (Zod). Delega para o controller.

```ts
export async function projectRoutes(app: FastifyInstance) {
  app.get('/projects', {
    schema: {
      response: { 200: z.array(projectResponseSchema) },
    },
  }, projectController.list);
}
```

### 4.2 Controller (`*.controller.ts`)

Handler HTTP fino. Valida input via schema Zod (já feito pelo type provider). Chama o service. Retorna response.

```ts
export const projectController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    const projects = await projectService.list();
    return reply.send(projects);
  },
};
```

### 4.3 Service (`*.service.ts`)

Regras de negócio puras. **Sem dependência de Fastify ou HTTP**. Testável isoladamente. Chama o repository.

```ts
export const projectService = {
  list: async () => {
    return projectRepository.findAll();
  },
  create: async (data: CreateProjectInput) => {
    // regra de negócio aqui
    return projectRepository.insert(data);
  },
};
```

### 4.4 Repository (`*.repository.ts`)

Queries Drizzle. **Único lugar onde `.select()`, `.insert()`, `.update()`, `.delete()` ocorrem**. Nenhum SQL fora daqui.

```ts
import { db } from '@optsolv/db';
import { projects } from '@optsolv/db/schema';

export const projectRepository = {
  findAll: () => db.select().from(projects),
  insert: (data: NewProject) => db.insert(projects).values(data).returning(),
};
```

### 4.5 Schemas (`*.schemas.ts`)

Schemas Zod do módulo. **Reutilize** schemas de `@optsolv/shared` quando existirem.

---

## 5. Plugins Fastify

Os plugins ficam em `src/plugins/` e são registrados em ordem em `server.ts`.

### Ordem de registro (obrigatória)

```ts
registerErrorHandler(app);   // 1. Sempre primeiro
registerHelmet(app);
registerCors(app);
registerRateLimit(app);
registerSwagger(app);
app.register(dbPlugin);      // db antes de auth
registerAuth(app);           // auth após db
// módulos de rota por último
app.register(healthRoutes);
app.register(projectRoutes);
// ...
```

### Padrão de plugin

```ts
import fp from 'fastify-plugin';

export const meuPlugin = fp(async (app) => {
  // configuração
  app.decorate('minhaCoisa', valor);
}, { name: 'meu-plugin' });
```

Use `fastify-plugin` (`fp`) para que o decorator seja acessível em todos os escopos.

---

## 6. Autenticação (better-auth)

A autenticação é gerenciada pelo plugin `src/plugins/auth.ts`.

- **Provider principal**: Microsoft Entra ID (OAuth2/OIDC).
- **Provider secundário**: email/senha (com verificação de email).
- O schema de tabelas (`users`, `sessions`, `accounts`) é gerado pelo better-auth e está em `packages/db/src/schema/auth.ts`.

### Proteger rota

```ts
app.get('/protected', {
  preHandler: [app.auth.authenticate],
}, async (req, reply) => {
  const user = req.user; // tipado pelo better-auth
  return reply.send({ user });
});
```

### Variáveis de ambiente necessárias

```env
DATABASE_URL=postgres://user:pass@host:5432/optsolv_pms
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3333
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_TENANT_ID=common
WEB_URL=http://localhost:5173
API_URL=http://localhost:3333
API_PORT=3333
NODE_ENV=development
```

Todas as variáveis são validadas com Zod em `src/config/env.ts` durante o boot. A aplicação não sobe se alguma obrigatória estiver faltando.

---

## 7. Banco de dados (Drizzle + packages/db)

### Schema

Localização: `packages/db/src/schema/`

```
packages/db/src/schema/
├── auth.ts                    # users, sessions, accounts (better-auth)
├── clients.ts
├── projects.ts
├── project-finance-monthly.ts
├── project-resources.ts
├── resources.ts
├── tasks.ts
├── documents.ts
├── audit-logs.ts
└── index.ts                   # exporta tudo
```

### Convenções do schema

- **snake_case** no banco, **camelCase** nos types TypeScript.
- UUID como PK (`uuid().defaultRandom().primaryKey()`).
- `created_at` e `updated_at` em todas as tabelas.
- Margens financeiras são **calculadas** (nunca armazenadas).
- Constraints de unicidade quando aplicável (`uniqueIndex`).

### Comandos

```bash
pnpm --filter @optsolv/db generate  # gera migration a partir do schema
pnpm --filter @optsolv/db migrate   # executa migrations pendentes
pnpm --filter @optsolv/db studio    # Drizzle Studio (UI visual)
```

**Nunca altere o banco diretamente.** Sempre via migrations Drizzle.

---

## 8. Regras de negócio financeiras

Essas regras vivem nos services, nunca no banco:

```ts
// packages/shared/src/finance.ts
margem_rs = faturamento - despesas - comissoes - imposto - custo_harvest
margem_pct = faturamento > 0 ? margem_rs / faturamento : null
sobras = orcamento - custo_harvest
```

Testes unitários para essas fórmulas estão em `packages/shared/src/finance.test.ts`.

---

## 9. Tratamento de erros

### Erro de domínio

```ts
// src/shared/errors/AppError.ts (ou similar)
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly code?: string,
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado`, 404, 'NOT_FOUND');
  }
}
```

### Error handler global

O plugin `error-handler.ts` captura todos os erros e retorna response padronizado:

```json
{
  "statusCode": 404,
  "code": "NOT_FOUND",
  "message": "Projeto não encontrado"
}
```

**Nunca silencie erros.** `try/catch` só onde há ação significativa (log + relançar ou converter).

---

## 10. Validação de schema com Zod

Use `fastify-type-provider-zod` para validação automática de request/response:

```ts
import { zodTypeProvider } from 'fastify-type-provider-zod';

app.withTypeProvider<ZodTypeProvider>().post('/projects', {
  schema: {
    body: createProjectSchema,
    response: { 201: projectResponseSchema },
  },
}, handler);
```

Schemas de request/response vêm de:
1. `@optsolv/shared` (schemas compartilhados com o frontend) — **prefira estes**.
2. `*.schemas.ts` do próprio módulo (schemas específicos do backend).

---

## 11. Padrões de código

- **TypeScript strict total** — `any` é proibido; use `unknown` + type guards.
- **Sem lógica de negócio em routes/controllers** — vai para o service.
- **Sem queries Drizzle fora do repository** — encapsula tudo lá.
- **Logs com pino** — `req.log.info(...)`, nunca `console.log`.
- **Variáveis de ambiente** — sempre via `env.ts`, nunca `process.env.X` direto.
- **Commits**: Conventional Commits (`feat(tasks): add kanban endpoint`).

---

## 12. Testes

```bash
pnpm --filter @optsolv/api test
```

- Testes em `*.test.ts` junto ao arquivo testado, ou em `src/__tests__/`.
- Use Vitest. Para rotas, use supertest com `buildServer()`.
- Toda regra de negócio crítica (cálculos financeiros, permissões) tem teste unitário.

---

## 13. Anti-padrões — nunca faça

- ❌ `any` ou `as X` para silenciar TS.
- ❌ Queries Drizzle fora do repository.
- ❌ Lógica de negócio no controller ou na route.
- ❌ `process.env.X` direto — use `env.ts`.
- ❌ `console.log` — use `req.log` ou `app.log`.
- ❌ Dados sensíveis em logs (senhas, tokens, PII).
- ❌ Criar arquivo `.env` no repositório — use `.env.example`.
- ❌ Alterar schema do banco sem migration.
- ❌ Silenciar erro sem ação real.

---

## 14. Scripts

```bash
pnpm --filter @optsolv/api dev         # tsx watch (hot-reload)
pnpm --filter @optsolv/api build       # tsc --noEmit (verificação)
pnpm --filter @optsolv/api start       # produção
pnpm --filter @optsolv/api typecheck   # TypeScript
pnpm --filter @optsolv/api lint        # Biome
pnpm --filter @optsolv/api test        # Vitest
```

---

## 15. Checklist antes de marcar como pronto

- [ ] `typecheck` — zero erros.
- [ ] `lint` — zero erros/warnings.
- [ ] `test` — todos passam.
- [ ] Sem `any` ou `as`.
- [ ] Toda rota tem schema de request e response declarado.
- [ ] Erros de domínio são `AppError` (ou subclasse), não `Error` genérico.
- [ ] Sem `console.log` — use o logger do Fastify.
- [ ] Sem query Drizzle fora do repository.
- [ ] Variáveis de ambiente documentadas no `.env.example`.
- [ ] Migration gerada se o schema mudou.
