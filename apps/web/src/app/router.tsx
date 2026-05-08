import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { type ComponentType, lazy, Suspense } from 'react';
import { PlaceholderPage } from '@/pages/placeholder/PlaceholderPage';
import { LoadingState } from '@/shared/components/StateViews';
import { AppShell } from './layouts/AppShell';

const LandingPage = lazy(() =>
  import('@/pages/landing/LandingPage').then((module) => ({ default: module.LandingPage })),
);
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })),
);
const ProjectsPage = lazy(() =>
  import('@/pages/projects/ProjectsPage').then((module) => ({ default: module.ProjectsPage })),
);
const ProjectDetailPage = lazy(() =>
  import('@/pages/project-detail/ProjectDetailPage').then((module) => ({
    default: module.ProjectDetailPage,
  })),
);

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

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: withSuspense(LandingPage),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: withSuspense(LoginPage),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: withSuspense(RegisterPage),
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: AppShell,
});

const projectsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/projetos',
  component: withSuspense(ProjectsPage),
});

const projectDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/projetos/$projectId',
  component: withSuspense(ProjectDetailPage),
});

const reportsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/relatorios',
  component: () => <PlaceholderPage title="Relatorios" />,
});

const collaboratorsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/colaboradores',
  component: () => <PlaceholderPage title="Colaboradores" />,
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/configuracoes',
  component: () => <PlaceholderPage title="Configuracoes" />,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  appRoute.addChildren([
    projectsRoute,
    projectDetailRoute,
    reportsRoute,
    collaboratorsRoute,
    settingsRoute,
  ]),
]);

export const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
