import { http } from '@/shared/lib/http';

export type PortfolioHealthDto = {
  onTrack: number;
  alert: number;
  critical: number;
  total: number;
};

export type BudgetMonthlyDto = {
  month: string;
  planned: number;
  actual: number;
};

export type CriticalAlertDto = {
  projectId: string;
  projectName: string;
  clientName: string;
  reason: string;
  severity: 'alert' | 'critical';
};

export type BudgetRankingItemDto = {
  projectId: string;
  projectName: string;
  clientName: string;
  budgetTotal: number;
  budgetUsed: number;
  usedPercent: number;
  status: 'ok' | 'alert' | 'critical';
};

export type DashboardKpisDto = {
  totalProjects: number;
  criticalProjects: number;
  utilizationRate: number;
  totalRevenue: number;
  totalCost: number;
};

export type DashboardDto = {
  kpis: DashboardKpisDto;
  portfolioHealth: PortfolioHealthDto;
  budgetMonthly: BudgetMonthlyDto[];
  criticalAlerts: CriticalAlertDto[];
  budgetRanking: BudgetRankingItemDto[];
};

export async function fetchDashboard(): Promise<DashboardDto> {
  const response = await http.get<DashboardDto>('/api/dashboard');
  return response.data;
}
