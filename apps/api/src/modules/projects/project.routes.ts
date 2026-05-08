import type { FastifyInstance } from 'fastify';
import { ProjectController } from './project.controller';

export async function projectRoutes(app: FastifyInstance) {
  const controller = new ProjectController();

  app.get('/api/projects/matrix', controller.getMatrix);
  app.get('/api/projects/:projectId', controller.getDetail);
}
