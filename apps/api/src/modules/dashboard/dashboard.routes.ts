import type { FastifyInstance } from 'fastify';
import { requireSession } from '../../plugins/auth';
import { DashboardService } from './dashboard.service';

export async function dashboardRoutes(app: FastifyInstance) {
  const service = new DashboardService();

  app.get('/api/dashboard', { preHandler: requireSession }, async (_req, reply) => {
    const data = await service.getDashboard();
    return reply.send(data);
  });
}
