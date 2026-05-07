import type { FastifyError, FastifyInstance } from 'fastify';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    app.log.error(error);

    const statusCode = error.statusCode ?? 500;
    const message = statusCode < 500 ? error.message : 'Internal Server Error';

    reply.status(statusCode).send({ error: message });
  });
}
