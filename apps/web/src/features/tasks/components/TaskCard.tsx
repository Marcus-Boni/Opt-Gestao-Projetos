import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import type { TaskDto, TaskPriority } from '../api/tasksApi';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; class: string }> = {
  alta: { label: 'Alta', class: 'text-health-critical bg-health-critical/10' },
  media: { label: 'Média', class: 'text-health-alert bg-health-alert/10' },
  baixa: { label: 'Baixa', class: 'text-health-ok bg-health-ok/10' },
};

type Props = { task: TaskDto };

export function TaskCard({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="cursor-grab p-3 active:cursor-grabbing hover:border-primary/30 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{task.title}</p>
          {task.isOverdue && (
            <AlertCircle className="size-4 shrink-0 text-health-critical" aria-label="Atrasada" />
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', priority.class)}>
            {priority.label}
          </span>
          <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
            {task.clientName}
          </span>
          {task.adoWorkItemId && (
            <span className="text-[11px] font-mono text-muted-foreground">
              #{task.adoWorkItemId}
            </span>
          )}
        </div>
        {task.dueDate && (
          <p
            className={cn(
              'mt-2 text-[11px]',
              task.isOverdue ? 'text-health-critical' : 'text-muted-foreground',
            )}
          >
            {task.isOverdue ? 'Atrasada · ' : ''}
            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
          </p>
        )}
        {task.assigneeName && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {task.assigneeName.charAt(0)}
            </div>
            <span className="text-[11px] text-muted-foreground">{task.assigneeName}</span>
          </div>
        )}
      </Card>
    </div>
  );
}
