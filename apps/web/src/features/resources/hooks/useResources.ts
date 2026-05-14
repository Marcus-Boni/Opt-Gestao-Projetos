import { useQuery } from '@tanstack/react-query';
import { fetchResources } from '../api/resourcesApi';

export function useResources() {
  return useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources,
    staleTime: 2 * 60 * 1000,
  });
}
