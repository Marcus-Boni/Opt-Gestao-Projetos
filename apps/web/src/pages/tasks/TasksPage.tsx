import type { TaskStatus } from '@/features/tasks';
import { KanbanBoard, useTasks, useUpdateTaskStatus } from '@/features/tasks';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';

export function TasksPage() {
  const query = useTasks();
  const updateStatus = useUpdateTaskStatus();

  function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    updateStatus.mutate({ taskId, status: newStatus });
  }

  if (query.isLoading) {
    return (
      <>
        <PageHeader eyebrow="Tarefas" title="Minhas Tarefas" />
        <main className="p-5">
          <LoadingState />
        </main>
      </>
    );
  }

  if (query.isError || !query.data) {
    return (
      <>
        <PageHeader eyebrow="Tarefas" title="Minhas Tarefas" />
        <main className="p-5">
          <ErrorState
            title="Não foi possível carregar as tarefas"
            description="Verifique a API e tente novamente."
            onRetry={() => query.refetch()}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Tarefas"
        title="Minhas Tarefas"
        description="Arraste os cards para atualizar o status."
      />
      <main className="p-5">
        <KanbanBoard tasks={query.data.tasks} onStatusChange={handleStatusChange} />
      </main>
    </>
  );
}
