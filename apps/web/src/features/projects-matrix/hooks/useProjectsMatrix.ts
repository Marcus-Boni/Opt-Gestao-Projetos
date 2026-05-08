import { useQuery } from '@tanstack/react-query';
import { fetchProjectsMatrix, type MatrixFilters } from '../api/projectsMatrixApi';

export function useProjectsMatrix(filters: MatrixFilters) {
  return useQuery({
    queryKey: ['projects', 'matrix', filters],
    queryFn: () => fetchProjectsMatrix(filters),
  });
}
