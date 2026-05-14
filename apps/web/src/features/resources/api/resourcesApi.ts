import { http } from '@/shared/lib/http';

export type ResourceStatus = 'disponivel' | 'alocado' | 'sobrecarga';

export type ResourceDto = {
  id: string;
  name: string;
  role: string;
  email: string | null;
  skills: string[];
  utilizationPercent: number;
  status: ResourceStatus;
  costPerHour: number | null;
};

export type ResourcesDto = {
  resources: ResourceDto[];
  avgUtilization: number;
  availableCount: number;
  overloadedCount: number;
};

export async function fetchResources(): Promise<ResourcesDto> {
  const response = await http.get<ResourcesDto>('/api/resources');
  return response.data;
}
