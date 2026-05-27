import { db, user } from '@optsolv/db';
import type { FastifyInstance } from 'fastify';
import { requireSession } from '../../plugins/auth';

export async function usersRoutes(app: FastifyInstance) {
  app.get('/api/users', { preHandler: requireSession }, async (_req, reply) => {
    const list = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .orderBy(user.name);
    return reply.send(list);
  });
}
