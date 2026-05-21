import { http } from '@/shared/lib/http';

export type ProjectStatus = 'no_prazo' | 'alerta' | 'critico' | 'concluido' | 'cancelado';

export type ProjectListItemDto = {
  id: string;
  name: string;
  code: string | null;
  clientName: string;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  managerName: string;
  progressPlanned: number;
  progressActual: number;
  budgetTotal: number;
  budgetUsed: number;
  budgetUsedPercent: number;
  durationMonths: number;
  scope: string;
};

export type ProjectGroupedByManager = {
  managerName: string;
  projects: ProjectListItemDto[];
};

export type ProjectCenterDto = {
  groups: ProjectGroupedByManager[];
  totalCount: number;
};

export type ProjectDetailTabDto = {
  id: string;
  name: string;
  code: string | null;
  scope: string | null;
  clientName: string;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  managerName: string;
  progressPlanned: number;
  progressActual: number;
  budgetTotal: number;
  budgetUsed: number;
  contractPrice: number;
  marginPercent: number | null;
  scheduleDeviationPercent: number | null;
  team: Array<{ name: string; role: string; hoursPlanned: number; hoursActual: number }>;
  monthlyFinance: Array<{
    month: string;
    revenue: number;
    cost: number;
    margin: number;
  }>;
  backlog: Array<{
    id: string;
    type: 'Epic' | 'Feature' | 'PBI';
    title: string;
    progress: number;
    estimatedHours: number;
    actualHours: number;
    status: 'Em andamento' | 'Concluído' | 'Atrasado';
  }>;
};

export async function fetchProjectCenter(): Promise<ProjectCenterDto> {
  const response = await http.get<ProjectCenterDto>('/api/projects/center');
  return response.data;
}

export async function fetchProjectDetailFull(projectId: string): Promise<ProjectDetailTabDto> {
  const response = await http.get<ProjectDetailTabDto>(`/api/projects/${projectId}/detail`);
  return response.data;
}
