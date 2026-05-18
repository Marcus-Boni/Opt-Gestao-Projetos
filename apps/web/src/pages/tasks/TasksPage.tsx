import { LayoutGrid, List, Plus } from 'lucide-react';
import { useState } from 'react';
import { useProjectCenter } from '@/features/projects/hooks/useProjectCenter';
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
import { PageHeader } from '@/shared/components/PageHeader';
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

export function TasksPage() {
  const [projectId, setProjectId] = useState<string>('all');
  const [clientName, setClientName] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskDto | undefined>();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskDto | undefined>();

  const queryParams: Parameters<typeof useTasks>[0] = {};
  if (projectId !== 'all') queryParams.projectId = projectId;
  if (clientName !== 'all') queryParams.clientName = clientName;
  if (status !== 'all') queryParams.status = status;
  if (search) queryParams.search = search;

  const query = useTasks(queryParams);

  const { data: projectCenter } = useProjectCenter();
  const allProjects = projectCenter?.groups.flatMap((g) => g.projects) || [];
  const uniqueClients = Array.from(new Set(allProjects.map((p) => p.clientName)));

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
    <>
      <PageHeader
        eyebrow="Tarefas"
        title="Minhas Tarefas"
        description="Gerencie as atividades dos seus projetos."
        actions={
          <Button onClick={handleOpenNewTask}>
            <Plus className="size-4 mr-2" />
            Nova Tarefa
          </Button>
        }
      />
      <main className="p-5 flex flex-col gap-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-64"
          />
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="sm:w-64">
              <SelectValue placeholder="Filtrar por projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Projetos</SelectItem>
              {allProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={clientName} onValueChange={setClientName}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Clientes</SelectItem>
              {uniqueClients.map((client) => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="sm:w-48">
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
            <div className="flex justify-end mb-4">
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
      </main>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={taskToEdit}
        onSave={handleSaveTask}
        isLoading={createTask.isPending || updateTask.isPending}
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
    </>
  );
}
