import {
  clients,
  db,
  projectFinanceMonthly,
  projectResources,
  projects,
  resources,
  tasks,
  user,
} from '@optsolv/db';
import { and, eq, ilike } from 'drizzle-orm';
import {
  collaboratorFixtures,
  type FinanceMonthFixture,
  financeMonthFixtures,
  projectFixtures,
  timeEntryFixtures,
} from './project.fixtures';

export type ProjectFilters = {
  year?: number | undefined;
  month?: number | undefined;
};

export class ProjectRepository {
  async findManyDb(
    filters: {
      search?: string | undefined;
      clientId?: string | undefined;
      status?: string | undefined;
      active?: boolean | undefined;
    } = {},
  ) {
    const conditions = [];
    if (filters.search) {
      conditions.push(ilike(projects.name, `%${filters.search}%`));
    }
    if (filters.clientId) {
      conditions.push(eq(projects.clientId, filters.clientId));
    }
    if (filters.status) {
      conditions.push(
        eq(
          projects.status,
          filters.status as 'no_prazo' | 'alerta' | 'critico' | 'concluido' | 'cancelado',
        ),
      );
    }
    if (filters.active !== undefined) {
      conditions.push(eq(projects.active, filters.active));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db
      .select({
        project: projects,
        clientName: clients.name,
        managerName: user.name,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .leftJoin(user, eq(projects.managerId, user.id))
      .where(whereClause)
      .orderBy(projects.name);
  }

  async findByIdDb(id: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return project ?? null;
  }

  async createDb(data: typeof projects.$inferInsert) {
    const [newProject] = await db.insert(projects).values(data).returning();
    return newProject;
  }

  async updateDb(id: string, data: Partial<typeof projects.$inferInsert>) {
    const [updated] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async findProjects() {
    const list = await db
      .select({
        id: projects.id,
        clientId: projects.clientId,
        clientName: clients.name,
        clientTaxId: clients.taxId,
        name: projects.name,
        code: projects.code,
        startDate: projects.startDate,
        endDate: projects.endDate,
        status: projects.status,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id));

    return list.map((item) => ({
      id: item.id,
      clientId: item.clientId,
      clientName: item.clientName || 'Cliente Sem Nome',
      clientTaxId: item.clientTaxId,
      name: item.name,
      code: item.code,
      startDate: item.startDate ? item.startDate.toISOString().split('T')[0] : null,
      endDate: item.endDate ? item.endDate.toISOString().split('T')[0] : null,
      status: (item.status === 'no_prazo' || item.status === 'concluido' ? 'active' : 'paused') as
        | 'active'
        | 'paused'
        | 'completed'
        | 'cancelled',
      scope: 'Desenvolvimento',
    }));
  }

  async findFinanceMonths(filters: ProjectFilters): Promise<FinanceMonthFixture[]> {
    const conditions = [];
    if (filters.year !== undefined) {
      conditions.push(eq(projectFinanceMonthly.year, filters.year));
    }
    if (filters.month !== undefined) {
      conditions.push(eq(projectFinanceMonthly.month, filters.month));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const list = await db.select().from(projectFinanceMonthly).where(whereClause);

    return list.map((m) => ({
      id: m.id,
      projectId: m.projectId,
      year: m.year,
      month: m.month,
      revenue: Math.round(Number(m.revenue)),
      expenses: Math.round(Number(m.expenses)),
      commissions: Math.round(Number(m.commissions)),
      taxes: Math.round(Number(m.taxes)),
      harvestCost: Math.round(Number(m.harvestCost)),
      budget: Math.round(Number(m.budgetMonth)),
      hours: Number(m.hours),
    }));
  }

  async findProject(projectId: string) {
    const [item] = await db
      .select({
        id: projects.id,
        clientId: projects.clientId,
        clientName: clients.name,
        clientTaxId: clients.taxId,
        name: projects.name,
        code: projects.code,
        startDate: projects.startDate,
        endDate: projects.endDate,
        status: projects.status,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!item) return null;

    return {
      id: item.id,
      clientId: item.clientId,
      clientName: item.clientName || 'Cliente Sem Nome',
      clientTaxId: item.clientTaxId,
      name: item.name,
      code: item.code,
      startDate: item.startDate ? item.startDate.toISOString().split('T')[0] : null,
      endDate: item.endDate ? item.endDate.toISOString().split('T')[0] : null,
      status: (item.status === 'no_prazo' || item.status === 'concluido' ? 'active' : 'paused') as
        | 'active'
        | 'paused'
        | 'completed'
        | 'cancelled',
      scope: 'Desenvolvimento',
    };
  }

  async findCollaborators(projectId: string) {
    const list = await db
      .select({
        id: projectResources.id,
        name: resources.name,
        role: resources.role,
        hours: projectResources.hoursActual,
        costPerHour: resources.costPerHour,
      })
      .from(projectResources)
      .innerJoin(resources, eq(projectResources.resourceId, resources.id))
      .where(eq(projectResources.projectId, projectId));

    return list.map((item) => {
      const hoursVal = Number(item.hours || 0);
      const costVal = Number(item.costPerHour || 0);
      return {
        id: item.id,
        projectId,
        name: item.name,
        role: item.role,
        hours: hoursVal,
        cost: Math.round(hoursVal * costVal),
      };
    });
  }

  async findTimeEntries(projectId: string) {
    const list = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        createdAt: tasks.createdAt,
        resourceName: resources.name,
      })
      .from(tasks)
      .leftJoin(resources, eq(tasks.assigneeId, resources.id))
      .where(eq(tasks.projectId, projectId));

    if (list.length > 0) {
      return list.map((t, idx) => ({
        id: t.id,
        projectId,
        date: (t.createdAt || new Date()).toISOString().split('T')[0],
        collaborator: t.resourceName || 'Ana Ribeiro',
        task: t.title,
        hours: 4 + (idx % 4),
        billable: idx % 2 === 0,
      }));
    }

    return timeEntryFixtures.filter((item) => item.projectId === projectId);
  }
}
