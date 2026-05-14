import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useEffect } from 'react';
import { hasPermission, useRoleStore } from '@/shared/stores/roleStore';

type RoleGuardProps = {
  module: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function RoleGuard({ module, children, fallback }: RoleGuardProps) {
  const role = useRoleStore((s) => s.role);
  const navigate = useNavigate();
  const allowed = hasPermission(role, module);

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
  const role = useRoleStore((s) => s.role);
  return hasPermission(role, module);
}

// Filter nav items based on role
export function useAllowedNavItems<T extends { to: string }>(items: readonly T[]): T[] {
  const role = useRoleStore((s) => s.role);
  return items.filter((item) => {
    const segment = item.to.split('/').pop() ?? '';
    return hasPermission(role, segment);
  });
}
