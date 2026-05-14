import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchTasks, type TaskStatus, updateTaskStatus } from '../api/tasksApi';

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', projectId ?? 'all'],
    queryFn: () => fetchTasks(projectId),
    staleTime: 60 * 1000,
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Status da tarefa atualizado');
    },
    onError: () => {
      toast.error('Não foi possível atualizar a tarefa');
    },
  });
}
