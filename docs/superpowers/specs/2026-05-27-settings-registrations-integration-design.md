# Design Spec: Settings Page Integration and Registrations Tab (Clients, Projects, Resources)

**Date**: 2026-05-27  
**Status**: Approved  
**Topic**: Full settings integration, dynamic registrations (Clients, Projects, Resources), filters, forms, status toggles, and direct PostgreSQL backend integration via Drizzle.

---

## 1. Context & Goals
The objective is to integrate and complete the system settings page, introducing a robust administrative tab named "Cadastros" (Registrations). This tab will house three primary sub-tabs: **Clientes** (Clients), **Projetos** (Projects), and **Recursos** (Resources), enabling full creation, editing, status toggles (active/inactive), and dynamic filtering of each entity.

To avoid fake mock states and guarantee a fully functional system, Clientes, Projetos, and Recursos will integrate directly with the **real PostgreSQL database** via **Drizzle ORM** on the Fastify backend.

---

## 2. Architectural Design & Layout

### 2.1 Tab Layout in SettingsPage.tsx
We will add a fourth tab to the main `SettingsPage.tsx` next to *Acesso*, *Integrações*, and *Sistema*:
- **Cadastros** (`value="registrations"`)
  - Displays a clean wrapper card with an internal sub-tab system:
    - **Clientes**: A list table of clients, filter controls, creation button.
    - **Projetos**: A list table of projects, custom dropdowns for Client, Manager, Status, and Active states, creation button.
    - **Recursos**: A list table of resources, filter controls, creation button.

### 2.2 Reusability & DRY Principles
- **Resources**: The frontend already contains `ResourceFormDialog` (`features/resources/components/ResourceFormDialog.tsx`) and the corresponding TanStack Query hooks. We will reuse these directly within the settings Recursos tab, eliminating duplicated form logic.
- **Form Architecture**: New client and project forms will use `react-hook-form` + `zod` validation, matching the aesthetics of the resource dialog (glassmorphism details, polished input layout, clean status switches).

---

## 3. Backend API Specifications

We will implement clean routes in Fastify matching the modular service/repository conventions of the `@optsolv/api` workspace.

### 3.1 Clients Module (`GET /api/clients`, `POST /api/clients`, `PUT /api/clients/:id`)
- **Repository**:
  - `findClients(filters)`: Query the `clients` table with optional `search` (ILike match on name) and `active` (boolean equal match). Order by name.
  - `createClient(data)`: Insert a new row in the `clients` table.
  - `updateClient(id, data)`: Update attributes (including `active` status) and set `updatedAt = new Date()`.
- **Service & Routes**:
  - Expose clean typed routes under `/api/clients`.
  - Validate payloads using Zod schemas.

### 3.2 Projects Module (`GET /api/projects`, `POST /api/projects`, `PUT /api/projects/:id`)
Extend the existing projects routes and service to add:
- **Repository / Database Operations**:
  - Query the Drizzle database tables `projects` joining `clients` (to fetch the client name) and `user` (to fetch the manager's name).
  - Add filters for `search` (ILike match on name or code), `clientId` (UUID match), `status` (exact match), and `active` (boolean match).
  - Create and update methods inserting directly into the database.
- **Status Mapping**:
  - Ensure projects are initialized and handled with consistent status values (`no_prazo` | `alerta` | `critico` | `concluido` | `cancelado`).

### 3.3 Users Module (`GET /api/users`)
- A fast backend route to list all users from the `user` table, returning `id`, `name`, and `email`, allowing users to be assigned as managers in the projects registration form.

---

## 4. Frontend Component Specifications (`apps/web`)

### 4.1 Client Components
- `ClientFormDialog.tsx`: Dialog with input fields for:
  - **Nome** (Text, required, min 2 chars)
  - **CNPJ/CPF** (Text, optional)
  - **Nome do Contato** (Text, optional)
  - **E-mail do Contato** (Email input, optional)
  - **ID Externo** (Text, optional, for future integrations)
  - **Ativo** (Switch, default true, only visible/editable during update)
- `ClientsTab.tsx`: Table listing clients with a filter bar (Search, Status: Todos/Ativo/Inativo), "Novo Cliente" button, and row actions to edit or quickly toggle active/inactive.

### 4.2 Project Components
- `ProjectFormDialog.tsx`: Dialog with input fields:
  - **Nome** (Text, required)
  - **Código** (Text, optional)
  - **Cliente** (Select dropdown, dynamically populated with active clients)
  - **Gerente** (Select dropdown, dynamically populated with users)
  - **Tipo** (Select enum: Desenvolvimento, Sustentação, Implantação, Consultoria)
  - **Status** (Select enum: No prazo, Alerta, Crítico, Concluído, Cancelado)
  - **Data de Início** / **Data de Fim** (Calendar picker or Date input)
  - **Orçamento (R$)** (Numeric input)
  - **Preço do Contrato (R$)** (Numeric input)
  - **Ativo** (Switch, default true, editable on update)
- `ProjectsTab.tsx`: Table listing projects with columns for *Código*, *Nome*, *Cliente*, *Gerente*, *Tipo*, *Status*, *Status Geral (Ativo/Inativo)*, and *Ações* (Edit, toggle active). Includes comprehensive filters (Search, Client, Status, Ativo/Inativo).

### 4.3 Resource Component
- `ResourcesTab.tsx`: List table reusing `ResourceFormDialog` and hooks. Filter controls for search, cargo, and active status. Fully dynamic integration.

---

## 5. Verification & Testing Plan
- **Automated Verification**:
  - Run typecheck and lint across frontend and backend (`pnpm validate`).
- **Manual Verification**:
  - Create, update, filter, and toggle status on Clients. Verify database persistence.
  - Create, update, filter, and toggle status on Projects. Verify manager and client associations.
  - Create, update, filter, and toggle status on Resources. Verify capacity allocation calculations.
