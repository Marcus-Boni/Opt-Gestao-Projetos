# Settings Access Tab Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static read-only "Acesso" settings tab into a fully interactive and integrated access control dashboard, enabling real-time permission toggles and user role assignment.

**Architecture:**
- **Zustand State**: Upgrade `roleStore.ts` to manage dynamic module permissions and a user-role mapping persistent in LocalStorage.
- **Reactive UI**: Modify `RoleGuard.tsx` to react to permission changes dynamically, hiding navigation items and blocking routes in real-time.
- **Interactive Matrix**: Convert the matrix table into a checkbox grid with state changes and a "Reset to default" button.
- **User Roles Manager**: Render a list of system users (fetched from database via `/api/users`) and add a dropdown to assign roles (Admin, Gerente, Usuário) persistent in LocalStorage mapping.

---

### Task 1: Store & Core Guards - Dynamic Permissions
Upgrade the Zustand store and Role guards to be reactive to permissions.

**Files:**
- Modify: `apps/web/src/shared/stores/roleStore.ts`
- Modify: `apps/web/src/shared/components/RoleGuard.tsx`

- [ ] **Step 1.1: Refactor roleStore.ts**
  Support reactive permissions and client-side user role mappings.
  ```typescript
  // apps/web/src/shared/stores/roleStore.ts
  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';

  export type UserRole = 'admin' | 'gerente' | 'usuario';

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
    role: UserRole;
    setRole: (role: UserRole) => void;
    permissions: Record<string, UserRole[]>;
    togglePermission: (module: string, role: UserRole) => void;
    resetPermissions: () => void;
    userRoles: Record<string, UserRole>; // persists custom user role assignments
    setUserRole: (userId: string, role: UserRole) => void;
  };

  export const useRoleStore = create<RoleStore>()(
    persist(
      (set, get) => ({
        role: 'admin',
        setRole: (role) => set({ role }),
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

  export function hasPermission(role: UserRole, module: string): boolean {
    const permissions = useRoleStore.getState().permissions;
    const allowed = permissions[module];
    return allowed ? allowed.includes(role) : false;
  }
  ```

- [ ] **Step 1.2: Refactor RoleGuard.tsx**
  Modify RoleGuard and hooks to reactive Zustand selectors.
  ```typescript
  // apps/web/src/shared/components/RoleGuard.tsx
  import { useNavigate } from '@tanstack/react-router';
  import { type ReactNode, useEffect } from 'react';
  import { useRoleStore } from '@/shared/stores/roleStore';

  type RoleGuardProps = {
    module: string;
    children: ReactNode;
    fallback?: ReactNode;
  };

  export function RoleGuard({ module, children, fallback }: RoleGuardProps) {
    const role = useRoleStore((s) => s.role);
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
    const role = useRoleStore((s) => s.role);
    const permissions = useRoleStore((s) => s.permissions);
    return permissions[module] ? permissions[module].includes(role) : false;
  }

  export function useAllowedNavItems<T extends { to: string }>(items: readonly T[]): T[] {
    const role = useRoleStore((s) => s.role);
    const permissions = useRoleStore((s) => s.permissions);
    return items.filter((item) => {
      const segment = item.to.split('/').pop() ?? '';
      const allowed = permissions[segment];
      return allowed ? allowed.includes(role) : false;
    });
  }
  ```

---

### Task 2: Access Tab UI Redesign
Build the fully interactive, responsive access tab with user role selection.

**Files:**
- Modify: `apps/web/src/pages/settings/SettingsPage.tsx`

- [ ] **Step 2.1: Re-implement AccessTab Component**
  Replace the static simulator with an editable permission checkbox matrix and user roles manager list.
  ```tsx
  // apps/web/src/pages/settings/SettingsPage.tsx
  // Add imports at top:
  import { useUsers } from '@/features/settings/hooks/useProjectsAdmin';
  import { Switch } from '@/shared/components/ui/switch';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
  import { Badge } from '@/shared/components/ui/badge';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

  // Replace AccessTab implementation:
  function AccessTab() {
    const { role, setRole, permissions, togglePermission, resetPermissions, userRoles, setUserRole } = useRoleStore();
    const { data: usersList, isLoading } = useUsers();

    const modules = [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'tarefas', label: 'Minhas Tarefas' },
      { key: 'projetos', label: 'Project Center' },
      { key: 'financeiro', label: 'Financeiro' },
      { key: 'relatorios', label: 'Relatórios' },
      { key: 'recursos', label: 'Recursos' },
      { key: 'configuracoes', label: 'Configurações' },
    ];

    const roles: UserRole[] = ['admin', 'gerente', 'usuario'];

    return (
      <div className="flex flex-col gap-6">
        {/* Simulador */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Perfil Ativo (Simulação Local)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              Alterne o perfil ativo para experimentar permissões de navegação em tempo real nas outras abas e no menu principal.
            </p>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    toast.success(`Perfil simulado: ${ROLE_LABELS[r]}`);
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    role === r
                      ? 'border-primary bg-primary text-primary-foreground font-semibold'
                      : 'border-border bg-background hover:bg-muted'
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
          </CardContent>
        </Card>

        {/* Dynamic Permission Matrix */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Matriz de Permissões</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Defina em tempo real quais perfis têm acesso a cada módulo do sistema PMS.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => {
              resetPermissions();
              toast.success('Permissões restauradas aos valores padrão');
            }}>
              Restaurar Padrões
            </Button>
          </CardHeader>
          <CardContent className="p-0 border-t mt-2">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Módulo
                    </th>
                    {roles.map((r) => (
                      <th key={r} className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                        {ROLE_LABELS[r]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((m) => (
                    <tr key={m.key} className="border-b last:border-b-0 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3.5 font-medium">{m.label}</td>
                      {roles.map((r) => {
                        const isAllowed = permissions[m.key]?.includes(r) ?? false;
                        return (
                          <td key={r} className="px-4 py-3.5 text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={isAllowed}
                                onCheckedChange={() => {
                                  togglePermission(m.key, r);
                                  toast.info(`Permissão do perfil ${ROLE_LABELS[r]} alterada para o módulo ${m.label}`);
                                }}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* User Roles Administration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Atribuição de Perfis a Usuários</CardTitle>
            <p className="text-xs text-muted-foreground">
              Vincule perfis de permissão aos usuários registrados no sistema PMS.
            </p>
          </CardHeader>
          <CardContent className="p-0 border-t">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil Atual</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Carregando usuários...
                      </TableCell>
                    </TableRow>
                  ) : !usersList || usersList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    usersList.map((u) => {
                      const userRole = userRoles[u.id] || 'usuario';
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name || '-'}</TableCell>
                          <TableCell>{u.email || '-'}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                userRole === 'admin'
                                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25'
                                  : userRole === 'gerente'
                                    ? 'bg-blue-500/10 text-blue-700 border-blue-500/25'
                                    : 'bg-slate-500/10 text-slate-700 border-slate-500/25'
                              }
                            >
                              {ROLE_LABELS[userRole]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Select
                                value={userRole}
                                onValueChange={(val: UserRole) => {
                                  setUserRole(u.id, val);
                                  toast.success(`Perfil de ${u.name || u.email} atualizado para ${ROLE_LABELS[val]}`);
                                }}
                              >
                                <SelectTrigger className="w-[180px]">
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

---

### Task 3: Verification & Compilation
Ensure everything is fully compiled and linted.

- [ ] **Step 3.1: Run TypeScript typecheck**
  Run: `pnpm typecheck`
  Expected: Success.

- [ ] **Step 3.2: Run Biome Lint**
  Run: `pnpm lint`
  Expected: Success.
