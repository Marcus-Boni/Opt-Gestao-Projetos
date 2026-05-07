import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { HelloPage } from '@/pages/hello/HelloPage';

const rootRoute = createRootRoute();

const helloRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HelloPage,
});

const routeTree = rootRoute.addChildren([helloRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
