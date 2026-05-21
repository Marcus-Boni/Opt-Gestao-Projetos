import { db, projectResources, resources } from '@optsolv/db';
import { and, eq, ilike, inArray, sql } from 'drizzle-orm';

export type GetResourcesFilter = {
  search?: string;
  role?: string;
  active?: boolean;
  projectId?: string;
};

export type CreateResourceDto = {
  name: string;
  role: string;
  email?: string;
  skills?: string[];
  costPerHour?: number;
  projectIds?: string[];
};

export type UpdateResourceDto = Partial<CreateResourceDto> & {
  active?: boolean;
};

export class ResourcesService {
  async listResources(filters: GetResourcesFilter = {}) {
    const conditions = [];

    if (filters.search) {
      conditions.push(ilike(resources.name, `%${filters.search}%`));
    }
    if (filters.role) {
      conditions.push(eq(resources.role, filters.role));
    }
    if (filters.active !== undefined) {
      conditions.push(eq(resources.active, filters.active));
    }

    if (filters.projectId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        filters.projectId,
      );
      if (!isUuid) {
        return {
          resources: [],
          avgUtilization: 0,
          availableCount: 0,
          overloadedCount: 0,
        };
      }

      conditions.push(
        inArray(
          resources.id,
          db
            .select({ id: projectResources.resourceId })
            .from(projectResources)
            .where(eq(projectResources.projectId, filters.projectId)),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allResources = await db
      .select({
        resource: resources,
        totalHours: sql<number>`COALESCE(SUM(${projectResources.hoursPlanned}), 0)::int`,
      })
      .from(resources)
      .leftJoin(projectResources, eq(resources.id, projectResources.resourceId))
      .where(whereClause)
      .groupBy(resources.id)
      .orderBy(resources.name);

    const result = allResources.map(({ resource, totalHours }) => {
      const capacity = 8 * 22; // approx monthly capacity
      const utilizationPercent = Math.round((totalHours / capacity) * 100);
      const status = !resource.active
        ? 'inativo'
        : utilizationPercent > 100
          ? 'sobrecarga'
          : utilizationPercent > 40
            ? 'alocado'
            : 'disponivel';

      return {
        ...resource,
        utilizationPercent,
        status: status as 'disponivel' | 'alocado' | 'sobrecarga' | 'inativo',
        costPerHour: resource.costPerHour ? Number(resource.costPerHour) : 0,
      };
    });

    const activeResources = result.filter((r) => r.active);
    const avgUtilization =
      activeResources.length > 0
        ? activeResources.reduce((s, r) => s + r.utilizationPercent, 0) / activeResources.length
        : 0;

    const availableCount = activeResources.filter((r) => r.status === 'disponivel').length;
    const overloadedCount = activeResources.filter((r) => r.status === 'sobrecarga').length;

    return {
      resources: result,
      avgUtilization,
      availableCount,
      overloadedCount,
    };
  }

  async createResource(data: CreateResourceDto) {
    const [newResource] = await db
      .insert(resources)
      .values({
        name: data.name,
        role: data.role,
        email: data.email,
        skills: data.skills || [],
        costPerHour: data.costPerHour ? data.costPerHour.toString() : null,
        active: true,
      })
      .returning();

    if (!newResource) {
      throw new Error('Falha ao criar o recurso.');
    }

    if (data.projectIds && data.projectIds.length > 0) {
      await db.insert(projectResources).values(
        data.projectIds.map((projectId) => ({
          projectId,
          resourceId: newResource.id,
        })),
      );
    }

    return newResource;
  }

  async updateResource(id: string, data: UpdateResourceDto) {
    const updateData: Partial<typeof resources.$inferInsert> & { updatedAt?: Date } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.costPerHour !== undefined) updateData.costPerHour = data.costPerHour?.toString();

    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(resources)
      .set(updateData)
      .where(eq(resources.id, id))
      .returning();

    if (data.projectIds !== undefined) {
      // replace project relationships
      await db.delete(projectResources).where(eq(projectResources.resourceId, id));
      if (data.projectIds.length > 0) {
        await db.insert(projectResources).values(
          data.projectIds.map((projectId) => ({
            projectId,
            resourceId: id,
          })),
        );
      }
    }

    return updated;
  }

  async linkResourceToProject(projectId: string, resourceId: string) {
    // Verifica se o vínculo já existe
    const existing = await db
      .select()
      .from(projectResources)
      .where(
        and(eq(projectResources.projectId, projectId), eq(projectResources.resourceId, resourceId)),
      );

    if (existing.length > 0) {
      return; // já vinculado, sem erro
    }

    await db.insert(projectResources).values({ projectId, resourceId });
  }

  async unlinkResourceFromProject(projectId: string, resourceId: string) {
    await db
      .delete(projectResources)
      .where(
        and(eq(projectResources.projectId, projectId), eq(projectResources.resourceId, resourceId)),
      );
  }
}
