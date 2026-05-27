import { http } from '@/shared/lib/http';

export type ProjectAdminDto = {
  project: {
    id: string;
    clientId: string;
    name: string;
    code: string | null;
    type: 'desenvolvimento' | 'sustentação' | 'implantação' | 'consultoria' | null;
    status: 'no_prazo' | 'alerta' | 'critico' | 'concluido' | 'cancelado';
    startDate: string | null;
    endDate: string | null;
    managerId: string | null;
    budget: string | null;
    contractPrice: string | null;
    active: boolean;
  };
  clientName: string | null;
  managerName: string | null;
};

export type ProjectFilters = {
  search?: string;
  clientId?: string;
  status?: string;
  active?: boolean;
};

export type UserDto = {
  id: string;
  name: string | null;
  email: string | null;
};

export async function fetchProjectsAdmin(filters?: ProjectFilters): Promise<ProjectAdminDto[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.clientId) params.append('clientId', filters.clientId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.active !== undefined) params.append('active', String(filters.active));

  const response = await http.get<ProjectAdminDto[]>(`/api/projects?${params.toString()}`);
  return response.data;
}

export async function createProjectAdmin(data: Record<string, unknown>): Promise<ProjectAdminDto> {
  const response = await http.post<ProjectAdminDto>('/api/projects', data);
  return response.data;
}

export async function updateProjectAdmin({
  id,
  data,
}: {
  id: string;
  data: Record<string, unknown>;
}): Promise<ProjectAdminDto> {
  const response = await http.put<ProjectAdminDto>(`/api/projects/${id}`, data);
  return response.data;
}

export async function fetchUsers(): Promise<UserDto[]> {
  const response = await http.get<UserDto[]>('/api/users');
  return response.data;
}
