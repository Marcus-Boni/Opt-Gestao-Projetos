# Optsolv PMS

Sistema enterprise de **Gestão de Projetos** da [Optsolv](https://optsolv.com.br/). Monorepo TypeScript com frontend React + Vite e backend Fastify + PostgreSQL.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS 4 + shadcn/ui |
| Roteamento | TanStack Router |
| Estado de servidor | TanStack Query v5 |
| Estado global UI | Zustand |
| Formulários | React Hook Form + Zod |
| Backend | Fastify 5 + Node.js 20 LTS |
| ORM | Drizzle ORM + drizzle-kit |
| Banco | PostgreSQL |
| Autenticação | better-auth (Microsoft Entra ID + email/senha) |
| Qualidade | Biome + Husky + lint-staged + commitlint |
| Testes | Vitest |
| Package manager | pnpm workspaces |

---

## Estrutura do monorepo

```txt
optsolv-pms/
├── apps/
│   ├── web/              # @optsolv/web — Frontend React + Vite
│   │   ├── src/
│   │   │   ├── app/      # Setup raiz (providers, router, layouts)
│   │   │   ├── features/ # Features por domínio (auth, projects, tasks, …)
│   │   │   ├── pages/    # Páginas finas — composição de features
│   │   │   ├── shared/   # Componentes, hooks, lib e stores cross-feature
│   │   │   └── styles/   # globals.css com tokens CSS
│   │   ├── CLAUDE.md     # Arquitetura detalhada do frontend
│   │   └── package.json
│   └── api/              # @optsolv/api — Backend Fastify
│       ├── src/
│       │   ├── config/   # Validação do .env com Zod
│       │   ├── modules/  # Bounded contexts (projects, tasks, resources, …)
│       │   ├── plugins/  # Plugins Fastify globais (auth, db, cors, …)
│       │   └── server.ts # Entry point
│       ├── CLAUDE.md     # Arquitetura detalhada do backend
│       └── package.json
├── packages/
│   ├── shared/           # @optsolv/shared — Schemas Zod, types, utils financeiros
│   ├── db/               # @optsolv/db    — Drizzle schema, migrations, seeds
│   └── config/           # @optsolv/config — Configs Biome, TS compartilhadas
├── docs/
│   ├── projeto/          # Documentos canônicos (somente leitura)
│   ├── projeto-md/       # Requisitos consolidados (gerado por IA)
│   ├── frontend.md       # Arquitetura frontend
│   ├── backend.md        # Arquitetura backend
│   ├── development-workflow.md
│   ├── security.md
│   └── project-transcription.md
├── AGENTS.md             # Contrato para agentes de IA
├── CLAUDE.md             # Prompt mestre do produto (contexto completo)
├── biome.json
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Pré-requisitos

- **Node.js** conforme `.nvmrc` (20 LTS+).
- **pnpm** 9+.
- **PostgreSQL** rodando localmente ou via Docker.
- Git.

```bash
node -v   # deve bater com .nvmrc
pnpm -v   # 9+
```

Se o pnpm não estiver disponível:

```bash
npm install -g pnpm
```

---

## Instalação

```bash
# 1. Instalar dependências de todos os workspaces
pnpm install

# 2. Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp packages/db/.env.example packages/db/.env   # se existir
# Editar os arquivos .env com suas credenciais

# 3. Executar migrations do banco
pnpm --filter @optsolv/db migrate

# 4. (Opcional) Popular o banco com dados iniciais
pnpm --filter @optsolv/db seed
```

---

## Desenvolvimento

```bash
# Iniciar frontend + backend em paralelo (recomendado)
pnpm dev

# Ou iniciar individualmente
pnpm --filter @optsolv/web dev   # http://localhost:5173
pnpm --filter @optsolv/api dev   # http://localhost:3333

# Swagger UI da API
# http://localhost:3333/docs
```

---

## Validação

```bash
pnpm build        # build de produção de todos os workspaces
pnpm typecheck    # TypeScript strict em todos os workspaces
pnpm lint         # Biome check em todos os workspaces
pnpm test         # Vitest em todos os workspaces
pnpm validate     # lint + typecheck + test (pipeline completo)
```

---

## Banco de dados

```bash
# Gerar migrations a partir das alterações no schema
pnpm --filter @optsolv/db generate

# Executar migrations pendentes
pnpm --filter @optsolv/db migrate

# Abrir Drizzle Studio (UI visual do banco)
pnpm --filter @optsolv/db studio
```

O schema está em `packages/db/src/schema/`. Nunca edite o banco diretamente — sempre via Drizzle migrations.

---

## Variáveis de ambiente

Veja `apps/api/.env.example` para a lista completa. Variáveis mínimas:

```env
# apps/api/.env
DATABASE_URL=postgres://user:pass@localhost:5432/optsolv_pms
BETTER_AUTH_SECRET=<gere com: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3333
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_TENANT_ID=common
WEB_URL=http://localhost:5173
API_URL=http://localhost:3333
API_PORT=3333
NODE_ENV=development
```

---

## Documentos para agentes de IA

| Documento | Propósito |
|---|---|
| `AGENTS.md` | Contrato principal — leitura obrigatória para qualquer agente |
| `CLAUDE.md` | Prompt mestre completo com escopo, design system e roadmap |
| `apps/web/CLAUDE.md` | Arquitetura, padrões e convenções do frontend |
| `apps/api/CLAUDE.md` | Arquitetura, padrões e convenções do backend |
| `docs/frontend.md` | Guia técnico aprofundado do frontend |
| `docs/backend.md` | Guia técnico aprofundado do backend |
| `docs/security.md` | Segurança, auth, secrets e dados sensíveis |
| `docs/development-workflow.md` | Branches, commits, PRs, hooks, CI/CD |
| `docs/projeto-md/project-requirements.md` | Requisitos consolidados do produto |

---

## Commits

Este projeto segue [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(tasks): add kanban board with drag-and-drop
fix(auth): handle Microsoft token refresh edge case
chore(deps): update TanStack Query to v5.62
docs(api): document rate-limit plugin behavior
```

O hook `pre-commit` roda Biome + lint-staged automaticamente.

---

## Filosofia do projeto

- **TypeScript strict total** — `any` é proibido; use `unknown` + type guards.
- **Feature-Sliced Design** no frontend — features auto-contidas, sem import cruzado.
- **Modular Monolith** no backend — módulos por bounded context, com service/repository.
- **Schemas Zod compartilhados** entre front e back via `packages/shared`.
- **Menor mudança coerente** — nenhuma segunda arquitetura, nenhum refactor não solicitado.

---

**Optsolv** · *Otimizamos respostas para desafios.*
