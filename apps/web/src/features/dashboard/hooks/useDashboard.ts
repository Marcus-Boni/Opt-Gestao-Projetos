import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../api/dashboardApi';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 2 * 60 * 1000,
  });
}
