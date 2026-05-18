import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createTask,
  deleteTask,
  type FetchTasksParams,
  fetchTasks,
  type TaskPriority,
  type TaskStatus,
  updateTask,
  updateTaskStatus,
} from '../api/tasksApi';

export function useTasks(params?: FetchTasksParams) {
  return useQuery({
    queryKey: ['tasks', params ?? 'all'],
    queryFn: () => fetchTasks(params),
    staleTime: 60 * 1000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa criada com sucesso');
    },
    onError: () => {
      toast.error('Não foi possível criar a tarefa');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: { title?: string; projectId?: string; priority?: TaskPriority; status?: TaskStatus };
    }) => updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa atualizada com sucesso');
    },
    onError: () => {
      toast.error('Não foi possível atualizar a tarefa');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa excluída com sucesso');
    },
    onError: () => {
      toast.error('Não foi possível excluir a tarefa');
    },
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
