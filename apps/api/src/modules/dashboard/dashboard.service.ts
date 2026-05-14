import { calculateFinanceSummary } from '@optsolv/shared';
import {
  collaboratorFixtures,
  financeMonthFixtures,
  projectFixtures,
} from '../projects/project.fixtures';

function getProjectStatus(marginPct: number | null, budgetUsedPct: number, progressActual: number) {
  if (marginPct !== null && marginPct < 0) return 'critical';
  if (budgetUsedPct > 85 && progressActual < 50) return 'critical';
  if (marginPct !== null && marginPct < 0.05) return 'alert';
  if (budgetUsedPct > 70) return 'alert';
  return 'ok';
}

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

export class DashboardService {
  async getDashboard() {
    const projects = projectFixtures;
    const allMonths = financeMonthFixtures;
    const allCollaborators = collaboratorFixtures;

    // Aggregate per project
    const projectSummaries = projects.map((project) => {
      const months = allMonths.filter((m) => m.projectId === project.id);
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
      const budgetUsedPct = totals.budget > 0 ? (totals.harvestCost / totals.budget) * 100 : 0;
      const status = getProjectStatus(summary.marginPercent, budgetUsedPct, 60);
      return { project, totals, summary, budgetUsedPct, status };
    });

    // KPIs
    const totalRevenue = projectSummaries.reduce((s, p) => s + p.totals.revenue, 0);
    const totalCost = projectSummaries.reduce((s, p) => s + p.totals.harvestCost, 0);
    const criticalCount = projectSummaries.filter((p) => p.status === 'critical').length;

    const totalHours = allCollaborators.reduce((s, c) => s + c.hours, 0);
    // Assume 8h/day * 22 days * N resources; rough util
    const utilizationRate = Math.min((totalHours / (allCollaborators.length * 8 * 22)) * 100, 120);

    // Portfolio health
    const onTrack = projectSummaries.filter((p) => p.status === 'ok').length;
    const alert = projectSummaries.filter((p) => p.status === 'alert').length;
    const critical = projectSummaries.filter((p) => p.status === 'critical').length;

    // Budget monthly — aggregate by month across all projects
    const monthlyMap = new Map<number, { planned: number; actual: number }>();
    for (const m of allMonths) {
      const entry = monthlyMap.get(m.month) ?? { planned: 0, actual: 0 };
      entry.planned += m.budget;
      entry.actual += m.harvestCost;
      monthlyMap.set(m.month, entry);
    }
    const budgetMonthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([month, data]) => ({
        month: MONTH_LABELS[month - 1] ?? String(month),
        planned: data.planned,
        actual: data.actual,
      }));

    // Critical alerts
    const criticalAlerts = projectSummaries
      .filter((p) => p.status !== 'ok')
      .map((p) => ({
        projectId: p.project.id,
        projectName: p.project.name,
        clientName: p.project.clientName,
        reason:
          p.summary.marginPercent !== null && p.summary.marginPercent < 0
            ? `Margem negativa: ${(p.summary.marginPercent * 100).toFixed(1)}%`
            : `Budget consumido: ${p.budgetUsedPct.toFixed(0)}%`,
        severity: p.status as 'alert' | 'critical',
      }));

    // Budget ranking
    const budgetRanking = projectSummaries
      .sort((a, b) => b.budgetUsedPct - a.budgetUsedPct)
      .map((p) => ({
        projectId: p.project.id,
        projectName: p.project.name,
        clientName: p.project.clientName,
        budgetTotal: p.totals.budget,
        budgetUsed: p.totals.harvestCost,
        usedPercent: p.budgetUsedPct,
        status: p.status as 'ok' | 'alert' | 'critical',
      }));

    return {
      kpis: {
        totalProjects: projects.length,
        criticalProjects: criticalCount,
        utilizationRate: Number.isNaN(utilizationRate) ? 0 : utilizationRate,
        totalRevenue,
        totalCost,
      },
      portfolioHealth: { onTrack, alert, critical, total: projects.length },
      budgetMonthly,
      criticalAlerts,
      budgetRanking,
    };
  }
}
