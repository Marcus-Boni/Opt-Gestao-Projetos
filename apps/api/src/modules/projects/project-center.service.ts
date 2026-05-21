import { calculateFinanceSummary } from '@optsolv/shared';
import {
  backlogFixtures,
  collaboratorFixtures,
  financeMonthFixtures,
  projectFixtures,
} from './project.fixtures';

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

function mapStatus(s: string) {
  const map: Record<string, string> = {
    active: 'no_prazo',
    paused: 'alerta',
    completed: 'concluido',
    cancelled: 'cancelado',
  };
  return map[s] ?? 'no_prazo';
}

export class ProjectCenterService {
  async getProjectCenter() {
    const projects = projectFixtures;
    const allMonths = financeMonthFixtures;

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

      return {
        id: project.id,
        name: project.name,
        code: project.code,
        clientName: project.clientName,
        status: mapStatus(project.status),
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
    const project = projectFixtures.find((p) => p.id === projectId);
    if (!project) return null;

    const months = financeMonthFixtures.filter((m) => m.projectId === projectId);
    const team = collaboratorFixtures.filter((c) => c.projectId === projectId);
    const backlog = backlogFixtures.filter((b) => b.projectId === projectId);

    const totals = months.reduce(
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

    const monthlyFinance = months.map((m) => {
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

    return {
      id: project.id,
      name: project.name,
      code: project.code,
      scope: project.scope,
      clientName: project.clientName,
      status: mapStatus(project.status),
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
