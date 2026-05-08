import type { FastifyInstance } from 'fastify';
import { requireSession } from '../../plugins/auth';
import { ProjectController } from './project.controller';

export async function projectRoutes(app: FastifyInstance) {
  const controller = new ProjectController();

  app.get('/api/projects/matrix', { preHandler: requireSession }, controller.getMatrix);
  app.get('/api/projects/:projectId', { preHandler: requireSession }, controller.getDetail);
}
