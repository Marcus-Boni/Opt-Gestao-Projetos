import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { type ComponentType, lazy, Suspense } from 'react';
import { ForbiddenPage } from '@/pages/system/ForbiddenPage';
import { NotFoundPage } from '@/pages/system/NotFoundPage';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { AuthPageSkeleton, LoadingState } from '@/shared/components/StateViews';
import { AppShell } from './layouts/AppShell';

function withSuspense(Component: ComponentType) {
  return function SuspendedRoute() {
    return (
      <Suspense
        fallback={
          <div className="p-5">
            <LoadingState />
          </div>
        }
      >
        <Component />
      </Suspense>
    );
  };
}

function withAuthSuspense(Component: ComponentType) {
  return function SuspendedAuthRoute() {
    return (
      <Suspense fallback={<AuthPageSkeleton />}>
        <Component />
      </Suspense>
    );
  };
}

// Lazy page imports
const LandingPage = lazy(() =>
  import('@/pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const TasksPage = lazy(() =>
  import('@/pages/tasks/TasksPage').then((m) => ({ default: m.TasksPage })),
);
const ProjectsPage = lazy(() =>
  import('@/pages/projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
);
const ProjectCreateEditPage = lazy(() =>
  import('@/pages/projects/ProjectCreateEditPage').then((m) => ({
    default: m.ProjectCreateEditPage,
  })),
);
const ProjectDetailPage = lazy(() =>
  import('@/pages/project-detail/ProjectDetailPage').then((m) => ({
    default: m.ProjectDetailPage,
  })),
);
const FinanceiroPage = lazy(() =>
  import('@/pages/financeiro/FinanceiroPage').then((m) => ({ default: m.FinanceiroPage })),
);
const ReportsPage = lazy(() =>
  import('@/pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })),
);
const ResourcesPage = lazy(() =>
  import('@/pages/resources/ResourcesPage').then((m) => ({ default: m.ResourcesPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

// Route tree
const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: withSuspense(LandingPage),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: withAuthSuspense(LoginPage),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: withAuthSuspense(RegisterPage),
});

const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sem-permissao',
  component: ForbiddenPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: () => (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/dashboard',
  component: withSuspense(DashboardPage),
});

const tasksRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/tarefas',
  component: withSuspense(TasksPage),
});

const projectsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/projetos',
  component: withSuspense(ProjectsPage),
});

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

const projectDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/projetos/$projectId',
  component: withSuspense(ProjectDetailPage),
});

const financeiroRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/financeiro',
  component: withSuspense(FinanceiroPage),
});

const reportsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/relatorios',
  component: withSuspense(ReportsPage),
});

const resourcesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/recursos',
  component: withSuspense(ResourcesPage),
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/configuracoes',
  component: withSuspense(SettingsPage),
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  forbiddenRoute,
  appRoute.addChildren([
    dashboardRoute,
    tasksRoute,
    projectsRoute,
    projectCreateRoute,
    projectEditRoute,
    projectDetailRoute,
    financeiroRoute,
    reportsRoute,
    resourcesRoute,
    settingsRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFoundPage,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
