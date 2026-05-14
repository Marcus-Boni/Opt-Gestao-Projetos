import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'gerente' | 'usuario';

type RoleStore = {
  role: UserRole;
  setRole: (role: UserRole) => void;
};

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      role: 'usuario',
      setRole: (role) => set({ role }),
    }),
    { name: 'optsolv-role' },
  ),
);

// Permission map: which roles can access which modules
export const MODULE_PERMISSIONS: Record<string, UserRole[]> = {
  dashboard: ['admin', 'gerente', 'usuario'],
  tarefas: ['admin', 'gerente'],
  projetos: ['admin', 'gerente'],
  financeiro: ['admin'],
  relatorios: ['admin', 'gerente'],
  recursos: ['admin', 'gerente'],
  configuracoes: ['admin'],
};

export function hasPermission(role: UserRole, module: string): boolean {
  const allowed = MODULE_PERMISSIONS[module];
  return allowed ? allowed.includes(role) : false;
}
