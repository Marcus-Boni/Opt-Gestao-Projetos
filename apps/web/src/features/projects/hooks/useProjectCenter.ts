import { useQuery } from '@tanstack/react-query';
import { fetchProjectCenter, fetchProjectDetailFull } from '../api/projectsApi';

export function useProjectCenter() {
  return useQuery({
    queryKey: ['projects', 'center'],
    queryFn: fetchProjectCenter,
    staleTime: 2 * 60 * 1000,
  });
}

export function useProjectDetailFull(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'detail-full'],
    queryFn: () => fetchProjectDetailFull(projectId),
    staleTime: 2 * 60 * 1000,
    enabled: Boolean(projectId),
  });
}
