import { calculateFinanceSummary } from '@optsolv/shared';
import { ProjectRepository } from './project.repository';

const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function durationMonths(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30)));
}

export class ProjectCenterService {
  private readonly repository = new ProjectRepository();

  async getProjectCenter() {
    const projects = await this.repository.findProjects();
    const allMonths = await this.repository.findFinanceMonths({});

    const projectData = projects.map((project) => {
      const months = allMonths.filter((m) => m.projectId === project.id);
      const totals = months.reduce(
        (acc, m) => ({
          revenue: acc.revenue + m.revenue,
          harvestCost: acc.harvestCost + m.harvestCost,
          budget: acc.budget + m.budget,
        }),
        { revenue: 0, harvestCost: 0, budget: 0 },
      );
      const budgetUsedPercent = totals.budget > 0 ? (totals.harvestCost / totals.budget) * 100 : 0;

      // Status mapping from static fixture to database format
      const statusMap: Record<string, string> = {
        active: 'no_prazo',
        paused: 'alerta',
        completed: 'concluido',
        cancelled: 'cancelado',
      };
      const displayStatus = statusMap[project.status] ?? project.status;

      return {
        id: project.id,
        name: project.name,
        code: project.code,
        clientName: project.clientName,
        status: displayStatus,
        startDate: project.startDate,
        endDate: project.endDate,
        managerName: 'Maria Olivia',
        progressPlanned: 65,
        progressActual: budgetUsedPercent > 70 ? 50 : 70,
        budgetTotal: totals.budget,
        budgetUsed: totals.harvestCost,
        budgetUsedPercent,
        durationMonths: durationMonths(project.startDate, project.endDate),
        scope: project.scope,
      };
    });

    return {
      groups: [{ managerName: 'Maria Olivia', projects: projectData }],
      totalCount: projects.length,
    };
  }

  async getProjectDetailFull(projectId: string) {
    const project = await this.repository.findProject(projectId);
    if (!project) return null;

    const allMonths = await this.repository.findFinanceMonths({});
    const projectMonths = allMonths.filter((m) => m.projectId === projectId);
    const team = await this.repository.findCollaborators(projectId);
    const backlog = await this.repository.findBacklog(projectId);

    const totals = projectMonths.reduce(
      (acc, m) => ({
        revenue: acc.revenue + m.revenue,
        expenses: acc.expenses + m.expenses,
        commissions: acc.commissions + m.commissions,
        taxes: acc.taxes + m.taxes,
        harvestCost: acc.harvestCost + m.harvestCost,
        budget: acc.budget + m.budget,
        hours: acc.hours + m.hours,
      }),
      { revenue: 0, expenses: 0, commissions: 0, taxes: 0, harvestCost: 0, budget: 0, hours: 0 },
    );

    const summary = calculateFinanceSummary(totals);

    const monthlyFinance = projectMonths.map((m) => {
      const ms = calculateFinanceSummary({
        revenue: m.revenue,
        expenses: m.expenses,
        commissions: m.commissions,
        taxes: m.taxes,
        harvestCost: m.harvestCost,
        budget: m.budget,
        hours: m.hours,
      });
      return {
        month: MONTH_LABELS[m.month - 1] ?? String(m.month),
        revenue: m.revenue,
        cost: m.harvestCost,
        margin: ms.marginValue,
      };
    });

    const statusMap: Record<string, string> = {
      active: 'no_prazo',
      paused: 'alerta',
      completed: 'concluido',
      cancelled: 'cancelado',
    };
    const displayStatus = statusMap[project.status] ?? project.status;

    return {
      id: project.id,
      name: project.name,
      code: project.code,
      scope: project.scope,
      clientName: project.clientName,
      status: displayStatus,
      startDate: project.startDate,
      endDate: project.endDate,
      managerName: 'Gestora PMS',
      progressPlanned: 65,
      progressActual: 70,
      budgetTotal: totals.budget,
      budgetUsed: totals.harvestCost,
      contractPrice: totals.revenue,
      marginPercent: summary.marginPercent,
      scheduleDeviationPercent: 5,
      team: team.map((c) => ({
        name: c.name,
        role: c.role,
        hoursPlanned: Math.round(c.hours * 1.15),
        hoursActual: c.hours,
      })),
      monthlyFinance,
      backlog: backlog.map((b) => ({
        id: b.id,
        type: b.type,
        title: b.title,
        progress: b.progress,
        estimatedHours: b.estimatedHours,
        actualHours: b.actualHours,
        status: b.status,
      })),
    };
  }
}
