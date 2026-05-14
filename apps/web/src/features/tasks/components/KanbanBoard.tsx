import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import type { TaskDto, TaskStatus } from '../api/tasksApi';
import { TaskCard } from './TaskCard';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'A Fazer', color: 'border-t-muted-foreground/40' },
  { id: 'doing', label: 'Em Progresso', color: 'border-t-health-alert' },
  { id: 'done', label: 'Concluído', color: 'border-t-health-ok' },
];

type Props = {
  tasks: TaskDto[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
};

export function KanbanBoard({ tasks, onStatusChange }: Props) {
  const [activeTask, setActiveTask] = useState<TaskDto | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);
    const isColumn = COLUMNS.some((c) => c.id === overId);
    const targetStatus: TaskStatus | undefined = isColumn
      ? (overId as TaskStatus)
      : (tasks.find((t) => t.id === overId)?.status as TaskStatus | undefined);

    if (!targetStatus) return;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.status === targetStatus) return;
    onStatusChange(String(active.id), targetStatus);
  }

  const tasksByColumn = (colId: TaskStatus) => tasks.filter((t) => t.status === colId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = tasksByColumn(col.id);
          return (
            <div
              key={col.id}
              id={col.id}
              className={cn('rounded-lg border-t-2 bg-muted/30 p-3', col.color)}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">{col.label}</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>
              <SortableContext
                items={colTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2 min-h-[120px]">
                  {colTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
      <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  );
}
