import { http } from '@/shared/lib/http';

export type ResourceStatus = 'disponivel' | 'alocado' | 'sobrecarga' | 'inativo';

export type ResourceDto = {
  id: string;
  name: string;
  role: string;
  email: string | null;
  skills: string[];
  utilizationPercent: number;
  status: ResourceStatus;
  costPerHour: number | null;
  active: boolean;
};

export type ResourcesDto = {
  resources: ResourceDto[];
  avgUtilization: number;
  availableCount: number;
  overloadedCount: number;
};

export type GetResourcesFilter = {
  search?: string;
  role?: string;
  active?: boolean;
  projectId?: string;
};

export type CreateResourceDto = {
  name: string;
  role: string;
  email?: string;
  skills?: string[];
  costPerHour?: number;
  projectIds?: string[];
};

export type UpdateResourceDto = Partial<CreateResourceDto> & {
  active?: boolean;
};

export async function fetchResources(filters?: GetResourcesFilter): Promise<ResourcesDto> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.role) params.append('role', filters.role);
  if (filters?.active !== undefined) params.append('active', String(filters.active));
  if (filters?.projectId) params.append('projectId', filters.projectId);

  const response = await http.get<ResourcesDto>(`/api/resources?${params.toString()}`);
  return response.data;
}

export async function createResource(data: CreateResourceDto): Promise<ResourceDto> {
  const response = await http.post<ResourceDto>('/api/resources', data);
  return response.data;
}

export async function updateResource({
  id,
  data,
}: {
  id: string;
  data: UpdateResourceDto;
}): Promise<ResourceDto> {
  const response = await http.put<ResourceDto>(`/api/resources/${id}`, data);
  return response.data;
}

export async function linkResourceToProject({
  projectId,
  resourceId,
}: {
  projectId: string;
  resourceId: string;
}): Promise<void> {
  await http.post(`/api/projects/${projectId}/resources`, { resourceId });
}

export async function unlinkResourceFromProject({
  projectId,
  resourceId,
}: {
  projectId: string;
  resourceId: string;
}): Promise<void> {
  await http.delete(`/api/projects/${projectId}/resources/${resourceId}`);
}
