import type { FastifyInstance } from 'fastify';
import { requireSession } from '../../plugins/auth';
import { ProjectController } from './project.controller';
import { ProjectCenterService } from './project-center.service';

export async function projectRoutes(app: FastifyInstance) {
  const controller = new ProjectController();
  const centerService = new ProjectCenterService();

  app.get('/api/projects/matrix', { preHandler: requireSession }, controller.getMatrix);

  app.get('/api/projects/center', { preHandler: requireSession }, async (_req, reply) => {
    const data = await centerService.getProjectCenter();
    return reply.send(data);
  });

  app.get('/api/projects/:projectId/detail', { preHandler: requireSession }, async (req, reply) => {
    const { projectId } = req.params as { projectId: string };
    const data = await centerService.getProjectDetailFull(projectId);
    if (!data) return reply.status(404).send({ error: 'Project not found' });
    return reply.send(data);
  });

  app.get('/api/projects/:projectId', { preHandler: requireSession }, controller.getDetail);
}
