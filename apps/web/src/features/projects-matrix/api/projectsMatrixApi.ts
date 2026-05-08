import type { ProjectDetailResponseDto, ProjectsMatrixResponseDto } from '@optsolv/shared/schemas';
import { http } from '@/shared/lib/http';

export type MatrixFilters = {
  year?: number | undefined;
  month?: number | undefined;
};

export async function fetchProjectsMatrix(filters: MatrixFilters) {
  const response = await http.get<ProjectsMatrixResponseDto>('/api/projects/matrix', {
    params: filters,
  });
  return response.data;
}

export async function fetchProjectDetail(projectId: string) {
  const response = await http.get<ProjectDetailResponseDto>(`/api/projects/${projectId}`);
  return response.data;
}
