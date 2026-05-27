import type { projects } from '@optsolv/db';
import {
  calculateFinanceSummary,
  type FinanceInput,
  type FinanceSummary,
  sumFinance,
} from '@optsolv/shared';
import type {
  MatrixClientDto,
  MatrixMonthDto,
  MatrixProjectDto,
  ProjectDetailResponseDto,
  ProjectsMatrixResponseDto,
} from '@optsolv/shared/schemas';
import { type ProjectFilters, ProjectRepository } from './project.repository';

type ProjectServiceOptions = {
  repository?: ProjectRepository;
};

function toFinanceInput(input: {
  revenue: number;
  expenses: number;
  commissions: number;
  taxes: number;
  harvestCost: number;
  budget: number;
  hours: number;
}): FinanceInput {
  return input;
}

function emptySummary(): FinanceSummary {
  return sumFinance([]);
}

export class ProjectService {
  private readonly repository: ProjectRepository;

  constructor(options: ProjectServiceOptions = {}) {
    this.repository = options.repository ?? new ProjectRepository();
  }

  async listProjectsAdmin(filters: {
    search?: string | undefined;
    clientId?: string | undefined;
    status?: string | undefined;
    active?: boolean | undefined;
  }) {
    return this.repository.findManyDb(filters);
  }

  async createProject(
    data: Omit<typeof projects.$inferInsert, 'id' | 'active'> & {
      status?: typeof projects.$inferInsert.status;
    },
  ) {
    return this.repository.createDb({
      ...data,
      active: true,
      status: data.status ?? 'no_prazo',
    });
  }

  async updateProject(id: string, data: Partial<typeof projects.$inferInsert>) {
    const existing = await this.repository.findByIdDb(id);
    if (!existing) {
      throw new Error('Projeto não encontrado');
    }
    return this.repository.updateDb(id, data);
  }

  async getMatrix(filters: ProjectFilters): Promise<ProjectsMatrixResponseDto> {
    const [projects, financeMonths] = await Promise.all([
      this.repository.findProjects(),
      this.repository.findFinanceMonths(filters),
    ]);

    const clientsMap = new Map<string, MatrixClientDto>();

    for (const project of projects) {
      const projectMonths = financeMonths
        .filter((month) => month.projectId === project.id)
        .map<MatrixMonthDto>((month) => ({
          id: month.id,
          year: month.year,
          month: month.month,
          ...calculateFinanceSummary(toFinanceInput(month)),
        }));

      if (projectMonths.length === 0) continue;

      const projectSummary = sumFinance(projectMonths);
      const matrixProject: MatrixProjectDto = {
        id: project.id,
        name: project.name,
        code: project.code,
        startDate: project.startDate || null,
        endDate: project.endDate || null,
        status: project.status,
        months: projectMonths,
        ...projectSummary,
      };

      const currentClient =
        clientsMap.get(project.clientId) ??
        ({
          id: project.clientId,
          name: project.clientName,
          taxId: project.clientTaxId,
          projects: [],
          ...emptySummary(),
        } satisfies MatrixClientDto);

      currentClient.projects = [...currentClient.projects, matrixProject];
      const clientSummary = sumFinance(currentClient.projects);
      clientsMap.set(project.clientId, {
        ...currentClient,
        ...clientSummary,
      });
    }

    const clients = Array.from(clientsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return {
      filters: {
        year: filters.year ?? null,
        month: filters.month ?? null,
      },
      clients,
      total: sumFinance(clients),
    };
  }

  async getProjectDetail(projectId: string): Promise<ProjectDetailResponseDto | null> {
    const project = await this.repository.findProject(projectId);
    if (!project) return null;

    const matrix = await this.getMatrix({});
    const client = matrix.clients.find((item) => item.id === project.clientId);
    const matrixProject = client?.projects.find((item) => item.id === projectId);
    if (!matrixProject) return null;

    const [collaborators, timeEntries] = await Promise.all([
      this.repository.findCollaborators(projectId),
      this.repository.findTimeEntries(projectId),
    ]);

    return {
      ...matrixProject,
      client: {
        id: project.clientId,
        name: project.clientName,
      },
      collaborators: collaborators.map(({ projectId: _projectId, ...item }) => item),
      timeEntries: timeEntries.map(({ projectId: _projectId, ...item }) => item),
    };
  }
}
