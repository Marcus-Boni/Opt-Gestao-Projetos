import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createResource,
  fetchResources,
  type GetResourcesFilter,
  linkResourceToProject,
  unlinkResourceFromProject,
  updateResource,
} from '../api/resourcesApi';

export function useResources(filters?: GetResourcesFilter) {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: () => fetchResources(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useLinkResource(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId: string) => linkResourceToProject({ projectId, resourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useUnlinkResource(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId: string) => unlinkResourceFromProject({ projectId, resourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
