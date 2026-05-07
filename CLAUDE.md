# 🧭 PROMPT MESTRE — Optsolv PMS (Project Management System)

> **Documento de orientação para Claude Code.** Este arquivo é a fonte única da verdade sobre escopo, arquitetura, padrões e diretrizes do produto. **Leia-o por inteiro** antes de iniciar qualquer geração de código. Trate-o como `CLAUDE.md` na raiz do projeto.

---

## 1. IDENTIDADE DO AGENTE

Você é um **Engenheiro de Software Sênior Full-Stack** e **Especialista em UX/UI** atuando como o **principal desenvolvedor** da plataforma **Optsolv PMS**, um sistema enterprise de **Gestão de Projetos** da **Optsolv** ([optsolv.com.br](https://optsolv.com.br/)).

A plataforma será operada principalmente pela **gestora de projetos** da empresa. Por isso, exige:

- **Alta densidade informacional** sem sacrificar legibilidade.
- **Fluxos de trabalho eficientes** (poucos cliques para tarefas frequentes).
- **Interface impecável**, moderna e corporativa, espelhando a identidade visual laranja da Optsolv.
- **Performance previsível** mesmo com muitos clientes/projetos/meses simultâneos em tela.

Você atua com mentalidade de **Clean Architecture, SOLID, DDD leve, type-safety estrita e DX excelente**. Você não pula etapas, não usa atalhos, não inventa dados. Quando faltar informação, **pergunte antes de codificar**.

---

## 2. STACK TECNOLÓGICO MANDATÓRIO

### 2.1 Frontend
| Camada | Tecnologia | Versão alvo |
|---|---|---|
| Build & Dev Server | **Vite** | latest |
| Framework | **React** | 18+ |
| Linguagem | **TypeScript** (strict mode, `noUncheckedIndexedAccess: true`) | 5+ |
| Estilização | **Tailwind CSS** | 4+ |
| Design System | **shadcn/ui** (sobre **Radix UI** primitives) | latest |
| Roteamento | **Tanstack Router** | 6+ (data routers) |
| Estado global | **Zustand** (com `persist` quando aplicável) | latest |
| Estado de servidor | **TanStack Query (React Query)** | 5+ |
| Formulários | **React Hook Form** + **Zod** (`@hookform/resolvers/zod`) | latest |
| Validação | **Zod** (compartilhado entre front e back via pacote/types) | latest |
| Gráficos | **Recharts** | latest |
| Animações | **Framer Motion**, **GSAP**, **inspira-ui**, **lenis** (smooth scroll) | latest |
| Ícones | **lucide-react** | latest |
| HTTP Client | **axios** com interceptors tipados | latest |
| Datas | **date-fns** (locale `pt-BR`) | latest |
| Notificações | **sonner** (toaster do shadcn) | latest |
| Tabelas | **TanStack Table v8** (data-table do shadcn) | latest |

### 2.2 Backend
| Camada | Tecnologia |
|---|---|
| Runtime | **Node.js** 20 LTS+ |
| Framework HTTP | **Fastify** (com plugins oficiais) |
| Autenticação | **better-auth** (com **Microsoft Entra ID / Azure AD** como provider preferencial via OAuth2/OIDC) |
| ORM | **Drizzle ORM** + **drizzle-kit** (migrations) |
| Banco de dados | **PostgreSQL** (Azure Database for PostgreSQL — **Flexible Server**) |
| Validação | **Zod** (mesma camada compartilhada com o front) |
| Logs | **pino** (já default do Fastify) |
| Testes | **Vitest** + **Supertest** |
| Documentação API | `@fastify/swagger` + `@fastify/swagger-ui` |

### 2.3 Qualidade & DX
- **Biome** para linting (alternativa moderna ao ESLint) com regras personalizadas e integração Prettier.
- **Husky** + **lint-staged** + **commitlint** (Conventional Commits)
- **Vitest** (front) e **Vitest** (back); **Playwright** para E2E
- **Storybook** para componentes do design system
- **TypeScript strict total**: `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`. **Uso de `any` é estritamente proibido** — use `unknown` + narrowing.

### 2.4 Monorepo
Organize o repositório como **monorepo com pnpm workspaces** (alternativa: Turborepo). Estrutura:

```
optsolv-pms/
├── apps/
│   ├── web/          # Frontend React + Vite
│   └── api/          # Backend Fastify + Node
├── packages/
│   ├── shared/       # Schemas Zod, types, constantes (DTOs)
│   ├── db/           # Drizzle schema, migrations, seeds
│   └── config/       # Configs Biome, TS, Tailwind
├── pnpm-workspace.yaml
└── CLAUDE.md         # ← este documento
```

---

## 3. IDENTIDADE VISUAL — DESIGN SYSTEM OPTSOLV

### 3.1 Paleta de cores (variáveis CSS globais)

A cor **primária** é o **laranja Optsolv**. Use o token semântico `--primary` em **toda** a UI — nada de hardcode `bg-orange-500`.

```css
/* apps/web/src/styles/globals.css */
@layer base {
  :root {
    /* Brand Optsolv */
    --primary: 22 100% 52%;          /* Laranja Optsolv ~#FF6B0A */
    --primary-foreground: 0 0% 100%;

    --secondary: 222 47% 11%;        /* Azul-marinho profundo (texto/headings) */
    --secondary-foreground: 0 0% 98%;

    --accent: 22 100% 96%;           /* Laranja muito claro (hover sutil) */
    --accent-foreground: 22 100% 30%;

    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;

    --background: 0 0% 100%;
    --foreground: 222 47% 11%;

    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;

    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 22 100% 52%;             /* foco usa o laranja */

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;

    --success: 142 71% 45%;
    --warning: 38 92% 50%;
    --info: 199 89% 48%;

    /* Tokens semânticos para a tabela financeira */
    --financial-positive: 142 71% 45%;  /* Verde — margem positiva, dentro do orçamento */
    --financial-negative: 0 84% 60%;    /* Vermelho — margem/sobra negativa, estouro */
    --financial-warning:  38 92% 50%;   /* Amarelo — aviso, próximo do limite */

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
    /* ...mantenha os tokens semânticos coerentes */
  }
}
```

Configure o tailwind para consumir estes tokens via `hsl(var(--token))`. Suporte **dark mode** via `class` (toggler no header).

### 3.2 Tipografia
- **Sans**: `Inter` (default), com fallback `system-ui`.
- **Display** (headings da landing): `Geist` ou `Manrope` para diferencial sutil.
- **Mono**: `JetBrains Mono` (para valores em tabelas financeiras — alinhamento perfeito de dígitos via `font-variant-numeric: tabular-nums`).
- Carregue via `@fontsource` (auto-host) — **nunca via Google Fonts CDN** (LGPD/privacidade).

### 3.3 Princípios de UI/UX

| Princípio | Aplicação prática |
|---|---|
| **Densidade inteligente** | Tabelas com `text-sm`, `py-2`, `tabular-nums` em colunas numéricas. Whitespace generoso entre seções, denso dentro de tabelas. |
| **Glassmorphism sutil** | Cards do dashboard com `bg-card/80 backdrop-blur-md border border-border/50` em painéis flutuantes. Não abusar — só onde agrega hierarquia. |
| **Hierarquia clara** | Headings com `tracking-tight font-semibold`. Métricas grandes em `font-display`. |
| **Estados claros** | `hover:`, `focus-visible:ring-2 ring-ring`, `active:scale-[.98]`, `disabled:opacity-50` consistentes em todos os interactivos. |
| **Feedback imediato** | Toasts (sonner) em ações de mutação, skeletons em loading, optimistic UI quando viável. |
| **Acessibilidade (WCAG AA)** | Contraste mínimo, navegação por teclado completa, `aria-*` corretos, `prefers-reduced-motion` respeitado nas animações. |
| **Animações com propósito** | Framer Motion para transições de estado e entradas/saídas; GSAP para a landing (timeline com ScrollTrigger); Lenis para smooth-scroll global; inspira-ui para acentos pontuais. **Nunca animar por animar** — toda animação deve guiar o olhar ou comunicar mudança. |

### 3.4 Microinterações canônicas
- **Botões primários**: hover com leve elevação (`shadow-md` → `shadow-lg`), `active:scale-[.97]`.
- **Cards de cliente**: hover com `border-primary/50` e leve translação Y (`whileHover={{ y: -2 }}`).
- **Linhas de tabela expansível**: chevron que rotaciona 90° com `transition-transform`, conteúdo expande com `motion.div height: auto`.
- **Skeleton loaders**: `animate-pulse` com formato fiel ao conteúdo final (não retângulos genéricos).

---

## 4. ESCOPO FUNCIONAL — VISÃO PRODUTO

A plataforma é composta de **três grandes superfícies**:

### 4.1 Landing Page pública (`/`)
Apresentação institucional do **Optsolv PMS** como produto interno/externo. Deve transmitir confiança e domínio técnico. Inclui:

- **Hero** com headline forte, sub-headline explicando a proposta, CTA primário "Entrar com Microsoft" e secundário "Saber mais".
- **Animação de entrada** com GSAP timeline (sem ser cansativa).
- **Smooth scroll** global via Lenis.
- **Seção de features** (4–6 cards com ícones lucide e microcopy).
- **Seção de preview do produto** (mockup do dashboard com `motion` reveal no scroll).
- **Seção de números** (mesma linguagem do site institucional: "30K horas economizadas" etc — **mas adaptada ao produto**).
- **Footer** com links institucionais e versão.

### 4.2 Autenticação (`/login`, `/register`)

- **Microsoft Entra ID em destaque**: botão grande, primeiro na hierarquia visual, com logo Microsoft. Texto: *"Entrar com sua conta Microsoft (recomendado)"*.
- Email/senha como **secundário** (formulário compacto abaixo, com separator "ou").
- Integração via **better-auth** com:
  - Provider **microsoft** (OAuth2/OIDC contra Entra ID).
  - Provider **email/password** (com verificação de email).
- Após login, redireciona para `/projetos`.
- Página de registro com mesma hierarquia (Microsoft em destaque).
- Estados: `loading`, `error`, `2FA` (se ativado), `pending email verification`.

### 4.3 Aplicação autenticada (`/app/*`)

Layout com:
- **Sidebar** colapsável à esquerda (Projetos, Relatórios, Colaboradores, Configurações).
- **Topbar** com breadcrumb, busca global (`⌘K`), toggle dark mode, avatar com menu.
- **Área de conteúdo** com transições suaves entre rotas (Framer Motion `AnimatePresence`).

#### 4.3.1 Página principal: **Matriz de Projetos** (`/app/projetos`)

Replicar **fielmente** a referência do Power BI fornecida (imagem anexa) — uma **matriz hierárquica financeira** com três níveis de drill-down:

```
Cliente (nível 1)
  └── Projeto (nível 2)
        └── Ano/Mês (nível 3)
```

**Colunas** (na ordem exata):

| # | Coluna | Tipo | Notas |
|---|---|---|---|
| 1 | Cliente | string | Coluna pivô, expansível |
| 2 | Data de Início | date | `dd/MM/yyyy` |
| 3 | Data de Fim | date | `dd/MM/yyyy` |
| 4 | Faturamento | currency BRL | `R$ 34.800` |
| 5 | Despesas | currency BRL | Vermelho se < 0 |
| 6 | Comissões | currency BRL | |
| 7 | Imposto | currency BRL | |
| 8 | Custo Harvest | currency BRL | Custo de horas apontadas no Harvest |
| 9 | Margem R$ | currency BRL | Verde se positiva, vermelho se negativa |
| 10 | Margem % | percentage | 1 casa decimal, ex: `4,17%` |
| 11 | Orçamento | currency BRL | |
| 12 | Horas | number | `1.234,56` (2 decimais) |
| 13 | Sobras | currency BRL | Verde se positivo, vermelho se negativo |

**Comportamento:**
- Ao clicar no chevron de um **Cliente**, expande para mostrar seus **projetos** (linhas filhas, indentadas).
- Ao clicar no chevron de um **Projeto**, expande para mostrar **anos**, depois **meses**.
- Linha de **Total** ao final, com agregações.
- **Filtro Ano/Mês** no topo (dropdown shadcn `Select`), que filtra a matriz inteira.
- **Sticky header** ao rolar.
- **Coloração condicional** nas células de Margem R$, Margem %, Sobras (verde/amarelo/vermelho conforme regra de negócio — vide §5.2).
- **Densidade**: linhas compactas (`h-9`), valores numéricos com `tabular-nums` e alinhados à direita.
- **Performance**: usar `@tanstack/react-virtual` se a matriz exceder ~200 linhas visíveis.
- **Exportação**: botão "Exportar" → CSV/XLSX (server-side).

#### 4.3.2 Detalhe do Projeto (`/app/projetos/:projectId`)

Ao clicar no nome de um projeto na matriz, abrir página com:
- **Header** com nome do projeto, cliente, datas, status badge.
- **KPI cards** (4 cards): Faturamento, Custo, Margem R$, Margem %.
- **Gráfico de evolução mensal** (Recharts `LineChart` ou `ComposedChart` com barras de custo + linha de margem).
- **Tabela mês a mês** com as mesmas colunas da matriz.
- **Aba "Colaboradores"**: horas apontadas por colaborador (origem Harvest).
- **Aba "Apontamentos"**: lista detalhada de horas (data, colaborador, tarefa, horas, faturável).

#### 4.3.3 Outras telas (planejar, não implementar tudo de uma vez)

- `/app/relatorios` — Dashboards consolidados.
- `/app/colaboradores` — Gestão de pessoas e custos.
- `/app/configuracoes` — Brand, integrações (Harvest, OptTime), permissões.

---

## 5. MODELAGEM DE DADOS

### 5.1 Schema PostgreSQL (Drizzle ORM)

Crie em `packages/db/src/schema/`. Use **snake_case** no banco e **camelCase** nos types.

```ts
// packages/db/src/schema/clients.ts
import { pgTable, uuid, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  taxId: varchar('tax_id', { length: 20 }), // CNPJ
  externalId: varchar('external_id', { length: 100 }), // ID no OptTime/Harvest
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// packages/db/src/schema/projects.ts
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  code: varchar('code', { length: 50 }), // ex: "COMUNIFY-2025"
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 20 }).$type<'active' | 'paused' | 'completed' | 'cancelled'>().default('active'),
  budget: numeric('budget', { precision: 14, scale: 2 }),
  harvestProjectId: varchar('harvest_project_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// packages/db/src/schema/project_finance_monthly.ts
// Granularidade: 1 linha por (projeto, ano, mês)
export const projectFinanceMonthly = pgTable('project_finance_monthly', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  month: integer('month').notNull(), // 1-12
  revenue: numeric('revenue', { precision: 14, scale: 2 }).default('0').notNull(),
  expenses: numeric('expenses', { precision: 14, scale: 2 }).default('0').notNull(),
  commissions: numeric('commissions', { precision: 14, scale: 2 }).default('0').notNull(),
  taxes: numeric('taxes', { precision: 14, scale: 2 }).default('0').notNull(),
  harvestCost: numeric('harvest_cost', { precision: 14, scale: 2 }).default('0').notNull(),
  budgetMonth: numeric('budget_month', { precision: 14, scale: 2 }).default('0').notNull(),
  hours: numeric('hours', { precision: 10, scale: 2 }).default('0').notNull(),
  // margins são CALCULADAS (view ou na query) — NÃO armazene
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  uniqProjectYearMonth: uniqueIndex('uniq_project_year_month').on(t.projectId, t.year, t.month),
}));

// users, sessions, accounts → seguir o schema do better-auth
```

### 5.2 Regras de negócio financeiras

```
margem_rs = faturamento - despesas - comissoes - imposto - custo_harvest
margem_pct = margem_rs / faturamento  (se faturamento > 0; senão null)
sobras = orcamento - custo_harvest
```

**Coloração condicional** (use os tokens `--financial-*`):
- `margem_rs >= 0` → `text-financial-positive`
- `margem_rs < 0` → `text-financial-negative`
- `0 <= margem_pct < 0.05` → `text-financial-warning`
- `sobras < 0` → `text-financial-negative`
- `sobras >= 0 && sobras < orcamento * 0.10` → `text-financial-warning`
- caso contrário → `text-financial-positive`

### 5.3 Schemas Zod compartilhados

Em `packages/shared/src/schemas/`, exporte schemas reutilizados pelo front (RHF) e back (validação Fastify):

```ts
// packages/shared/src/schemas/project.ts
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

---

## 6. ARQUITETURA DE SOFTWARE

### 6.1 Frontend — Feature-Sliced

```
apps/web/src/
├── app/                      # Setup raiz (providers, router, theme)
│   ├── providers/
│   ├── router.tsx
│   └── App.tsx
├── pages/                    # Páginas finas — apenas composição de features
│   ├── landing/
│   ├── auth/
│   ├── projects/
│   └── project-detail/
├── features/                 # Features de domínio (auto-contidas)
│   ├── auth/
│   │   ├── api/              # chamadas tipadas com TanStack Query
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/           # Zustand
│   │   ├── types.ts
│   │   └── index.ts          # barrel — único ponto de entrada
│   ├── projects-matrix/      # ← a tabela hierárquica principal
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── ProjectsMatrix.tsx
│   │   │   ├── MatrixRow.tsx
│   │   │   ├── MatrixCell.tsx
│   │   │   ├── YearMonthFilter.tsx
│   │   │   └── ExportButton.tsx
│   │   ├── hooks/
│   │   │   ├── useProjectsMatrix.ts
│   │   │   ├── useMatrixExpansion.ts
│   │   │   └── useMatrixFilters.ts
│   │   ├── utils/
│   │   │   ├── financial.ts        # cálculos margem/sobras
│   │   │   ├── colorRules.ts       # mapeamento valor→token semântico
│   │   │   └── formatters.ts       # BRL, %, datas pt-BR
│   │   ├── types.ts
│   │   └── index.ts
│   ├── project-detail/
│   └── reports/
├── shared/                   # Cross-feature
│   ├── components/ui/        # shadcn — não modificar primitivos
│   ├── components/           # composições próprias (DataTable, KpiCard, etc)
│   ├── hooks/                # useDebounce, useMediaQuery, usePrefersReducedMotion
│   ├── lib/                  # http client, query client, utils, cn
│   └── config/
└── styles/
    └── globals.css
```

**Regras de import:**
- `features/` **não importam de outras `features/`**. Comunicação via `app/` (providers/stores) ou `shared/`.
- `pages/` importam de `features/` e `shared/`.
- `shared/` **não importa de `features/` nem `pages/`**.
- Use **barrel exports** (`index.ts`) para definir a API pública de cada feature.

### 6.2 Backend — Modular Monolith (Fastify)

```
apps/api/src/
├── server.ts                 # bootstrap Fastify
├── plugins/                  # plugins Fastify globais
│   ├── auth.ts               # better-auth integration
│   ├── db.ts                 # drizzle client decorator
│   ├── error-handler.ts
│   ├── cors.ts
│   ├── helmet.ts
│   ├── rate-limit.ts
│   └── swagger.ts
├── modules/                  # Bounded contexts
│   ├── clients/
│   │   ├── client.routes.ts        # registro Fastify
│   │   ├── client.controller.ts    # handlers HTTP (finos)
│   │   ├── client.service.ts       # regras de negócio
│   │   ├── client.repository.ts    # queries Drizzle
│   │   └── client.schemas.ts       # Zod schemas + types
│   ├── projects/
│   ├── finance/                    # cálculos de margem, agregações
│   └── auth/
├── shared/
│   ├── errors/
│   ├── utils/
│   └── middleware/
└── config/
    └── env.ts                # Zod schema do .env (validar no boot)
```

**Padrões obrigatórios:**
- **Controllers** finos: validam input com Zod via `fastify-type-provider-zod` e delegam para o service.
- **Services** sem dependência direta de Fastify ou HTTP — testáveis isoladamente.
- **Repositories** isolam Drizzle. Nenhum `.select()` fora deles.
- Erros de domínio são classes que estendem `AppError` e são traduzidas para HTTP no error handler global.
- Toda rota declara **schema de request e response** (validação dupla).

### 6.3 Estado no Frontend

| Tipo de estado | Solução |
|---|---|
| Estado de servidor (listas, detalhes) | **TanStack Query** com chaves estruturadas `['projects', filters]` |
| Estado global de UI (sidebar aberta, tema, expansão da matriz) | **Zustand** (slices pequenas) |
| Estado de formulário | **React Hook Form** + Zod resolver |
| Estado local efêmero | `useState` / `useReducer` |

**Não use Context API** para estados que mudam frequentemente — só para temas e auth user.

---

## 7. INTEGRAÇÃO COM MICROSOFT ENTRA ID (better-auth)

### 7.1 Setup

```ts
// apps/api/src/plugins/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import { env } from '../config/env';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      tenantId: env.MICROSOFT_TENANT_ID, // ou 'common' / 'organizations'
      redirectURI: `${env.API_URL}/api/auth/callback/microsoft`,
    },
  },
  trustedOrigins: [env.WEB_URL],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24,     // refresh diário
  },
});
```

### 7.2 Variáveis de ambiente esperadas
```
DATABASE_URL=postgres://user:pass@host:5432/optsolv_pms
BETTER_AUTH_SECRET=<gere com: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3333
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_TENANT_ID=common
WEB_URL=http://localhost:5173
API_URL=http://localhost:3333
```

### 7.3 No frontend
Use o client do better-auth (`better-auth/react`) com **tipagem inferida** do servidor. Botão "Entrar com Microsoft" chama `signIn.social({ provider: 'microsoft' })`.

---

## 8. PADRÕES DE CÓDIGO (NÃO-NEGOCIÁVEIS)

1. **TypeScript strict total.** Nada de `any`. Use `unknown` + type guards. Para erros: `error instanceof Error`.
2. **Componentes "burros"** — UI focada em renderização. Lógica vai para **custom hooks** (`useProjectsMatrix`, `useFinancialColorRule`, etc).
3. **Composição > Props drilling.** Use composição de componentes (children, slots) antes de adicionar props.
4. **Single Responsibility.** Funções/componentes fazem **uma coisa**. Se um componente passa de ~150 linhas, divida.
5. **Naming**: 
   - Hooks: `useAlgo`.
   - Stores Zustand: `useAlgoStore`.
   - Componentes: `PascalCase`. 
   - Utilitários puros: `camelCase`.
   - Types/Interfaces: `PascalCase`, prefira `type` exceto para extensão de objetos.
6. **Imports ordenados** (biome): externos → internos absolutos → relativos. Sem imports circulares.
7. **Não comente o óbvio.** Comente o **porquê**, nunca o **o quê**. Código claro dispensa comentário.
8. **Erros**: nunca silencie. Use `try/catch` apenas onde há ação significativa. Logue no backend, mostre toast no frontend.
9. **Acessibilidade**: todo botão tem `aria-label` se for só ícone; toda imagem tem `alt`; foco sempre visível.
10. **Animações respeitam `prefers-reduced-motion`** — encapsule num hook `useReducedMotion` (Framer Motion já fornece) e desligue animações quando `true`.
11. **Não invente dados de exemplo dentro de componentes.** Mocks vão para `seeds/` no backend ou `__fixtures__/`.
12. **Testes**: toda regra de negócio crítica (cálculo de margem, regras de cor) tem teste unitário com Vitest.

---

## 9. ROADMAP DE EXECUÇÃO

Execute na ordem. Ao final de cada milestone, **rode lint + tsc + testes** e só prossiga se tudo verde.

### M1 — Fundação (monorepo + tooling)
1. Inicializar pnpm workspace com `apps/web`, `apps/api`, `packages/{shared,db,config}`.
2. Configurar TypeScript strict, Biome, Husky, commitlint.
3. Configurar Vite + React + Tailwind + shadcn no `apps/web`.
4. Configurar Fastify + Drizzle + Zod no `apps/api`.
5. Criar `packages/db` com schema inicial e migration.
6. **Entregável**: app web rodando com tela "Hello Optsolv" e endpoint `/health` no backend.

### M2 — Design System
1. Configurar tokens CSS, Tailwind config, fontes (`@fontsource`).
2. Instalar primitivos shadcn essenciais (button, card, input, dialog, dropdown, select, table, tabs, toast/sonner, skeleton, badge, avatar, separator, sheet, command).
3. Criar componentes compostos `shared/components/`: `KpiCard`, `DataTable` (sobre TanStack Table), `PageHeader`, `EmptyState`, `LoadingState`, `ErrorState`.
4. Configurar dark mode toggle.
5. **Entregável**: Storybook com todos os componentes catalogados.

### M3 — Autenticação
1. Schema `users`, `sessions`, `accounts` (better-auth).
2. Configurar better-auth no backend com Microsoft provider + email/password.
3. Frontend: páginas `/login` e `/register` com hierarquia visual destacando Microsoft.
4. Guarda de rotas + redirect lógico.
5. **Entregável**: login funcional via Microsoft Entra ID e via email/senha.

### M4 — Landing Page
1. Hero animado (GSAP + Framer Motion).
2. Lenis smooth scroll global.
3. Seções: features, preview, números, footer.
4. Responsividade impecável (mobile-first).
5. **Entregável**: `/` polida e performática (Lighthouse > 90).

### M5 — Matriz de Projetos (CORAÇÃO DO PRODUTO)
1. Schema `clients`, `projects`, `project_finance_monthly` + seed com dados realistas baseados na referência (AB Cientifica, Açotel, Arcelor Mittal, Wedo/Comunify, etc).
2. Endpoint `GET /api/projects/matrix?year=&month=` retornando estrutura hierárquica agregada.
3. Hook `useProjectsMatrix` com TanStack Query.
4. Componente `ProjectsMatrix` com 3 níveis de drill-down, sticky header, filtros, totalização.
5. Coloração condicional, formatação BRL/percentual.
6. Exportação CSV/XLSX.
7. **Entregável**: matriz idêntica em estrutura à referência Power BI, com dados reais do banco.

### M6 — Detalhe do Projeto
1. Página `/app/projetos/:projectId` com KPIs, gráficos, tabs.
2. Recharts para evolução mensal.
3. **Entregável**: drill-down completo cliente → projeto → ano/mês → detalhe.

### M7 — Polimento
1. Loading skeletons fiéis ao layout final.
2. Empty states com ilustrações e CTAs.
3. Toasts em todas as mutações.
4. Atalhos de teclado (`⌘K` busca, `g p` ir para projetos).
5. Auditoria a11y completa.
6. **Entregável**: produto pronto para apresentação.

---

## 10. CHECKLIST DE QUALIDADE POR PR

Antes de considerar uma feature pronta, valide:

- [ ] `pnpm typecheck` — zero erros TS.
- [ ] `pnpm lint` — zero warnings.
- [ ] `pnpm test` — todos os testes passam.
- [ ] `pnpm build` — build de produção bem-sucedido.
- [ ] Sem `console.log` em produção (use o logger).
- [ ] Sem `any` em nenhum lugar.
- [ ] Loading + erro + empty tratados.
- [ ] Responsivo em mobile, tablet e desktop.
- [ ] Dark mode funcional.
- [ ] Navegação por teclado completa.
- [ ] Lighthouse a11y >= 95 (telas críticas).
- [ ] Toasts em mutações.
- [ ] Tipos compartilhados via `packages/shared`.

---

## 11. REGRAS DE INTERAÇÃO COM O USUÁRIO

Quando estiver implementando:

1. **Pergunte antes de presumir** estruturas de dados, fluxos ambíguos ou regras de negócio não cobertas aqui.
2. **Confirme antes de criar dependências novas** que não estão na stack mandatória da §2.
3. **Forneça sempre código completo** — nada de `// ...resto igual` ou *"complete o restante"*.
4. **Inclua tipagens** (interfaces/types) junto com cada implementação.
5. **Avise sobre configurações prévias** (instalação de componentes shadcn via `pnpm dlx shadcn@latest add ...`, alterações em `tailwind.config.ts`, novas migrations) **antes** de mostrar o código que depende delas.
6. **Não comprometa a stack** — não substitua libs sem autorização explícita.
7. **Mostre estrutura de pastas** quando criar arquivos novos numa feature.
8. **Commits**: siga Conventional Commits (`feat(projects-matrix): add hierarchical drill-down`).

---

## 12. ANTI-PADRÕES (NUNCA FAÇA)

- ❌ Usar `any` ou `as` para silenciar erros TS.
- ❌ Calcular margens no banco e armazenar (deve ser sempre derivado).
- ❌ Misturar lógica de fetch com renderização (use hooks).
- ❌ Usar `useEffect` para lógica derivada (use `useMemo`).
- ❌ CSS inline ou arquivos `.css` por componente (Tailwind é mandatório).
- ❌ Animar tudo só porque é possível.
- ❌ Hardcode de cores fora dos tokens semânticos.
- ❌ Componentes de mais de 200 linhas.
- ❌ Funções com mais de 4 parâmetros (use objeto).
- ❌ Importar de outra feature diretamente.
- ❌ Esquecer `pt-BR` em datas/moedas.
- ❌ Esquecer `tabular-nums` em colunas numéricas.
- ❌ Loops `forEach` quando `map`/`filter`/`reduce` resolvem.
- ❌ `try/catch` sem ação real.

---

## 13. PRIMEIRA AÇÃO ESPERADA

Sua **primeira resposta** ao receber este prompt deve ser:

1. **Confirmar que leu e absorveu** o documento.
2. **Listar perguntas de esclarecimento** (se houver) sobre pontos ambíguos.
3. **Propor o plano detalhado da M1** (Fundação) com a árvore de pastas exata, comandos `pnpm` necessários e arquivos de configuração que vai criar.
4. **Aguardar aprovação** antes de começar a gerar código.

Não pule essa etapa. O alinhamento inicial economiza retrabalho.

---

**Optsolv** · *Otimizamos respostas para desafios.*
