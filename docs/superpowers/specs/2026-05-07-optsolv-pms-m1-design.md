# M1 — Fundação: Design Spec
**Optsolv PMS** · 2026-05-07

## Contexto

Monorepo clonado de template Optsolv. Estrutura de pastas (`apps/web`, `apps/api`, `packages/*`) já existe mas está vazia — apenas logos em `apps/web/assets/`. O `pnpm-workspace.yaml` aponta para `ui-kit/frontend/backend` (template legado) e precisa ser corrigido.

Banco de dados: Azure Database for PostgreSQL — Flexible Server (credenciais disponíveis). Orquestração: pnpm workspaces puro (sem Turborepo no M1).

## Entregável

- `apps/web`: tela "Hello Optsolv" — logo, título, badge de versão. Confirma Vite + Tailwind + tokens CSS + shadcn funcionando.
- `apps/api`: endpoint `GET /health` retornando `{ status, timestamp, version }`.
- `packages/db`: schema Drizzle completo (`clients`, `projects`, `project_finance_monthly`, tabelas better-auth) com primeira migration aplicada no Azure PostgreSQL.
- Todo o tooling configurado: TypeScript strict, Biome, Husky, commitlint.

## 1. Estrutura de Arquivos

```
optsolv-pms/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── providers/        # QueryClientProvider, ThemeProvider
│   │   │   │   ├── router.tsx        # TanStack Router root
│   │   │   │   └── App.tsx
│   │   │   ├── pages/
│   │   │   │   └── hello/
│   │   │   │       └── HelloPage.tsx
│   │   │   ├── shared/
│   │   │   │   └── components/ui/    # shadcn primitivos
│   │   │   └── styles/
│   │   │       └── globals.css       # tokens CSS Optsolv completos
│   │   ├── assets/                   # logos já existem aqui
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── api/
│       ├── src/
│       │   ├── server.ts             # bootstrap Fastify
│       │   ├── plugins/
│       │   │   ├── cors.ts
│       │   │   ├── helmet.ts
│       │   │   ├── swagger.ts
│       │   │   ├── db.ts             # decorador drizzle
│       │   │   └── error-handler.ts
│       │   ├── modules/
│       │   │   └── health/
│       │   │       └── health.routes.ts
│       │   └── config/
│       │       └── env.ts            # Zod env schema
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── config/
│   │   ├── tsconfig.base.json
│   │   ├── biome.json
│   │   └── package.json
│   ├── db/
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── index.ts
│   │   │   │   ├── clients.ts
│   │   │   │   ├── projects.ts
│   │   │   │   ├── project-finance-monthly.ts
│   │   │   │   └── auth.ts           # tabelas better-auth
│   │   │   └── index.ts              # client drizzle + export schemas
│   │   ├── drizzle.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── shared/
│       ├── src/
│       │   ├── schemas/
│       │   │   ├── index.ts
│       │   │   └── project.ts        # projectFinanceMonthlySchema
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── .husky/
│   ├── pre-commit                    # lint-staged
│   └── commit-msg                   # commitlint
├── .commitlintrc.json
├── .lintstagedrc.json
├── pnpm-workspace.yaml               # apps/*, packages/*
└── package.json                      # scripts root
```

## 2. TypeScript

`packages/config/tsconfig.base.json`:
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `moduleResolution: "bundler"`
- `target: "ES2022"`
- Sem `any` — `unknown` + type guards

Cada workspace estende com `"extends": "@optsolv/config/tsconfig.base.json"`.

## 3. Biome

`packages/config/biome.json` com regras recomendadas + organização de imports automática. Regras críticas ativas: `noExplicitAny`, `useConsistentArrayType`, `noConsoleLog` (warn em prod). Cada workspace herda com `"extends": "../../packages/config/biome.json"`.

## 4. DX (Husky + lint-staged + commitlint)

- `pre-commit`: lint-staged roda `biome check --write` nos arquivos `.ts/.tsx` staged
- `commit-msg`: commitlint valida padrão Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `ci`)
- Formato de commit do projeto: `feat(scope): descrição em português`

## 5. apps/web

**Tailwind CSS v4 — config CSS-first**: não há `tailwind.config.ts`. A configuração é feita inteiramente via CSS (`@import "tailwindcss"` + `@theme`). O `packages/config` exporta um arquivo `tailwind-base.css` com os tokens de tema que cada app importa. Isso é incompatível com a config JS/TS do v3 — nenhum arquivo `.config.ts` de Tailwind será criado.

**Dependências principais**: `react@^18`, `react-dom@^18`, `@vitejs/plugin-react`, `vite`, `tailwindcss@^4`, `@tailwindcss/vite`, `@tanstack/react-router`, `@tanstack/react-query@^5`, `lucide-react`, `sonner`, `clsx`, `tailwind-merge`.

**Fontes** (via `@fontsource`): `inter`, `manrope`, `jetbrains-mono`. Sem Google Fonts CDN.

**shadcn/ui**: init com `style: default`, `tailwind.config` apontando para `packages/config`, componentes M1: `button`, `card`, `separator`, `badge`, `skeleton`, `sonner`.

**HelloPage**: logo Optsolv, título "Optsolv PMS", badge "v0.1.0 · M1", fundo com token `--background`, texto com `--foreground`.

**globals.css**: tokens CSS completos conforme spec §3.1 (light + dark), incluindo `--financial-*`.

## 6. apps/api

**Dependências principais**: `fastify@^5`, `@fastify/cors`, `@fastify/helmet`, `@fastify/swagger`, `@fastify/swagger-ui`, `fastify-type-provider-zod`, `zod`, `drizzle-orm`, `postgres` (driver).

**env.ts**: schema Zod com vars obrigatórias (`DATABASE_URL`, `API_PORT`, `WEB_URL`, `NODE_ENV`) e opcionais (`BETTER_AUTH_*`, `MICROSOFT_*`). Processo termina com erro descritivo no boot se var obrigatória faltar.

**`GET /health`**: `{ status: "ok", timestamp: string (ISO), version: string }` — sem auth, sem rate limit.

**Swagger**: disponível em `/docs` apenas em `NODE_ENV !== "production"`.

## 7. packages/db

**Schema**:
- `clients`: `id`, `name`, `taxId`, `externalId`, `createdAt`, `updatedAt`
- `projects`: `id`, `clientId` (FK→clients), `name`, `code`, `startDate`, `endDate`, `status` (`active|paused|completed|cancelled`), `budget`, `harvestProjectId`, `createdAt`, `updatedAt`
- `project_finance_monthly`: `id`, `projectId` (FK→projects), `year`, `month`, `revenue`, `expenses`, `commissions`, `taxes`, `harvestCost`, `budgetMonth`, `hours`, `createdAt`, `updatedAt` + unique index `(projectId, year, month)`
- Tabelas better-auth: `users`, `sessions`, `accounts`, `verifications`

**drizzle-kit**: `push` para M1 (schema → Azure PostgreSQL diretamente). Migrations formais com `generate`/`migrate` a partir do M3.

## 8. packages/shared

`projectFinanceMonthlySchema` Zod (spec §5.3) exportado como único schema do M1. Ponto de crescimento para DTOs dos próximos milestones.

## 9. Scripts root

```json
{
  "dev": "pnpm -r --parallel --if-present dev",
  "build": "pnpm -r --if-present build",
  "lint": "pnpm -r --if-present lint",
  "typecheck": "pnpm -r --if-present typecheck",
  "test": "pnpm -r --if-present test",
  "validate": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
}
```

## 10. Critérios de aceite do M1

- [ ] `pnpm dev` sobe web em `localhost:5173` e api em `localhost:3333`
- [ ] `GET /health` retorna 200 com payload correto
- [ ] HelloPage renderiza com logo, título e tokens CSS (laranja Optsolv)
- [ ] Dark mode toggle funcional
- [ ] `pnpm validate` passa sem erros (lint + typecheck + build)
- [ ] Schema Drizzle aplicado no Azure PostgreSQL sem erros
- [ ] `git commit` valida Conventional Commits via commitlint
