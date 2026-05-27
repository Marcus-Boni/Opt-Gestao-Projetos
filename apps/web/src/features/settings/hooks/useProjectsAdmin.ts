import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProjectAdmin,
  fetchProjectsAdmin,
  fetchUsers,
  type ProjectFilters,
  updateProjectAdmin,
} from '../api/projectsAdminApi';

export function useProjectsAdmin(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projectsAdmin', filters],
    queryFn: () => fetchProjectsAdmin(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateProjectAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProjectAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProjectAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProjectAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  });
}
