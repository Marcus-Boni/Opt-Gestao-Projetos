# Access Tab Premium & Integrated Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Settings page access tab into a premium administrative control dashboard integrated with the active session and featuring a global simulation mode banner.

**Architecture:** 
- **Zustand & Hook**: Upgrade `roleStore.ts` with simulation properties and a React hook `useActiveRole` that resolves session-based permissions.
- **Global Layout Banner**: Render a premium full-width simulation warning alert in `AppShell.tsx`.
- **Administrative Settings UI**: Overhaul `SettingsPage.tsx` with a categorized module matrix, filtered team directory search, and simulation toggles.

**Tech Stack:** React 18, Vite, Zustand 4, better-auth, Tailwind CSS 4, Lucide React, shadcn/ui.

---

### Task 1: Store Upgrades & Active Role Resolving

**Files:**
- Modify: `apps/web/src/shared/stores/roleStore.ts`

- [ ] **Step 1.1: Implement store simulation fields and `useActiveRole` hook**
  Modify `apps/web/src/shared/stores/roleStore.ts` to include `simulatedRole`, `setSimulatedRole`, and export `useActiveRole` which integrates with `authClient` session.

  Replace the content of `apps/web/src/shared/stores/roleStore.ts` with:
  ```typescript
  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';
  import { authClient } from '@/shared/lib/auth-client';

  export type UserRole = 'admin' | 'gerente' | 'usuario';

  export const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador / GP',
    gerente: 'Gerente',
    usuario: 'Usuário',
  };

  export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    admin: 'Acesso total a todas as áreas, relatórios financeiros e configurações do sistema.',
    gerente: 'Acesso operacional completo, gestão de projetos e equipes, sem acesso a configurações gerais.',
    usuario: 'Acesso limitado às suas próprias tarefas e visualização básica de projetos autorizados.',
  };

  export const DEFAULT_PERMISSIONS: Record<string, UserRole[]> = {
    dashboard: ['admin', 'gerente', 'usuario'],
    tarefas: ['admin', 'gerente'],
    projetos: ['admin', 'gerente'],
    financeiro: ['admin'],
    relatorios: ['admin', 'gerente'],
    recursos: ['admin', 'gerente'],
    configuracoes: ['admin'],
  };

  type RoleStore = {
    role: UserRole; // Fallback / legacy state
    setRole: (role: UserRole) => void;
    simulatedRole: UserRole | null;
    setSimulatedRole: (role: UserRole | null) => void;
    permissions: Record<string, UserRole[]>;
    togglePermission: (module: string, role: UserRole) => void;
    resetPermissions: () => void;
    userRoles: Record<string, UserRole>;
    setUserRole: (userId: string, role: UserRole) => void;
  };

  export const useRoleStore = create<RoleStore>()(
    persist(
      (set, get) => ({
        role: 'admin',
        setRole: (role) => set({ role }),
        simulatedRole: null,
        setSimulatedRole: (simulatedRole) => set({ simulatedRole }),
        permissions: { ...DEFAULT_PERMISSIONS },
        togglePermission: (module, role) => {
          const current = { ...get().permissions };
          const list = current[module] || [];
          if (list.includes(role)) {
            current[module] = list.filter((r) => r !== role);
          } else {
            current[module] = [...list, role];
          }
          set({ permissions: current });
        },
        resetPermissions: () => set({ permissions: { ...DEFAULT_PERMISSIONS } }),
        userRoles: {},
        setUserRole: (userId, role) => {
          const current = { ...get().userRoles };
          current[userId] = role;
          set({ userRoles: current });
        },
      }),
      { name: 'optsolv-role' },
    ),
  );

  export function useActiveRole(): UserRole {
    const session = authClient.useSession();
    const userId = session.data?.user?.id;

    return useRoleStore((s) => {
      const realRole = userId
        ? s.userRoles[userId] || (Object.keys(s.userRoles).length === 0 ? 'admin' : 'usuario')
        : 'usuario';

      if (realRole === 'admin' && s.simulatedRole) {
        return s.simulatedRole;
      }
      return realRole;
    });
  }

  export function hasPermission(role: UserRole, module: string): boolean {
    const permissions = useRoleStore.getState().permissions;
    const allowed = permissions[module];
    return allowed ? allowed.includes(role) : false;
  }
  ```

- [ ] **Step 1.2: Verify file builds**
  Run: `pnpm --filter @optsolv/web typecheck`
  Expected: Success.

---

### Task 2: Live Permission Guards Integration

**Files:**
- Modify: `apps/web/src/shared/components/RoleGuard.tsx`

- [ ] **Step 2.1: Update guards to consume `useActiveRole`**
  Modify `apps/web/src/shared/components/RoleGuard.tsx` to read the active role reactively from the session state via the new hook.

  Replace the contents of `apps/web/src/shared/components/RoleGuard.tsx` with:
  ```typescript
  import { useNavigate } from '@tanstack/react-router';
  import { type ReactNode, useEffect } from 'react';
  import { useActiveRole, useRoleStore } from '@/shared/stores/roleStore';

  type RoleGuardProps = {
    module: string;
    children: ReactNode;
    fallback?: ReactNode;
  };

  export function RoleGuard({ module, children, fallback }: RoleGuardProps) {
    const role = useActiveRole();
    const permissions = useRoleStore((s) => s.permissions);
    const allowed = permissions[module] ? permissions[module].includes(role) : false;
    const navigate = useNavigate();

    useEffect(() => {
      if (!allowed && !fallback) {
        navigate({ to: '/sem-permissao', replace: true });
      }
    }, [allowed, fallback, navigate]);

    if (!allowed) return fallback ?? null;
    return children;
  }

  export function useHasPermission(module: string): boolean {
    const role = useActiveRole();
    const permissions = useRoleStore((s) => s.permissions);
    return permissions[module] ? permissions[module].includes(role) : false;
  }

  export function useAllowedNavItems<T extends { to: string }>(items: readonly T[]): T[] {
    const role = useActiveRole();
    const permissions = useRoleStore((s) => s.permissions);
    return items.filter((item) => {
      const segment = item.to.split('/').pop() ?? '';
      const allowed = permissions[segment];
      return allowed ? allowed.includes(role) : false;
    });
  }
  ```

- [ ] **Step 2.2: Verify TypeScript checks**
  Run: `pnpm --filter @optsolv/web typecheck`
  Expected: Success.

---

### Task 3: Global Layout Simulation Alert Banner

**Files:**
- Modify: `apps/web/src/app/layouts/AppShell.tsx`

- [ ] **Step 3.1: Inject simulation banner layout component**
  Add visual warning bar on top of the layout in `AppShell.tsx` when `simulatedRole` is active.

  Locate `export function AppShell() {` inside `apps/web/src/app/layouts/AppShell.tsx` and integrate the banner. We need to import `useRoleStore`, `useActiveRole` and `ShieldAlert` icon.

  At the top imports of `apps/web/src/app/layouts/AppShell.tsx`, add:
  ```typescript
  import { useRoleStore } from '@/shared/stores/roleStore';
  import { ShieldAlert } from 'lucide-react';
  import { authClient } from '@/shared/lib/auth-client';
  ```

  Within `AppShell` function, find:
  ```typescript
  export function AppShell() {
    const { collapsed, mobileOpen, toggle, setMobileOpen } = useSidebarStore();
  ```

  And update it to:
  ```typescript
  export function AppShell() {
    const { collapsed, mobileOpen, toggle, setMobileOpen } = useSidebarStore();
    const session = authClient.useSession();
    const userId = session.data?.user?.id;
    
    const simulatedRole = useRoleStore((s) => s.simulatedRole);
    const setSimulatedRole = useRoleStore((s) => s.setSimulatedRole);
    const userRoles = useRoleStore((s) => s.userRoles);
    
    const realRole = userId 
      ? userRoles[userId] || (Object.keys(userRoles).length === 0 ? 'admin' : 'usuario')
      : 'usuario';

    const isSimulating = realRole === 'admin' && simulatedRole !== null;
    const roleLabel = simulatedRole === 'gerente' ? 'Gerente' : simulatedRole === 'usuario' ? 'Usuário' : 'Administrador';

    return (
      <div className="min-h-screen bg-muted/30 text-foreground flex flex-col">
        {/* Live Impersonation Banner */}
        {isSimulating && (
          <div className="w-full bg-amber-500/15 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 px-4 py-2 text-xs flex justify-between items-center font-medium shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>
                Você está visualizando o sistema PMS com as permissões de <strong>{roleLabel}</strong>.
              </span>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setSimulatedRole(null);
              }}
              className="h-6 px-2 text-[10px] border-amber-500/30 hover:bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold"
            >
              Voltar ao Perfil Real
            </Button>
          </div>
        )}

        <div className="flex flex-1 min-h-0">
          {/* Mobile overlay */}
          <AnimatePresence>
  ```

  *(Ensure that layout container wraps height appropriately).*

- [ ] **Step 3.2: Verify web layout compilation**
  Run: `pnpm --filter @optsolv/web typecheck`
  Expected: Success.

---

### Task 4: Premium Settings Access Tab Overhaul

**Files:**
- Modify: `apps/web/src/pages/settings/SettingsPage.tsx`

- [ ] **Step 4.1: Redesign the matrix, search filters, and simulator UI**
  We will replace `AccessTab` in `apps/web/src/pages/settings/SettingsPage.tsx` with a fully integrated workspace featuring:
  - Text search on team directories.
  - Dynamic user-profile filters.
  - Admin-only simulation switches.
  - Categorised modules Matrix view.

  Open `apps/web/src/pages/settings/SettingsPage.tsx` and import the new helper `useActiveRole`:
  ```typescript
  import { type UserRole, useRoleStore, useActiveRole, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/shared/stores/roleStore';
  import { Shield, ShieldAlert, Check, X, Search, Filter } from 'lucide-react';
  import { authClient } from '@/shared/lib/auth-client';
  ```

  Replace the `function AccessTab() { ... }` declaration entirely with:
  ```tsx
  function AccessTab() {
    const { simulatedRole, setSimulatedRole, permissions, togglePermission, resetPermissions, userRoles, setUserRole } =
      useRoleStore();
    const { data: usersList, isLoading } = useUsers();
    const session = authClient.useSession();
    const activeUserId = session.data?.user?.id;

    // Filters and search states for Directory
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

    const realRole = activeUserId
      ? userRoles[activeUserId] || (Object.keys(userRoles).length === 0 ? 'admin' : 'usuario')
      : 'usuario';

    const isAdmin = realRole === 'admin';

    const modules = [
      { key: 'dashboard', label: 'Dashboard', category: 'Operacional', desc: 'Resumo executivo do portfólio' },
      { key: 'tarefas', label: 'Minhas Tarefas', category: 'Operacional', desc: 'Kanban e listas de tarefas' },
      { key: 'projetos', label: 'Project Center', category: 'Gestão', desc: 'Gestão completa de projetos' },
      { key: 'financeiro', label: 'Financeiro', category: 'Gestão', desc: 'Controle de orçamentos e custos' },
      { key: 'relatorios', label: 'Relatórios', category: 'Gestão', desc: 'Status report e exportações' },
      { key: 'recursos', label: 'Recursos', category: 'Gestão', desc: 'Capacidade e alocação de equipes' },
      { key: 'configuracoes', label: 'Configurações', category: 'Configuração', desc: 'Administração de acessos e integrações' },
    ];

    const roles: UserRole[] = ['admin', 'gerente', 'usuario'];

    // Filtered users directory list
    const filteredUsers = (usersList || []).filter((u) => {
      const uRole = userRoles[u.id] || (Object.keys(userRoles).length === 0 && u.id === activeUserId ? 'admin' : 'usuario');
      const matchesSearch =
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || uRole === roleFilter;
      return matchesSearch && matchesRole;
    });

    const handleSimulationToggle = (r: UserRole) => {
      if (simulatedRole === r) {
        setSimulatedRole(null);
        toast.success('Retornado ao perfil real de Administrador');
      } else {
        setSimulatedRole(r);
        toast.success(`Simulando acesso como ${ROLE_LABELS[r]}`);
      }
    };

    return (
      <div className="flex flex-col gap-6">
        {/* Administrative Impersonation Panel */}
        {isAdmin ? (
          <Card className="overflow-hidden border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/[0.02]">
            <CardHeader className="pb-3 border-b border-amber-500/10">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <CardTitle className="text-sm font-semibold">Simulador Administrativo de Perfis</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Como Administrador, experimente as restrições e visualizações do sistema de cada perfil de acesso.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-3">
                {roles.map((r) => {
                  const isCurrent = simulatedRole === r || (simulatedRole === null && r === 'admin');
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleSimulationToggle(r)}
                      className={`flex-1 min-w-[150px] text-left p-3 rounded-lg border transition-all ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-medium ring-1 ring-amber-500'
                          : 'border-border bg-background hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider">{ROLE_LABELS[r]}</span>
                        {isCurrent && <Check className="size-3.5 text-amber-600 dark:text-amber-400 font-bold" />}
                      </div>
                      <p className="mt-1 text-[11px] leading-tight text-muted-foreground/90 font-normal">
                        {ROLE_DESCRIPTIONS[r]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/[0.02]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-blue-500" />
                <div>
                  <CardTitle className="text-sm font-medium">Seu Perfil de Acesso</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Você possui acesso operacional sob as diretrizes de <strong>{ROLE_LABELS[realRole]}</strong>.
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Dynamic Permission Matrix Layout */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-semibold">Matriz de Permissões de Perfis</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Defina em tempo real o que Administradores, Gerentes e Usuários podem visualizar no PMS.
              </p>
            </div>
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  resetPermissions();
                  toast.success('Permissões restauradas aos valores padrão');
                }}
                className="h-8 text-xs"
              >
                Restaurar Padrões
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 border-t">
            {['Operacional', 'Gestão', 'Configuração'].map((cat) => {
              const catModules = modules.filter((m) => m.category === cat);
              if (catModules.length === 0) return null;

              return (
                <div key={cat} className="border-b last:border-b-0 pb-4">
                  <div className="bg-muted/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b">
                    Categoria: {cat}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {catModules.map((m) => (
                      <div key={m.key} className="flex flex-col justify-between p-3.5 rounded-lg border bg-card shadow-sm hover:border-accent-foreground/10 transition-colors">
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{m.label}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-normal">{m.desc}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t flex items-center justify-between gap-1">
                          {roles.map((r) => {
                            const isAllowed = permissions[m.key]?.includes(r) ?? false;
                            return (
                              <button
                                key={r}
                                type="button"
                                disabled={!isAdmin}
                                onClick={() => {
                                  togglePermission(m.key, r);
                                  toast.info(`Permissão do perfil ${ROLE_LABELS[r]} alterada para o módulo ${m.label}`);
                                }}
                                className={`flex flex-col items-center flex-1 py-1 px-1.5 rounded transition-all text-center ${
                                  !isAdmin ? 'cursor-default' : 'hover:bg-muted'
                                }`}
                              >
                                <span className="text-[9px] font-medium text-muted-foreground uppercase mb-1">{r.substring(0, 3)}</span>
                                <div className={`size-5 rounded-full flex items-center justify-center border transition-colors ${
                                  isAllowed
                                    ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-600'
                                    : 'bg-destructive/5 border-destructive/20 text-destructive/70'
                                }`}>
                                  {isAllowed ? <Check className="size-3" /> : <X className="size-2.5" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Custom Interactive Directory List */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">Diretório de Perfis de Colaboradores</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gerencie a atribuição de permissões reais dos usuários cadastrados.
                </p>
              </div>

              {/* Filters Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar por nome/email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 w-[200px] pl-8 text-xs"
                  />
                </div>
                <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue placeholder="Filtrar Perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Perfis</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="usuario">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-xs">Colaborador</TableHead>
                    <TableHead className="text-xs">E-mail</TableHead>
                    <TableHead className="text-xs">Perfil Real</TableHead>
                    {isAdmin && <TableHead className="text-right text-xs">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-xs text-muted-foreground">
                        Carregando usuários...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-xs text-muted-foreground">
                        Nenhum colaborador encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => {
                      const uRole = userRoles[u.id] || (Object.keys(userRoles).length === 0 && u.id === activeUserId ? 'admin' : 'usuario');
                      return (
                        <TableRow key={u.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="font-semibold text-xs">{u.name || '-'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{u.email || '-'}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                uRole === 'admin'
                                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-400 dark:border-emerald-500/30'
                                  : uRole === 'gerente'
                                    ? 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-400 dark:border-blue-500/30'
                                    : 'bg-slate-500/10 text-slate-700 border-slate-500/25 dark:text-slate-400 dark:border-slate-500/30'
                              }
                            >
                              {ROLE_LABELS[uRole]}
                            </Badge>
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <div className="flex justify-end">
                                <Select
                                  value={uRole}
                                  onValueChange={(val: UserRole) => {
                                    setUserRole(u.id, val);
                                    toast.success(`Perfil de ${u.name || u.email} atualizado para ${ROLE_LABELS[val]}`);
                                  }}
                                >
                                  <SelectTrigger className="h-8 w-[150px] text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Administrador / GP</SelectItem>
                                    <SelectItem value="gerente">Gerente</SelectItem>
                                    <SelectItem value="usuario">Usuário</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  ```

- [ ] **Step 4.2: Verify full compilation**
  Run: `pnpm --filter @optsolv/web typecheck`
  Expected: Success.

---

### Task 5: Final Validation & Compilation Suite

- [ ] **Step 5.1: Run Full TypeScript Compiler Verification**
  Run: `pnpm typecheck`
  Expected: Success across all monorepo workspaces.

- [ ] **Step 5.2: Run Biome Lint Checks**
  Run: `pnpm lint`
  Expected: Success.
