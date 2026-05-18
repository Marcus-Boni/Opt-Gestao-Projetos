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

export type FetchTasksParams = {
  projectId?: string;
  clientName?: string;
  status?: string;
  search?: string;
};

export async function fetchTasks(params?: FetchTasksParams): Promise<TasksDto> {
  const response = await http.get<TasksDto>('/api/tasks', { params });
  return response.data;
}

export async function createTask(data: {
  title: string;
  projectId: string;
  priority: TaskPriority;
  status?: TaskStatus;
}): Promise<TaskDto> {
  const response = await http.post<TaskDto>('/api/tasks', data);
  return response.data;
}

export async function updateTask(
  taskId: string,
  data: { title?: string; projectId?: string; priority?: TaskPriority; status?: TaskStatus },
): Promise<TaskDto> {
  const response = await http.put<TaskDto>(`/api/tasks/${taskId}`, data);
  return response.data;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  await http.patch(`/api/tasks/${taskId}/status`, { status });
}

export async function deleteTask(taskId: string): Promise<void> {
  await http.delete(`/api/tasks/${taskId}`);
}
