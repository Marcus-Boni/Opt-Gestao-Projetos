import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { AppShellSkeleton } from '@/shared/components/StateViews';
import { authClient } from '@/shared/lib/auth-client';
import { getAuthRedirectTarget, userCanAccessApp } from '@/shared/lib/auth-guards';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const session = authClient.useSession();
  const navigate = useNavigate();
  const location = useRouterState({ select: (state) => state.location });
  const pathnameWithSearch = `${location.pathname}${location.searchStr}`;
  const canAccess = userCanAccessApp(session.data);

  useEffect(() => {
    if (session.isPending || canAccess) return;
    navigate({ to: getAuthRedirectTarget(pathnameWithSearch), replace: true });
  }, [canAccess, navigate, pathnameWithSearch, session.isPending]);

  if (session.isPending || !canAccess) return <AppShellSkeleton />;
  return children;
}
