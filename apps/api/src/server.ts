import { pathToFileURL } from 'node:url';
import Fastify from 'fastify';
import { env } from './config/env';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { healthRoutes } from './modules/health/health.routes';
import { projectRoutes } from './modules/projects/project.routes';
import { resourcesRoutes } from './modules/resources/resources.routes';
import { tasksRoutes } from './modules/tasks/tasks.routes';
import { registerAuth } from './plugins/auth';
import { registerCors } from './plugins/cors';
import { dbPlugin } from './plugins/db';
import { registerErrorHandler } from './plugins/error-handler';
import { registerHelmet } from './plugins/helmet';
import { registerRateLimit } from './plugins/rate-limit';
import { registerSwagger } from './plugins/swagger';

export async function buildServer() {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  });

  registerErrorHandler(app);
  await registerHelmet(app);
  await registerCors(app);
  await registerRateLimit(app);
  await registerSwagger(app);
  await app.register(dbPlugin);
  await registerAuth(app);
  await app.register(healthRoutes);
  await app.register(projectRoutes);
  await app.register(dashboardRoutes);
  await app.register(tasksRoutes);
  await app.register(resourcesRoutes);

  return app;
}

const entrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;

if (import.meta.url === entrypoint) {
  const server = await buildServer();
  await server.listen({ port: env.API_PORT, host: '0.0.0.0' });
  server.log.info(`API rodando em http://localhost:${env.API_PORT}`);
}
