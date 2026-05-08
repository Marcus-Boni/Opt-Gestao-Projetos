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
