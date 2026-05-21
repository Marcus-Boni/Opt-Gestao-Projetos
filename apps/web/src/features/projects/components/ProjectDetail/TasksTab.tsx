import { LayoutGrid, List, Plus } from 'lucide-react';
import { useState } from 'react';
import type { TaskDto, TaskPriority, TaskStatus } from '@/features/tasks';
import {
  KanbanBoard,
  TaskDialog,
  TaskList,
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
  useUpdateTaskStatus,
} from '@/features/tasks';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import type { ProjectDetailTabDto } from '../../api/projectsApi';

type Props = { detail: ProjectDetailTabDto };

export function TasksTab({ detail }: Props) {
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskDto | undefined>();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskDto | undefined>();

  const queryParams: Parameters<typeof useTasks>[0] = {
    projectId: detail.id,
  };
  if (status !== 'all') queryParams.status = status;
  if (search) queryParams.search = search;

  const query = useTasks(queryParams);

  const updateStatus = useUpdateTaskStatus();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    updateStatus.mutate({ taskId, status: newStatus });
  }

  function handleSaveTask(data: {
    title: string;
    projectId: string;
    priority: TaskPriority;
    status?: TaskStatus;
  }) {
    if (taskToEdit) {
      updateTask.mutate(
        { taskId: taskToEdit.id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setTaskToEdit(undefined);
          },
        },
      );
    } else {
      createTask.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
        },
      });
    }
  }

  function handleEditTask(task: TaskDto) {
    setTaskToEdit(task);
    setIsDialogOpen(true);
  }

  function handleDeleteTask(task: TaskDto) {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (taskToDelete) {
      deleteTask.mutate(taskToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setTaskToDelete(undefined);
        },
      });
    }
  }

  function handleOpenNewTask() {
    setTaskToEdit(undefined);
    setIsDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Tarefas do Projeto</h2>
        <Button onClick={handleOpenNewTask} size="sm">
          <Plus className="mr-2 size-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-64 bg-background"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-48 bg-background">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="todo">A Fazer</SelectItem>
            <SelectItem value="doing">Em Progresso</SelectItem>
            <SelectItem value="done">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError || !query.data ? (
        <ErrorState
          title="Não foi possível carregar as tarefas"
          description="Verifique a API e tente novamente."
          onRetry={() => query.refetch()}
        />
      ) : (
        <Tabs defaultValue="kanban" className="w-full">
          <div className="mb-4 flex justify-end">
            <TabsList>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <LayoutGrid className="size-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="size-4" />
                Lista
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="kanban" className="mt-0">
            <KanbanBoard
              tasks={query.data.tasks}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <TaskList
              tasks={query.data.tasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </TabsContent>
        </Tabs>
      )}

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={taskToEdit}
        onSave={handleSaveTask}
        isLoading={createTask.isPending || updateTask.isPending}
        defaultProjectId={detail.id}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tarefa{' '}
              <strong className="text-foreground">{taskToDelete?.title}</strong>? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(undefined)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-health-critical hover:bg-health-critical/90"
              disabled={deleteTask.isPending}
            >
              {deleteTask.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
