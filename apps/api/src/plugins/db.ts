import type { Database } from '@optsolv/db';
import { db } from '@optsolv/db';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

export const dbPlugin = fp(async (app: FastifyInstance) => {
  app.decorate('db', db);
});
