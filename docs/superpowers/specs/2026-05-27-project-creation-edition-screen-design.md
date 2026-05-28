# Design Spec: Dedicated Project Creation and Editing Pages in Project Center

**Date**: 2026-05-27  
**Status**: Approved  
**Topic**: Dedicated screens for creating and editing projects, structured using a two-column responsive layout, live dynamic preview card, automatic margin calculation, sticky footer actions, and integration with PostgreSQL/Drizzle hooks.

---

## 1. Context & Goals

Currently, project administration (creation and editing) is confined to a dialog (`ProjectFormDialog`) within the administrative "Settings" page (`/app/configuracoes` -> Cadastros). To improve project management workflows, these capabilities will be promoted directly to the **Project Center**:
- A dedicated **Create Project** page at `/app/projetos/novo`.
- A dedicated **Edit Project** page at `/app/projetos/$projectId/editar`.

These pages will implement a high-fidelity, two-column layout with a live preview card that calculates project margins in real time, following modern UX best practices.

---

## 2. Architectural Design & Layout

### 2.1 Two-Column Responsive Grid (`grid-cols-1 lg:grid-cols-3`)

The layout features a main section split into:
1. **Left Column (Form Control - `lg:col-span-2`)**:
   Three elegant, distinct sections (Cards) grouping fields logically:
   - **Card 1: Identificação e Cliente**
     - *Nome do Projeto* (Input): Required string.
     - *Código do Projeto* (Input): Optional string (e.g., "PRJ-001").
     - *Cliente* (Select): Dropdown containing active clients.
     - *Tipo* (Select): Dropdown with values (`desenvolvimento` | `sustentação` | `implantação` | `consultoria`).
   - **Card 2: Liderança e Cronograma**
     - *Gerente Responsável* (Select): Dropdown of system users.
     - *Status* (Select): Dropdown with values (`no_prazo` | `alerta` | `critico` | `concluido` | `cancelado`).
     - *Data de Início* (Date Input) and *Data de Fim* (Date Input) side-by-side.
   - **Card 3: Orçamento e Configurações**
     - *Orçamento (R$)* (Numeric Input): Project budget limit.
     - *Preço do Contrato (R$)* (Numeric Input): Sales contract price.
     - *Ativo* (Switch): Boolean switch for active project state.

2. **Right Column (Live Preview Card - `lg:col-span-1`)**:
   A visually polished, glassmorphic card anchored on the right:
   - Displays the project name, code, client name, and manager name in real-time as they are typed.
   - **Dynamic Status Badge**: Colorful badge matching the status (e.g., emerald for `no_prazo`, amber for `alerta`, destructive for `critico`, blue for `concluido`).
   - **Estimated Financial Margin**:
     - Auto-calculates:
       $$\text{Margem Estimada} = \frac{\text{Preço do Contrato} - \text{Orçamento}}{\text{Preço do Contrato}} \times 100$$
     - Exhibits the gross margin value in BRL currency (`pt-BR`) and percent.
     - A dynamic progress bar indicating margin health: **Green** (Margin $\ge 20\%$), **Orange** ($0\% \le \text{Margin} < 20\%$), and **Red** ($\text{Margin} < 0\%$).

3. **Sticky Action Footer Bar**:
   - Fixed at the bottom of the viewport with desaturated background blur (`bg-background/80 backdrop-blur-md border-t px-6 py-4`).
   - Standard actions: "Cancelar" (returns to list or detail page) and "Salvar Projeto" (shows loading state spinner).

---

## 3. Route & Page Integration

We will define new routes in `apps/web/src/app/router.tsx`:
```typescript
const projectCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/projetos/novo',
  component: withSuspense(ProjectCreateEditPage),
});

const projectEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/projetos/$projectId/editar',
  component: withSuspense(ProjectCreateEditPage),
});
```

### 3.1 Entry Points
- **ProjectsPage (`/app/projetos`)**: Add a `"Novo Projeto"` button inside the page header.
- **ProjectDetailPage (`/app/projetos/$projectId`)**: Add an `"Editar"` button inside the header actions.

---

## 4. State Management & Form Specifications

### 4.1 Form Fields Schema
Using `react-hook-form` + `zodResolver`:
```typescript
const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  clientId: z.string().uuid('Selecione um cliente'),
  code: z.string().optional().or(z.literal('')),
  type: z.enum(['desenvolvimento', 'sustentação', 'implantação', 'consultoria']),
  status: z.enum(['no_prazo', 'alerta', 'critico', 'concluido', 'cancelado']),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  managerId: z.string().optional().or(z.literal('')),
  budget: z.coerce.number().min(0, 'O orçamento não pode ser negativo').optional(),
  contractPrice: z.coerce.number().min(0, 'O valor do contrato não pode ser negativo').optional(),
  active: z.boolean(),
});
```

### 4.2 Data Fetching & Mutations
- Fetch clients: `useClients({ active: true })`
- Fetch users: `useUsers()`
- Fetch single project: `useProjectsAdmin()` (finds matching ID in client-side cache)
- Submit changes:
  - Create: `useCreateProjectAdmin().mutateAsync`
  - Update: `useUpdateProjectAdmin().mutateAsync`
- Feedback: Use `toast.success` / `toast.error` via `sonner`.

---

## 5. Verification & Testing Plan

### 5.1 Automated Verification
- Run static checks across monorepo workspaces:
  - `pnpm validate` (lint + typecheck)

### 5.2 Manual Verification
- **Creation Flow**: Go to `/app/projetos/novo`, fill in fields, verify live preview updates margins, click save, verify redirect and list updates.
- **Editing Flow**: Go to `/app/projetos/$projectId/editar`, verify form pre-fills, alter fields, check margin bar color changes, click save, verify detail updates.
