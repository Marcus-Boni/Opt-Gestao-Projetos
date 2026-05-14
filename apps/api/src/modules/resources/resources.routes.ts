import type { FastifyInstance } from 'fastify';
import { requireSession } from '../../plugins/auth';
import { collaboratorFixtures } from '../projects/project.fixtures';

export async function resourcesRoutes(app: FastifyInstance) {
  app.get('/api/resources', { preHandler: requireSession }, async (_req, reply) => {
    const uniqueResources = Array.from(
      new Map(collaboratorFixtures.map((c) => [c.name, c])).values(),
    );

    const resources = uniqueResources.map((c, index) => {
      const totalHours = collaboratorFixtures
        .filter((x) => x.name === c.name)
        .reduce((s, x) => s + x.hours, 0);
      const capacity = 8 * 22;
      const utilizationPercent = Math.round((totalHours / capacity) * 100);
      const status =
        utilizationPercent > 100
          ? 'sobrecarga'
          : utilizationPercent > 40
            ? 'alocado'
            : 'disponivel';

      const skillSets: string[][] = [
        ['React', 'TypeScript', 'Node.js', 'Azure'],
        ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
        ['React', 'Vue.js', 'CSS', 'Figma'],
        ['Python', 'Power BI', 'SQL', 'ETL'],
        ['DevOps', 'Azure', 'Terraform', 'CI/CD'],
      ];

      return {
        id: `res-${index}`,
        name: c.name,
        role: c.role,
        email: `${c.name.toLowerCase().replace(/\s/g, '.')}@optsolv.com.br`,
        skills: skillSets[index % skillSets.length] ?? [],
        utilizationPercent,
        status: status as 'disponivel' | 'alocado' | 'sobrecarga',
        costPerHour: 120 + index * 15,
      };
    });

    const avgUtilization =
      resources.reduce((s, r) => s + r.utilizationPercent, 0) / resources.length;
    const availableCount = resources.filter((r) => r.status === 'disponivel').length;
    const overloadedCount = resources.filter((r) => r.status === 'sobrecarga').length;

    return reply.send({ resources, avgUtilization, availableCount, overloadedCount });
  });
}
