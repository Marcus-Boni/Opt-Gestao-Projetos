import type { FastifyInstance } from 'fastify';
import { requireSession } from '../../plugins/auth';
import {
  type CreateResourceDto,
  type GetResourcesFilter,
  ResourcesService,
  type UpdateResourceDto,
} from './resources.service';

export async function resourcesRoutes(app: FastifyInstance) {
  const service = new ResourcesService();

  app.get<{ Querystring: GetResourcesFilter }>(
    '/api/resources',
    { preHandler: requireSession },
    async (req, reply) => {
      const filters = req.query;
      if (typeof filters.active === 'string') {
        filters.active = filters.active === 'true';
      }
      const result = await service.listResources(filters);
      return reply.send(result);
    },
  );

  app.post<{ Body: CreateResourceDto }>(
    '/api/resources',
    { preHandler: requireSession },
    async (req, reply) => {
      const data = req.body;
      const newResource = await service.createResource(data);
      return reply.status(201).send(newResource);
    },
  );

  app.put<{ Params: { id: string }; Body: UpdateResourceDto }>(
    '/api/resources/:id',
    { preHandler: requireSession },
    async (req, reply) => {
      const { id } = req.params;
      const data = req.body;
      const updated = await service.updateResource(id, data);
      return reply.send(updated);
    },
  );

  app.post<{ Params: { id: string }; Body: { resourceId: string } }>(
    '/api/projects/:id/resources',
    { preHandler: requireSession },
    async (req, reply) => {
      const { id } = req.params;
      const { resourceId } = req.body;
      await service.linkResourceToProject(id, resourceId);
      return reply.status(204).send();
    },
  );

  app.delete<{ Params: { id: string; resourceId: string } }>(
    '/api/projects/:id/resources/:resourceId',
    { preHandler: requireSession },
    async (req, reply) => {
      const { id, resourceId } = req.params;
      await service.unlinkResourceFromProject(id, resourceId);
      return reply.status(204).send();
    },
  );
}
