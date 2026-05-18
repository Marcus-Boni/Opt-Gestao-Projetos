# CLAUDE.md — apps/web (Frontend)

> Arquitetura e padrões do workspace `@optsolv/web`.
> **Leia antes de qualquer trabalho no frontend.**
> Para contexto do produto, leia também `../../CLAUDE.md`.

---

## 1. Identidade

- **Package**: `@optsolv/web`
- **Dev server**: `http://localhost:5173`
- **Build output**: `dist/`
- O frontend consome a API (`@optsolv/api`) via axios e compartilha schemas com `@optsolv/shared`.

---

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite 6 |
| Framework | React 18 |
| Linguagem | TypeScript strict (`any` proibido) |
| Estilização | Tailwind CSS 4 |
| Design System | shadcn/ui (Radix UI) |
| Roteamento | TanStack Router |
| Estado servidor | TanStack Query v5 |
| Estado UI global | Zustand |
| Formulários | React Hook Form + Zod |
| HTTP | axios (interceptors tipados) |
| Tabelas | TanStack Table v8 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Animações | Framer Motion, GSAP (landing), Lenis (scroll) |
| Ícones | lucide-react |
| Notificações | sonner |
| Datas | date-fns (locale `pt-BR`) |
| Fontes | @fontsource (auto-host, nunca Google CDN) |

---

## 3. Estrutura de pastas

```
apps/web/src/
├── app/                   # Setup raiz
│   ├── App.tsx
│   ├── router.tsx         # TanStack Router
│   ├── providers/         # QueryClient, Auth, Theme
│   └── layouts/           # AppLayout, AuthLayout
│
├── features/              # Features de domínio (auto-contidas)
│   ├── auth/
│   ├── dashboard/
│   ├── projects/
│   ├── projects-matrix/   # Matriz financeira hierárquica (core)
│   ├── tasks/             # Kanban + drag-and-drop
│   ├── resources/
│   └── settings/
│   # Cada feature tem: api/, components/, hooks/, stores/, types.ts, index.ts
│
├── pages/                 # Páginas finas — composição de features
│   ├── landing/           # / (pública)
│   ├── auth/              # /login, /register
│   └── app/               # /app/* (autenticada)
│
├── shared/                # Cross-feature (sem deps de features/)
│   ├── components/
│   │   ├── ui/            # Primitivos shadcn/ui — não modificar
│   │   ├── KpiCard.tsx
│   │   ├── PageHeader.tsx
│   │   ├── StateViews.tsx # Empty/Loading/Error state
│   │   ├── AppSearch.tsx  # Busca global ⌘K
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleGuard.tsx
│   │   └── UserMenu.tsx
│   ├── hooks/
│   ├── lib/               # http.ts, queryClient.ts, cn.ts
│   └── stores/            # Zustand cross-feature (theme, ui)
│
└── styles/globals.css     # Tokens CSS + Tailwind base
```

### Regras de import entre camadas

```
pages/    → pode importar de: features/, shared/
features/ → pode importar de: shared/ (NUNCA de outras features/)
shared/   → pode importar de: packages/shared (NUNCA de features/ ou pages/)
```

- Cada feature expõe **apenas** o que está no `index.ts` (barrel).
- Imports circulares são proibidos.
- Use paths absolutos via alias `@/` configurado no `tsconfig.json`.

---

## 4. Design System Optsolv

### Tokens CSS (globals.css)

**Nunca use cores hardcoded** como `bg-orange-500`. Use sempre os tokens semânticos.

```css
:root {
  --primary: 22 100% 52%;        /* Laranja Optsolv */
  --secondary: 222 47% 11%;      /* Azul-marinho */
  --accent: 22 100% 96%;         /* Laranja claro hover */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;
  --border: 220 13% 91%;
  --ring: 22 100% 52%;           /* Foco = laranja */
  --destructive: 0 84% 60%;
  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --financial-positive: 142 71% 45%;
  --financial-negative: 0 84% 60%;
  --financial-warning: 38 92% 50%;
  --radius: 0.625rem;
}
```

### Tipografia

- **Sans**: `Inter` (`@fontsource/inter`) — textos gerais.
- **Display**: `Manrope` (`@fontsource/manrope`) — headings da landing.
- **Mono**: `JetBrains Mono` (`@fontsource/jetbrains-mono`) — valores numéricos com `tabular-nums`.

### shadcn/ui

Os primitivos ficam em `src/shared/components/ui/`. **Não os modifique.**
Crie composições em `src/shared/components/` ou dentro da feature.

Para instalar novo componente:
```bash
pnpm --filter @optsolv/web dlx shadcn@latest add <componente>
```

---

## 5. Roteamento

```
/                       → Landing (pública)
/login                  → Login
/register               → Registro
/app                    → Layout autenticado (ProtectedRoute)
/app/dashboard          → Dashboard
/app/projetos           → Matriz de projetos
/app/projetos/:id       → Detalhe do projeto
/app/tarefas            → Kanban de tarefas
/app/recursos           → Colaboradores
/app/configuracoes      → Configurações
```

- Rotas protegidas usam `ProtectedRoute` + `RoleGuard`.
- Lazy loading com `React.lazy` para rotas pesadas.

---

## 6. Estado

| Tipo | Solução |
|---|---|
| Dados do servidor | TanStack Query — chaves: `['entity', filters?]` |
| UI global (sidebar, tema) | Zustand slice |
| Formulários | React Hook Form + Zod resolver |
| Estado local efêmero | `useState` / `useReducer` |

**Não use Context API** para estado que muda frequentemente.

Schemas Zod vêm de `@optsolv/shared` — nunca recrie localmente o que já existe lá.

---

## 7. HTTP Client

```ts
import { http } from '@/shared/lib/http';

// Sempre tipado — nunca use fetch diretamente
const { data } = await http.get<Project[]>('/projects');
const { data } = await http.post<Project>('/projects', payload);
```

---

## 8. Padrões de componente

```tsx
// Componente "burro" — só renderiza
interface TaskCardProps {
  task: Task;
  onEdit: (id: string) => void;
}
export function TaskCard({ task, onEdit }: TaskCardProps) { ... }

// Hook separado — contém a lógica
export function useTaskActions(taskId: string) {
  const updateMutation = useMutation({ ... });
  return { updateMutation };
}
```

### Naming

| Artefato | Convenção |
|---|---|
| Componente | `PascalCase.tsx` |
| Hook | `useAlgo.ts` |
| Store Zustand | `useAlgoStore.ts` |
| Utilitário | `camelCase.ts` |
| Types | `PascalCase` (prefira `type` sobre `interface`) |

### Regras

- Máximo ~150 linhas por componente. Se passar, divida.
- Máximo 4 props separadas — acima disso, use objeto.
- Composição > props drilling.
- Lógica em custom hooks, UI em componentes.

---

## 9. Acessibilidade e UX

- `aria-label` em botões de ícone sem texto.
- `alt` em todas as imagens.
- Foco visível em todos os interativos (`focus-visible:ring-2`).
- Animações respeitam `prefers-reduced-motion`.
- Toast (sonner) em todas as mutações (sucesso e erro).
- Skeletons fiéis ao layout final.
- Contraste WCAG AA em todos os textos.

---

## 10. Anti-padrões — nunca faça

- ❌ `any` ou `as X` para silenciar TS.
- ❌ `useEffect` para lógica derivada (use `useMemo`).
- ❌ Hardcode de cor fora dos tokens semânticos.
- ❌ Importar uma feature de outra feature diretamente.
- ❌ Duplicar schema Zod que já existe em `@optsolv/shared`.
- ❌ `console.log` em código de produção.
- ❌ Esquecer `pt-BR` em datas e moedas.
- ❌ Esquecer `tabular-nums` em colunas numéricas.
- ❌ Componente com mais de 200 linhas sem dividir.

---

## 11. Scripts

```bash
pnpm --filter @optsolv/web dev         # dev server
pnpm --filter @optsolv/web build       # produção
pnpm --filter @optsolv/web typecheck   # TypeScript
pnpm --filter @optsolv/web lint        # Biome
pnpm --filter @optsolv/web test        # Vitest
```

---

## 12. Checklist antes de marcar como pronto

- [ ] `typecheck` — zero erros.
- [ ] `lint` — zero erros/warnings.
- [ ] `test` — todos passam.
- [ ] Sem `any` ou `as`.
- [ ] Loading, erro e empty state tratados.
- [ ] Toast em mutações.
- [ ] Responsivo (mobile, tablet, desktop).
- [ ] Dark mode funcional.
- [ ] Navegação por teclado.
- [ ] `aria-label` em botões de ícone.
