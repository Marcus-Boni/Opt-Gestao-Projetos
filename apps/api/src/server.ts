import Fastify from 'fastify';
import { env } from './config/env';
import { registerCors } from './plugins/cors';
import { dbPlugin } from './plugins/db';
import { registerErrorHandler } from './plugins/error-handler';
import { registerHelmet } from './plugins/helmet';
import { registerSwagger } from './plugins/swagger';
import { healthRoutes } from './modules/health/health.routes';

export async function buildServer() {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  });

  registerErrorHandler(app);
  await registerHelmet(app);
  await registerCors(app);
  await registerSwagger(app);
  await app.register(dbPlugin);
  await app.register(healthRoutes);

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = await buildServer();
  await server.listen({ port: env.API_PORT, host: '0.0.0.0' });
  console.log(`API rodando em http://localhost:${env.API_PORT}`);
}
