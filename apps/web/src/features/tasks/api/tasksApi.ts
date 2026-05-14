import { http } from '@/shared/lib/http';

export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'alta' | 'media' | 'baixa';

export type TaskDto = {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  clientName: string;
  assigneeName: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  adoWorkItemId: string | null;
  isOverdue: boolean;
};

export type TasksDto = {
  tasks: TaskDto[];
};

export async function fetchTasks(projectId?: string): Promise<TasksDto> {
  const response = await http.get<TasksDto>('/api/tasks', {
    params: projectId ? { projectId } : undefined,
  });
  return response.data;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  await http.patch(`/api/tasks/${taskId}/status`, { status });
}
