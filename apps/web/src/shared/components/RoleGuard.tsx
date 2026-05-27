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

// Hook for programmatic checks
export function useHasPermission(module: string): boolean {
  const role = useActiveRole();
  const permissions = useRoleStore((s) => s.permissions);
  return permissions[module] ? permissions[module].includes(role) : false;
}

// Filter nav items based on role
export function useAllowedNavItems<T extends { to: string }>(items: readonly T[]): T[] {
  const role = useActiveRole();
  const permissions = useRoleStore((s) => s.permissions);
  return items.filter((item) => {
    const segment = item.to.split('/').pop() ?? '';
    const allowed = permissions[segment];
    return allowed ? allowed.includes(role) : false;
  });
}
