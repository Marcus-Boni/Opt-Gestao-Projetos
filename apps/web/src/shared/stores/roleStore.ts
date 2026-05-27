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
  admin: 'Acesso completo a todos os módulos, incluindo Financeiro e Configurações.',
  gerente: 'Acesso a Dashboard, Projetos, Tarefas, Relatórios e Recursos.',
  usuario: 'Acesso somente leitura ao Dashboard.',
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
