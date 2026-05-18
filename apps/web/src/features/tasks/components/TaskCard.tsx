import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, Edit2, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import type { TaskDto, TaskPriority } from '../api/tasksApi';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; class: string }> = {
  alta: {
    label: 'Alta',
    class: 'text-health-critical bg-health-critical/10',
  },
  media: { label: 'Média', class: 'text-health-alert bg-health-alert/10' },
  baixa: { label: 'Baixa', class: 'text-health-ok bg-health-ok/10' },
};

type Props = {
  task: TaskDto;
  onEdit: (task: TaskDto) => void;
  onDelete: (task: TaskDto) => void;
};

export function TaskCard({ task, onEdit, onDelete }: Props) {
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
          <p className="text-sm font-medium leading-snug pr-2">{task.title}</p>
          <div className="flex items-center gap-1 shrink-0">
            {task.isOverdue && (
              <AlertCircle className="size-4 shrink-0 text-health-critical" aria-label="Atrasada" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Ações da tarefa</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="mr-2 size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(task)}
                  className="text-health-critical focus:text-health-critical"
                >
                  <Trash2 className="mr-2 size-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
