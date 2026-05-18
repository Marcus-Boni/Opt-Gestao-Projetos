import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import type { TaskDto, TaskStatus } from '../api/tasksApi';
import { TaskCard } from './TaskCard';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'A Fazer', color: 'border-t-muted-foreground/40' },
  { id: 'doing', label: 'Em Progresso', color: 'border-t-health-alert' },
  { id: 'done', label: 'Concluído', color: 'border-t-health-ok' },
];

function DroppableColumn({
  col,
  taskCount,
  isHovered,
  children,
}: {
  col: (typeof COLUMNS)[0];
  taskCount: number;
  isHovered: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id: col.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border-t-[3px] bg-muted/40 p-3 transition-all duration-300 ease-out',
        col.color,
        isHovered &&
          'scale-[1.02] border-t-primary bg-primary/5 ring-1 ring-primary/20 shadow-[0_0_20px_-5px_rgba(var(--primary),0.2)]',
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <p
          className={cn(
            'text-sm font-bold transition-colors duration-300',
            isHovered ? 'text-primary' : '',
          )}
        >
          {col.label}
        </p>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-300',
            isHovered
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {taskCount}
        </span>
      </div>
      <div className="flex min-h-[150px] flex-col gap-3">{children}</div>
    </div>
  );
}

type Props = {
  tasks: TaskDto[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: TaskDto) => void;
  onDelete: (task: TaskDto) => void;
};

export function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete }: Props) {
  const [activeTask, setActiveTask] = useState<TaskDto | null>(null);
  const [activeColId, setActiveColId] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
      setActiveColId(task.status);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setActiveColId(null);
      return;
    }
    const overId = String(over.id);
    const isColumn = COLUMNS.some((c) => c.id === overId);
    if (isColumn) {
      setActiveColId(overId as TaskStatus);
    } else {
      const task = tasks.find((t) => t.id === overId);
      if (task) setActiveColId(task.status);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    setActiveColId(null);

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

  function handleDragCancel() {
    setActiveTask(null);
    setActiveColId(null);
  }

  const tasksByColumn = (colId: TaskStatus) => tasks.filter((t) => t.status === colId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = tasksByColumn(col.id);
          const isHovered = activeColId === col.id && activeTask !== null;

          return (
            <DroppableColumn
              key={col.id}
              col={col}
              taskCount={colTasks.length}
              isHovered={isHovered}
            >
              <SortableContext
                items={colTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </SortableContext>
            </DroppableColumn>
          );
        })}
      </div>
      <DragOverlay
        dropAnimation={{
          duration: 300,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeTask ? (
          <div className="cursor-grabbing opacity-90 shadow-2xl ring-1 ring-primary/20 rounded-xl">
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
