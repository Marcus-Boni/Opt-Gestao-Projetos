# M1 — Fundação: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Monorepo Optsolv PMS totalmente configurado com tooling completo, schema de banco aplicado no Azure PostgreSQL, app web exibindo "Hello Optsolv" e API respondendo `/health`.

**Architecture:** pnpm workspaces puro (`apps/*`, `packages/*`). TypeScript strict total compartilhado via `packages/config`. Tailwind v4 CSS-first sem tailwind.config.ts. Drizzle ORM com `push` direto no Azure PostgreSQL para M1.

**Tech Stack:** pnpm 10, TypeScript 5, Biome, Husky, React 18, Vite, Tailwind CSS 4, shadcn/ui, TanStack Router, Fastify 5, Drizzle ORM, Zod, Vitest, postgres.js

---

## Mapa de Arquivos

### Modificados
- `pnpm-workspace.yaml` — corrigir para `apps/*` e `packages/*`
- `package.json` (root) — scripts e devDeps de DX

### Criados
```
packages/config/
  package.json
  tsconfig.base.json
  biome.json
  tailwind-base.css

packages/shared/
  package.json
  tsconfig.json
  src/schemas/project.ts
  src/schemas/index.ts
  src/index.ts
  src/schemas/project.test.ts

packages/db/
  package.json
  tsconfig.json
  drizzle.config.ts
  src/schema/clients.ts
  src/schema/projects.ts
  src/schema/project-finance-monthly.ts
  src/schema/auth.ts
  src/schema/index.ts
  src/index.ts

apps/api/
  package.json
  tsconfig.json
  .env.example
  src/config/env.ts
  src/plugins/cors.ts
  src/plugins/helmet.ts
  src/plugins/swagger.ts
  src/plugins/db.ts
  src/plugins/error-handler.ts
  src/modules/health/health.routes.ts
  src/modules/health/health.routes.test.ts
  src/server.ts

apps/web/
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  components.json
  src/main.tsx
  src/styles/globals.css
  src/app/App.tsx
  src/app/router.tsx
  src/app/providers/index.tsx
  src/pages/hello/HelloPage.tsx
  src/shared/lib/utils.ts
  src/shared/components/ui/  (via shadcn CLI)

.husky/pre-commit
.husky/commit-msg
.commitlintrc.json
.lintstagedrc.json
```

---

## Task 1: Corrigir workspace foundation

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json` (root)

- [ ] **Step 1.1: Atualizar pnpm-workspace.yaml**

Substituir o conteúdo inteiro de `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
allowBuilds:
  esbuild: true
  msw: true
```

- [ ] **Step 1.2: Atualizar package.json root**

Substituir o conteúdo inteiro de `package.json`:

```json
{
  "name": "optsolv-pms",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.33.3",
  "scripts": {
    "dev": "pnpm -r --parallel --if-present dev",
    "build": "pnpm -r --if-present build",
    "lint": "pnpm -r --if-present lint",
    "typecheck": "pnpm -r --if-present typecheck",
    "test": "pnpm -r --if-present test",
    "validate": "pnpm lint && pnpm typecheck && pnpm test && pnpm build",
    "prepare": "husky"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.6.0",
    "@commitlint/config-conventional": "^19.6.0",
    "husky": "^9.1.0",
    "lint-staged": "^15.3.0"
  }
}
```

- [ ] **Step 1.3: Instalar devDeps root**

```bash
pnpm install
```

Esperado: instala husky, commitlint, lint-staged na root.

- [ ] **Step 1.4: Commit**

```bash
git add pnpm-workspace.yaml package.json pnpm-lock.yaml
git commit -m "chore: fix workspace config and add dx devdeps"
```

---

## Task 2: packages/config — configs compartilhadas

**Files:**
- Create: `packages/config/package.json`
- Create: `packages/config/tsconfig.base.json`
- Create: `packages/config/biome.json`
- Create: `packages/config/tailwind-base.css`

- [ ] **Step 2.1: Criar packages/config/package.json**

```json
{
  "name": "@optsolv/config",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    "./tsconfig": "./tsconfig.base.json",
    "./biome": "./biome.json",
    "./tailwind": "./tailwind-base.css"
  }
}
```

- [ ] **Step 2.2: Criar packages/config/tsconfig.base.json**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true
  }
}
```

- [ ] **Step 2.3: Criar packages/config/biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": ["node_modules", "dist", ".turbo", "drizzle"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "error",
        "noConsoleLog": "warn"
      },
      "style": {
        "useConsistentArrayType": "error",
        "noNonNullAssertion": "warn"
      },
      "correctness": {
        "useExhaustiveDependencies": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  }
}
```

- [ ] **Step 2.4: Criar packages/config/tailwind-base.css**

Este arquivo define os tokens de tema Optsolv que o `apps/web` vai importar:

```css
@import "tailwindcss";

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-success: hsl(var(--success));
  --color-warning: hsl(var(--warning));
  --color-info: hsl(var(--info));
  --color-financial-positive: hsl(var(--financial-positive));
  --color-financial-negative: hsl(var(--financial-negative));
  --color-financial-warning: hsl(var(--financial-warning));
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

- [ ] **Step 2.5: Commit**

```bash
git add packages/config/
git commit -m "chore(config): add shared tsconfig, biome, and tailwind base config"
```

---

## Task 3: packages/shared — Zod schemas com testes

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/schemas/project.ts`
- Create: `packages/shared/src/schemas/index.ts`
- Create: `packages/shared/src/index.ts`
- Test: `packages/shared/src/schemas/project.test.ts`

- [ ] **Step 3.1: Criar packages/shared/package.json**

```json
{
  "name": "@optsolv/shared",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./schemas": "./src/schemas/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "biome check --write .",
    "test": "vitest run"
  },
  "dependencies": {
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@optsolv/config": "workspace:*",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 3.2: Criar packages/shared/tsconfig.json**

```json
{
  "extends": "@optsolv/config/tsconfig",
  "compilerOptions": {
    "rootDir": "./src",
    "paths": {}
  },
  "include": ["src"]
}
```

- [ ] **Step 3.3: Escrever o teste ANTES da implementação**

Criar `packages/shared/src/schemas/project.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { projectFinanceMonthlySchema } from './project';

describe('projectFinanceMonthlySchema', () => {
  it('aceita dados válidos', () => {
    const input = {
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      year: 2025,
      month: 5,
      revenue: 34800,
      expenses: 0,
      commissions: 0,
      taxes: 0,
      harvestCost: 0,
      budgetMonth: 30000,
      hours: 120.5,
    };
    const result = projectFinanceMonthlySchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejeita projectId inválido (não-uuid)', () => {
    const result = projectFinanceMonthlySchema.safeParse({
      projectId: 'not-a-uuid',
      year: 2025,
      month: 5,
      revenue: 0,
      expenses: 0,
      commissions: 0,
      taxes: 0,
      harvestCost: 0,
      budgetMonth: 0,
      hours: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejeita mês fora de 1-12', () => {
    const result = projectFinanceMonthlySchema.safeParse({
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      year: 2025,
      month: 13,
      revenue: 0,
      expenses: 0,
      commissions: 0,
      taxes: 0,
      harvestCost: 0,
      budgetMonth: 0,
      hours: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejeita valores negativos em revenue', () => {
    const result = projectFinanceMonthlySchema.safeParse({
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      year: 2025,
      month: 5,
      revenue: -100,
      expenses: 0,
      commissions: 0,
      taxes: 0,
      harvestCost: 0,
      budgetMonth: 0,
      hours: 0,
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3.4: Rodar o teste para confirmar que falha**

```bash
pnpm --filter @optsolv/shared test
```

Esperado: FAIL com "Cannot find module './project'"

- [ ] **Step 3.5: Implementar packages/shared/src/schemas/project.ts**

```ts
import { z } from 'zod';

export const projectFinanceMonthlySchema = z.object({
  projectId: z.string().uuid(),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  revenue: z.number().nonnegative(),
  expenses: z.number().nonnegative(),
  commissions: z.number().nonnegative(),
  taxes: z.number().nonnegative(),
  harvestCost: z.number().nonnegative(),
  budgetMonth: z.number().nonnegative(),
  hours: z.number().nonnegative(),
});

export type ProjectFinanceMonthly = z.infer<typeof projectFinanceMonthlySchema>;
```

- [ ] **Step 3.6: Criar packages/shared/src/schemas/index.ts**

```ts
export { projectFinanceMonthlySchema, type ProjectFinanceMonthly } from './project';
```

- [ ] **Step 3.7: Criar packages/shared/src/index.ts**

```ts
export * from './schemas/index';
```

- [ ] **Step 3.8: Rodar os testes novamente**

```bash
pnpm --filter @optsolv/shared test
```

Esperado: 4 testes PASS.

- [ ] **Step 3.9: Criar biome.json local (herda config)**

Criar `packages/shared/biome.json`:

```json
{
  "extends": ["../../packages/config/biome.json"]
}
```

- [ ] **Step 3.10: Rodar typecheck**

```bash
pnpm --filter @optsolv/shared typecheck
```

Esperado: sem erros.

- [ ] **Step 3.11: Commit**

```bash
git add packages/shared/
git commit -m "feat(shared): add projectFinanceMonthlySchema with Vitest tests"
```

---

## Task 4: packages/db — Drizzle schema

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/biome.json`
- Create: `packages/db/drizzle.config.ts`
- Create: `packages/db/src/schema/clients.ts`
- Create: `packages/db/src/schema/projects.ts`
- Create: `packages/db/src/schema/project-finance-monthly.ts`
- Create: `packages/db/src/schema/auth.ts`
- Create: `packages/db/src/schema/index.ts`
- Create: `packages/db/src/index.ts`

- [ ] **Step 4.1: Criar packages/db/package.json**

```json
{
  "name": "@optsolv/db",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  },
  "scripts": {
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "typecheck": "tsc --noEmit",
    "lint": "biome check --write ."
  },
  "dependencies": {
    "drizzle-orm": "^0.40.0",
    "postgres": "^3.4.5"
  },
  "devDependencies": {
    "@optsolv/config": "workspace:*",
    "drizzle-kit": "^0.30.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 4.2: Criar packages/db/tsconfig.json**

```json
{
  "extends": "@optsolv/config/tsconfig",
  "compilerOptions": {
    "rootDir": "./src",
    "paths": {}
  },
  "include": ["src", "drizzle.config.ts"]
}
```

- [ ] **Step 4.3: Criar packages/db/biome.json**

```json
{
  "extends": ["../../packages/config/biome.json"]
}
```

- [ ] **Step 4.4: Criar packages/db/drizzle.config.ts**

```ts
import { defineConfig } from 'drizzle-kit';

const url = process.env['DATABASE_URL'];
if (!url) throw new Error('DATABASE_URL não definida. Crie packages/db/.env com DATABASE_URL=...');

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url },
});
```

- [ ] **Step 4.5: Criar packages/db/src/schema/clients.ts**

```ts
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  taxId: varchar('tax_id', { length: 20 }),
  externalId: varchar('external_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
```

- [ ] **Step 4.6: Criar packages/db/src/schema/projects.ts**

```ts
import { numeric, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  code: varchar('code', { length: 50 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 20 })
    .$type<'active' | 'paused' | 'completed' | 'cancelled'>()
    .default('active'),
  budget: numeric('budget', { precision: 14, scale: 2 }),
  harvestProjectId: varchar('harvest_project_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
```

- [ ] **Step 4.7: Criar packages/db/src/schema/project-finance-monthly.ts**

```ts
import { integer, numeric, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { projects } from './projects';

export const projectFinanceMonthly = pgTable(
  'project_finance_monthly',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    year: integer('year').notNull(),
    month: integer('month').notNull(),
    revenue: numeric('revenue', { precision: 14, scale: 2 }).default('0').notNull(),
    expenses: numeric('expenses', { precision: 14, scale: 2 }).default('0').notNull(),
    commissions: numeric('commissions', { precision: 14, scale: 2 }).default('0').notNull(),
    taxes: numeric('taxes', { precision: 14, scale: 2 }).default('0').notNull(),
    harvestCost: numeric('harvest_cost', { precision: 14, scale: 2 }).default('0').notNull(),
    budgetMonth: numeric('budget_month', { precision: 14, scale: 2 }).default('0').notNull(),
    hours: numeric('hours', { precision: 10, scale: 2 }).default('0').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('uniq_project_year_month').on(t.projectId, t.year, t.month)],
);

export type ProjectFinanceMonthly = typeof projectFinanceMonthly.$inferSelect;
export type NewProjectFinanceMonthly = typeof projectFinanceMonthly.$inferInsert;
```

- [ ] **Step 4.8: Criar packages/db/src/schema/auth.ts**

Tabelas obrigatórias do better-auth (M3 vai usar estas):

```ts
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});
```

- [ ] **Step 4.9: Criar packages/db/src/schema/index.ts**

```ts
export * from './clients';
export * from './projects';
export * from './project-finance-monthly';
export * from './auth';
```

- [ ] **Step 4.10: Criar packages/db/src/index.ts**

```ts
import * as schema from './schema/index';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error('DATABASE_URL não definida');
}

const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
export * from './schema/index';
```

- [ ] **Step 4.11: Instalar dependências do pacote db**

```bash
pnpm --filter @optsolv/db install
```

- [ ] **Step 4.12: Rodar typecheck**

```bash
pnpm --filter @optsolv/db typecheck
```

Esperado: sem erros.

- [ ] **Step 4.13: Commit**

```bash
git add packages/db/
git commit -m "feat(db): add drizzle schema for clients, projects, finance, and auth tables"
```

---

## Task 5: apps/api — fundação + validação de env

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/biome.json`
- Create: `apps/api/.env.example`
- Create: `apps/api/src/config/env.ts`

- [ ] **Step 5.1: Criar apps/api/package.json**

```json
{
  "name": "@optsolv/api",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "biome check --write .",
    "test": "vitest run"
  },
  "dependencies": {
    "@fastify/cors": "^10.0.1",
    "@fastify/helmet": "^12.0.1",
    "@fastify/swagger": "^9.4.0",
    "@fastify/swagger-ui": "^5.2.0",
    "@optsolv/db": "workspace:*",
    "@optsolv/shared": "workspace:*",
    "fastify": "^5.2.0",
    "fastify-type-provider-zod": "^4.0.2",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@optsolv/config": "workspace:*",
    "@types/node": "^20.17.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 5.2: Criar apps/api/tsconfig.json**

```json
{
  "extends": "@optsolv/config/tsconfig",
  "compilerOptions": {
    "rootDir": "./src",
    "paths": {}
  },
  "include": ["src"]
}
```

- [ ] **Step 5.3: Criar apps/api/biome.json**

```json
{
  "extends": ["../../packages/config/biome.json"]
}
```

- [ ] **Step 5.4: Criar apps/api/.env.example**

```dotenv
# Banco de dados (Azure PostgreSQL Flexible Server)
DATABASE_URL=postgres://username:password@hostname.postgres.database.azure.com:5432/optsolv_pms?sslmode=require

# Servidor
API_PORT=3333
NODE_ENV=development
WEB_URL=http://localhost:5173

# better-auth (preencher no M3)
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3333

# Microsoft Entra ID (preencher no M3)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=common
```

- [ ] **Step 5.5: Criar apps/api/.env (preencher com credenciais reais)**

Copiar `.env.example` para `.env` e preencher `DATABASE_URL` com a connection string real do Azure PostgreSQL. Os campos `BETTER_AUTH_*` e `MICROSOFT_*` podem ficar vazios por ora.

```bash
cp apps/api/.env.example apps/api/.env
```

Depois editar `apps/api/.env` com os valores reais.

- [ ] **Step 5.6: Criar apps/api/src/config/env.ts**

```ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  WEB_URL: z.string().url().default('http://localhost:5173'),
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_TENANT_ID: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

- [ ] **Step 5.7: Instalar dependências da API**

```bash
pnpm --filter @optsolv/api install
```

- [ ] **Step 5.8: Commit**

```bash
git add apps/api/package.json apps/api/tsconfig.json apps/api/biome.json apps/api/.env.example apps/api/src/config/env.ts
git commit -m "feat(api): add package config and env validation"
```

---

## Task 6: apps/api — plugins + health route + server

**Files:**
- Create: `apps/api/src/plugins/cors.ts`
- Create: `apps/api/src/plugins/helmet.ts`
- Create: `apps/api/src/plugins/swagger.ts`
- Create: `apps/api/src/plugins/error-handler.ts`
- Create: `apps/api/src/plugins/db.ts`
- Create: `apps/api/src/modules/health/health.routes.ts`
- Create: `apps/api/src/server.ts`

- [ ] **Step 6.1: Escrever teste da rota /health ANTES da implementação**

Criar `apps/api/src/modules/health/health.routes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildServer } from '../../server';

describe('GET /health', () => {
  it('retorna 200 com status ok', async () => {
    const app = await buildServer();
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{ status: string; timestamp: string; version: string }>();
    expect(body.status).toBe('ok');
    expect(typeof body.timestamp).toBe('string');
    expect(typeof body.version).toBe('string');
    expect(() => new Date(body.timestamp)).not.toThrow();
  });
});
```

- [ ] **Step 6.2: Criar apps/api/src/plugins/cors.ts**

```ts
import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env';

export async function registerCors(app: FastifyInstance): Promise<void> {
  await app.register(cors, {
    origin: env.WEB_URL,
    credentials: true,
  });
}
```

- [ ] **Step 6.3: Criar apps/api/src/plugins/helmet.ts**

```ts
import helmet from '@fastify/helmet';
import type { FastifyInstance } from 'fastify';

export async function registerHelmet(app: FastifyInstance): Promise<void> {
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });
}
```

- [ ] **Step 6.4: Criar apps/api/src/plugins/swagger.ts**

```ts
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env';

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  if (env.NODE_ENV === 'production') return;

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Optsolv PMS API',
        version: '0.1.0',
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });
}
```

- [ ] **Step 6.5: Criar apps/api/src/plugins/error-handler.ts**

```ts
import type { FastifyInstance } from 'fastify';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    const statusCode = error.statusCode ?? 500;
    const message = statusCode < 500 ? error.message : 'Internal Server Error';

    reply.status(statusCode).send({ error: message });
  });
}
```

- [ ] **Step 6.6: Criar apps/api/src/plugins/db.ts**

```ts
import fp from 'fastify-plugin';
import { db } from '@optsolv/db';
import type { FastifyInstance } from 'fastify';
import type { Database } from '@optsolv/db';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

export const dbPlugin = fp(async (app: FastifyInstance) => {
  app.decorate('db', db);
});
```

Nota: `fastify-plugin` precisa ser adicionado como dependência. Adicionar em `apps/api/package.json` no campo `dependencies`:

```json
"fastify-plugin": "^5.0.1",
```

Depois rodar:
```bash
pnpm --filter @optsolv/api install
```

- [ ] **Step 6.7: Criar apps/api/src/modules/health/health.routes.ts**

```ts
import type { FastifyInstance } from 'fastify';

const VERSION = '0.1.0';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    },
  }, async (_request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: VERSION,
    });
  });
}
```

- [ ] **Step 6.8: Criar apps/api/src/server.ts**

```ts
import Fastify from 'fastify';
import { env } from './config/env';
import { registerCors } from './plugins/cors';
import { dbPlugin } from './plugins/db';
import { registerErrorHandler } from './plugins/error-handler';
import { registerHelmet } from './plugins/helmet';
import { registerSwagger } from './plugins/swagger';
import { healthRoutes } from './modules/health/health.routes';

export async function buildServer() {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  });

  registerErrorHandler(app);
  await registerHelmet(app);
  await registerCors(app);
  await registerSwagger(app);
  await app.register(dbPlugin);
  await app.register(healthRoutes);

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = await buildServer();
  await server.listen({ port: env.API_PORT, host: '0.0.0.0' });
  console.log(`API rodando em http://localhost:${env.API_PORT}`);
}
```

- [ ] **Step 6.9: Rodar o teste**

```bash
pnpm --filter @optsolv/api test
```

Esperado: 1 teste PASS.

- [ ] **Step 6.10: Rodar typecheck**

```bash
pnpm --filter @optsolv/api typecheck
```

Esperado: sem erros.

- [ ] **Step 6.11: Testar a API em modo dev**

```bash
pnpm --filter @optsolv/api dev
```

Em outro terminal:
```bash
curl http://localhost:3333/health
```

Esperado:
```json
{"status":"ok","timestamp":"2026-05-07T...","version":"0.1.0"}
```

Parar o servidor com `Ctrl+C`.

- [ ] **Step 6.12: Commit**

```bash
git add apps/api/src/
git commit -m "feat(api): add fastify server with health route and plugins"
```

---

## Task 7: apps/web — fundação Vite + Tailwind v4

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/biome.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/styles/globals.css`
- Create: `apps/web/src/shared/lib/utils.ts`

- [ ] **Step 7.1: Criar apps/web/package.json**

```json
{
  "name": "@optsolv/web",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "biome check --write .",
    "test": "vitest run"
  },
  "dependencies": {
    "@optsolv/shared": "workspace:*",
    "@fontsource/inter": "^5.1.0",
    "@fontsource/manrope": "^5.1.0",
    "@fontsource/jetbrains-mono": "^5.1.0",
    "@tanstack/react-query": "^5.62.0",
    "@tanstack/react-router": "^1.83.0",
    "axios": "^1.7.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.469.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "sonner": "^1.7.0",
    "tailwind-merge": "^2.5.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@optsolv/config": "workspace:*",
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 7.2: Criar apps/web/tsconfig.json**

```json
{
  "extends": "@optsolv/config/tsconfig",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 7.3: Criar apps/web/biome.json**

```json
{
  "extends": ["../../packages/config/biome.json"]
}
```

- [ ] **Step 7.4: Criar apps/web/vite.config.ts**

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 7.5: Criar apps/web/index.html**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/assets/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Optsolv PMS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7.6: Criar apps/web/src/styles/globals.css**

```css
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/manrope/700.css";
@import "@fontsource/jetbrains-mono/400.css";
@import "@fontsource/jetbrains-mono/500.css";
@import "tailwindcss";

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-success: hsl(var(--success));
  --color-warning: hsl(var(--warning));
  --color-info: hsl(var(--info));
  --color-financial-positive: hsl(var(--financial-positive));
  --color-financial-negative: hsl(var(--financial-negative));
  --color-financial-warning: hsl(var(--financial-warning));
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Manrope", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

@layer base {
  :root {
    --primary: 22 100% 52%;
    --primary-foreground: 0 0% 100%;
    --secondary: 222 47% 11%;
    --secondary-foreground: 0 0% 98%;
    --accent: 22 100% 96%;
    --accent-foreground: 22 100% 30%;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 22 100% 52%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --success: 142 71% 45%;
    --warning: 38 92% 50%;
    --info: 199 89% 48%;
    --financial-positive: 142 71% 45%;
    --financial-negative: 0 84% 60%;
    --financial-warning: 38 92% 50%;
    --radius: 0.625rem;
  }

  .dark {
    --background: 222 47% 6%;
    --foreground: 0 0% 98%;
    --card: 222 47% 9%;
    --card-foreground: 0 0% 98%;
    --primary: 22 100% 58%;
    --primary-foreground: 222 47% 6%;
    --secondary: 217 33% 18%;
    --secondary-foreground: 0 0% 98%;
    --muted: 217 33% 18%;
    --muted-foreground: 215 20% 65%;
    --border: 217 33% 18%;
    --input: 217 33% 18%;
    --ring: 22 100% 58%;
    --financial-positive: 142 71% 55%;
    --financial-negative: 0 84% 70%;
    --financial-warning: 38 92% 60%;
  }

  * {
    border-color: hsl(var(--border));
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: var(--font-sans);
  }
}
```

- [ ] **Step 7.7: Criar apps/web/src/shared/lib/utils.ts**

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 7.8: Instalar dependências do web**

```bash
pnpm --filter @optsolv/web install
```

- [ ] **Step 7.9: Commit**

```bash
git add apps/web/package.json apps/web/tsconfig.json apps/web/biome.json apps/web/vite.config.ts apps/web/index.html apps/web/src/styles/ apps/web/src/shared/lib/
git commit -m "feat(web): add vite config, tailwind v4 tokens, and utilities"
```

---

## Task 8: apps/web — shadcn/ui init + componentes M1

**Files:**
- Create: `apps/web/components.json`
- Create: `apps/web/src/shared/components/ui/` (via CLI)

- [ ] **Step 8.1: Inicializar shadcn/ui**

```bash
cd apps/web && pnpm dlx shadcn@latest init
```

Responder aos prompts:
- Style: **Default**
- Base color: **Neutral** (vamos sobrescrever com tokens Optsolv já configurados)
- CSS variables: **Yes**
- Would you like to use TypeScript? **Yes**
- Globals CSS file: **src/styles/globals.css**
- Tailwind config: (deixar vazio, Tailwind v4 não usa config file)
- Components alias: **@/shared/components/ui**
- Utils alias: **@/shared/lib/utils**

O comando vai criar `components.json` e sobrescrever partes do `globals.css`. Após o comando, verificar que os tokens Optsolv em `globals.css` foram mantidos — se o shadcn sobrescrever, restaurar os valores da Task 7.6.

- [ ] **Step 8.2: Instalar componentes shadcn para M1**

```bash
pnpm dlx shadcn@latest add button card badge skeleton sonner separator
```

Esperado: cria os arquivos em `src/shared/components/ui/`.

- [ ] **Step 8.3: Verificar components.json**

O arquivo `apps/web/components.json` deve ter:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/shared/components",
    "utils": "@/shared/lib/utils",
    "ui": "@/shared/components/ui",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  }
}
```

Ajustar manualmente se necessário.

- [ ] **Step 8.4: Commit**

```bash
git add apps/web/components.json apps/web/src/shared/components/
git commit -m "feat(web): init shadcn/ui with button, card, badge, skeleton, sonner, separator"
```

---

## Task 9: apps/web — providers, router e HelloPage

**Files:**
- Create: `apps/web/src/app/providers/index.tsx`
- Create: `apps/web/src/app/router.tsx`
- Create: `apps/web/src/app/App.tsx`
- Create: `apps/web/src/pages/hello/HelloPage.tsx`
- Create: `apps/web/src/main.tsx`

- [ ] **Step 9.1: Criar apps/web/src/app/providers/index.tsx**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Toaster } from '@/shared/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors closeButton />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 9.2: Criar apps/web/src/pages/hello/HelloPage.tsx**

```tsx
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

export function HelloPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4 pt-8">
          <img
            src="/assets/logo.png"
            alt="Logo Optsolv"
            className="h-14 w-auto"
          />
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
            Optsolv PMS
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Sistema de Gestão de Projetos
          </p>
          <Badge className="bg-primary text-primary-foreground">
            v0.1.0 · M1 Fundação
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 9.3: Criar apps/web/src/app/router.tsx**

```tsx
import { createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { HelloPage } from '@/pages/hello/HelloPage';
import { Providers } from './providers/index';

const rootRoute = createRootRoute({
  component: () => (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  ),
});

const helloRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HelloPage,
});

const routeTree = rootRoute.addChildren([helloRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

**Nota:** TanStack Router não suporta `RouterProvider` dentro do próprio root component — corrigir a estrutura:

```tsx
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { HelloPage } from '@/pages/hello/HelloPage';

const rootRoute = createRootRoute();

const helloRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HelloPage,
});

const routeTree = rootRoute.addChildren([helloRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

- [ ] **Step 9.4: Criar apps/web/src/app/App.tsx**

```tsx
import { RouterProvider } from '@tanstack/react-router';
import { Providers } from './providers/index';
import { router } from './router';

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
```

- [ ] **Step 9.5: Criar apps/web/src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import { App } from './app/App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Elemento #root não encontrado no DOM');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 9.6: Adicionar hook useTheme para dark mode**

Criar `apps/web/src/shared/hooks/useTheme.ts`:

```ts
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored ?? 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return { theme, toggle };
}
```

- [ ] **Step 9.7: Atualizar HelloPage com toggle de dark mode**

Substituir o conteúdo de `apps/web/src/pages/hello/HelloPage.tsx`:

```tsx
import { Moon, Sun } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { useTheme } from '@/shared/hooks/useTheme';

export function HelloPage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4 pt-8">
          <img
            src="/assets/logo.png"
            alt="Logo Optsolv"
            className="h-14 w-auto"
          />
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
            Optsolv PMS
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Sistema de Gestão de Projetos
          </p>
          <Badge className="bg-primary text-primary-foreground">
            v0.1.0 · M1 Fundação
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 9.8: Rodar o servidor de dev do web**

```bash
pnpm --filter @optsolv/web dev
```

Abrir `http://localhost:5173` no browser. Verificar:
- Logo Optsolv visível
- Título "Optsolv PMS"
- Badge laranja "v0.1.0 · M1 Fundação"
- Botão de toggle dark/light no canto superior direito
- Clicar no botão alterna entre modo claro e escuro
- Preferência persiste ao recarregar a página

- [ ] **Step 9.9: Rodar typecheck do web**

```bash
pnpm --filter @optsolv/web typecheck
```

Esperado: sem erros.

- [ ] **Step 9.10: Commit**

```bash
git add apps/web/src/app/ apps/web/src/main.tsx apps/web/src/pages/ apps/web/src/shared/hooks/
git commit -m "feat(web): add hello page with dark mode toggle and tanstack router"
```

---

## Task 10: DX tooling — Husky + lint-staged + commitlint

**Files:**
- Create: `.husky/pre-commit`
- Create: `.husky/commit-msg`
- Create: `.commitlintrc.json`
- Create: `.lintstagedrc.json`

- [ ] **Step 10.1: Inicializar Husky**

```bash
pnpm exec husky init
```

Esperado: cria `.husky/pre-commit` com conteúdo padrão.

- [ ] **Step 10.2: Atualizar .husky/pre-commit**

Substituir o conteúdo de `.husky/pre-commit`:

```sh
pnpm exec lint-staged
```

- [ ] **Step 10.3: Criar .husky/commit-msg**

```sh
pnpm exec commitlint --edit "$1"
```

Tornar executável:
```bash
chmod +x .husky/commit-msg
```

- [ ] **Step 10.4: Criar .commitlintrc.json**

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "scope-enum": [
      2,
      "always",
      ["api", "web", "db", "shared", "config", "auth", "projects", "finance", "reports", "deps", "release"]
    ],
    "subject-case": [0]
  }
}
```

- [ ] **Step 10.5: Criar .lintstagedrc.json**

```json
{
  "*.{ts,tsx}": ["biome check --write"],
  "*.{json,css,md}": ["biome format --write"]
}
```

- [ ] **Step 10.6: Testar o commitlint**

```bash
echo "mensagem inválida" | pnpm exec commitlint
```

Esperado: erro de validação (format inválido).

```bash
echo "feat(api): add health route" | pnpm exec commitlint
```

Esperado: sem erros.

- [ ] **Step 10.7: Commit**

```bash
git add .husky/ .commitlintrc.json .lintstagedrc.json
git commit -m "chore: add husky pre-commit and commit-msg hooks with commitlint"
```

---

## Task 11: DB migration — aplicar schema no Azure PostgreSQL

- [ ] **Step 11.1: Criar packages/db/.env com DATABASE_URL**

Criar o arquivo `packages/db/.env` (git-ignored) com a connection string do Azure PostgreSQL:

```dotenv
DATABASE_URL=postgres://username:password@hostname.postgres.database.azure.com:5432/optsolv_pms?sslmode=require
```

Usar os mesmos valores já preenchidos em `apps/api/.env`.

Verificar que `packages/db/.env` está no `.gitignore` root:

```
packages/db/.env
apps/api/.env
```

- [ ] **Step 11.2: Instalar dependências do pacote db**

```bash
pnpm --filter @optsolv/db install
```

- [ ] **Step 11.3: Aplicar schema com drizzle-kit push**

```bash
pnpm --filter @optsolv/db db:push
```

O comando vai mostrar as tabelas a serem criadas e pedir confirmação. Confirmar com `y`.

Esperado: tabelas `clients`, `projects`, `project_finance_monthly`, `user`, `session`, `account`, `verification` criadas no Azure PostgreSQL.

- [ ] **Step 11.4: Verificar no Azure**

Confirmar via Azure Portal > PostgreSQL > Query editor, ou via psql:

```sql
\dt
```

Esperado: as 7 tabelas listadas.

- [ ] **Step 11.5: Commit**

```bash
git add packages/db/drizzle/
git commit -m "chore(db): apply initial schema to azure postgresql via drizzle push"
```

---

## Task 12: Validação final

- [ ] **Step 12.1: Rodar lint em todos os workspaces**

```bash
pnpm lint
```

Esperado: sem erros em todos os workspaces.

- [ ] **Step 12.2: Rodar typecheck em todos os workspaces**

```bash
pnpm typecheck
```

Esperado: sem erros de TypeScript.

- [ ] **Step 12.3: Rodar todos os testes**

```bash
pnpm test
```

Esperado:
- `@optsolv/shared`: 4 testes PASS
- `@optsolv/api`: 1 teste PASS

- [ ] **Step 12.4: Rodar build**

```bash
pnpm build
```

Esperado: build de produção sem erros.

- [ ] **Step 12.5: Smoke test final — subir dev completo**

Terminal 1:
```bash
pnpm --filter @optsolv/api dev
```

Terminal 2:
```bash
pnpm --filter @optsolv/web dev
```

Verificar:
- `http://localhost:5173` → HelloPage com logo, título e badge laranja
- `http://localhost:3333/health` → `{"status":"ok","timestamp":"...","version":"0.1.0"}`
- `http://localhost:3333/docs` → Swagger UI

- [ ] **Step 12.6: Commit de fechamento do M1**

```bash
git add .
git commit -m "chore(release): M1 fundação completo — monorepo + tooling + db + hello + health"
```

---

## Resumo das dependências por workspace

| Workspace | Deps principais |
|---|---|
| `packages/config` | nenhuma |
| `packages/shared` | `zod`, `vitest` |
| `packages/db` | `drizzle-orm`, `postgres`, `drizzle-kit` |
| `apps/api` | `fastify`, `@fastify/*`, `fastify-plugin`, `fastify-type-provider-zod`, `zod`, `tsx`, `vitest` |
| `apps/web` | `react`, `vite`, `tailwindcss@^4`, `@tailwindcss/vite`, `shadcn/ui`, `@tanstack/react-router`, `@tanstack/react-query`, `@fontsource/*` |
| root (devDeps) | `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional` |
