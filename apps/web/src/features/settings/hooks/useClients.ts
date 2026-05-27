import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ClientFilters, createClient, fetchClients, updateClient } from '../api/clientsApi';

export function useClients(filters?: ClientFilters) {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => fetchClients(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
