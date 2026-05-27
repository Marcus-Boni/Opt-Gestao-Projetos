import { clients, db, projects, user } from '@optsolv/db';
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
    return projectFixtures;
  }

  async findFinanceMonths(filters: ProjectFilters): Promise<FinanceMonthFixture[]> {
    return financeMonthFixtures.filter((month) => {
      const yearMatches = filters.year === undefined || month.year === filters.year;
      const monthMatches = filters.month === undefined || month.month === filters.month;
      return yearMatches && monthMatches;
    });
  }

  async findProject(projectId: string) {
    return projectFixtures.find((project) => project.id === projectId) ?? null;
  }

  async findCollaborators(projectId: string) {
    return collaboratorFixtures.filter((item) => item.projectId === projectId);
  }

  async findTimeEntries(projectId: string) {
    return timeEntryFixtures.filter((item) => item.projectId === projectId);
  }
}
