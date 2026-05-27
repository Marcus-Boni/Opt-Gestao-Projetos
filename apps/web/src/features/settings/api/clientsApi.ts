import { http } from '@/shared/lib/http';

export type ClientDto = {
  id: string;
  name: string;
  taxId: string | null;
  contactName: string | null;
  contactEmail: string | null;
  externalId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ClientFilters = {
  search?: string;
  active?: boolean;
};

export async function fetchClients(filters?: ClientFilters): Promise<ClientDto[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.active !== undefined) params.append('active', String(filters.active));

  const response = await http.get<ClientDto[]>(`/api/clients?${params.toString()}`);
  return response.data;
}

export async function createClient(
  data: Omit<ClientDto, 'id' | 'createdAt' | 'updatedAt' | 'active'> & { active?: boolean },
): Promise<ClientDto> {
  const response = await http.post<ClientDto>('/api/clients', data);
  return response.data;
}

export async function updateClient({
  id,
  data,
}: {
  id: string;
  data: Partial<ClientDto>;
}): Promise<ClientDto> {
  const response = await http.put<ClientDto>(`/api/clients/${id}`, data);
  return response.data;
}
