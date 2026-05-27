import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireSession } from '../../plugins/auth';
import { ClientsService } from './clients.service';

const createClientSchema = z.object({
  name: z.string().min(2),
  taxId: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable().or(z.literal('')),
  externalId: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

const updateClientSchema = createClientSchema.partial();

export async function clientsRoutes(app: FastifyInstance) {
  const service = new ClientsService();

  app.get('/api/clients', { preHandler: requireSession }, async (req, reply) => {
    const { search, active } = req.query as { search?: string; active?: string };
    const activeFilter = active === 'true' ? true : active === 'false' ? false : undefined;
    const result = await service.listClients({ search, active: activeFilter });
    return reply.send(result);
  });

  app.post('/api/clients', { preHandler: requireSession }, async (req, reply) => {
    const body = createClientSchema.parse(req.body);
    const newClient = await service.createClient(body);
    return reply.status(201).send(newClient);
  });

  app.put('/api/clients/:id', { preHandler: requireSession }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = updateClientSchema.parse(req.body);
    const updated = await service.updateClient(
      id,
      body as Parameters<typeof service.updateClient>[1],
    );
    return reply.send(updated);
  });
}
