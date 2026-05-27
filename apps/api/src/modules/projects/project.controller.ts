import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { ProjectService } from './project.service';

const matrixQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

const projectParamsSchema = z.object({
  projectId: z.string().min(1),
});

export class ProjectController {
  readonly service = new ProjectService();

  getMatrix = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = matrixQuerySchema.parse(request.query);
    const matrix = await this.service.getMatrix(query);
    return reply.send(matrix);
  };

  getDetail = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = projectParamsSchema.parse(request.params);
    const detail = await this.service.getProjectDetail(params.projectId);

    if (!detail) {
      return reply.status(404).send({ message: 'Projeto nao encontrado' });
    }

    return reply.send(detail);
  };
}
