import { useQuery } from '@tanstack/react-query';
import { fetchProjectDetail } from '../api/projectsMatrixApi';

export function useProjectDetail(projectId: string) {
  return useQuery({
    queryKey: ['projects', 'detail', projectId],
    queryFn: () => fetchProjectDetail(projectId),
  });
}
