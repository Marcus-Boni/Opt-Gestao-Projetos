import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireSession } from '../../plugins/auth';
import { ProjectController } from './project.controller';
import { ProjectCenterService } from './project-center.service';

export async function projectRoutes(app: FastifyInstance) {
  const controller = new ProjectController();
  const centerService = new ProjectCenterService();

  app.get('/api/projects', { preHandler: requireSession }, async (req, reply) => {
    const { search, clientId, status, active } = req.query as {
      search?: string;
      clientId?: string;
      status?: string;
      active?: string;
    };
    const activeFilter = active === 'true' ? true : active === 'false' ? false : undefined;
    const result = await controller.service.listProjectsAdmin({
      search,
      clientId,
      status,
      active: activeFilter,
    });
    return reply.send(result);
  });

  const projectPayloadSchema = z.object({
    name: z.string().min(2),
    clientId: z.string().uuid(),
    code: z.string().optional().nullable(),
    type: z
      .enum(['desenvolvimento', 'sustentação', 'implantação', 'consultoria'])
      .optional()
      .nullable(),
    status: z
      .enum(['no_prazo', 'alerta', 'critico', 'concluido', 'cancelado'])
      .optional()
      .nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    managerId: z.string().optional().nullable(),
    budget: z.coerce.number().optional().nullable(),
    contractPrice: z.coerce.number().optional().nullable(),
    active: z.boolean().optional(),
  });

  app.post('/api/projects', { preHandler: requireSession }, async (req, reply) => {
    const body = projectPayloadSchema.parse(req.body);
    const newProj = await controller.service.createProject({
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      budget: body.budget ? body.budget.toString() : null,
      contractPrice: body.contractPrice ? body.contractPrice.toString() : null,
    });
    return reply.status(201).send(newProj);
  });

  app.put('/api/projects/:id', { preHandler: requireSession }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = projectPayloadSchema.partial().parse(req.body);
    const updateData: Record<string, unknown> = { ...body };
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    if (body.budget !== undefined) updateData.budget = body.budget ? body.budget.toString() : null;
    if (body.contractPrice !== undefined)
      updateData.contractPrice = body.contractPrice ? body.contractPrice.toString() : null;

    const updated = await controller.service.updateProject(
      id,
      updateData as Parameters<typeof controller.service.updateProject>[1],
    );
    return reply.send(updated);
  });

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
