import { AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import type { TaskDto, TaskPriority, TaskStatus } from '../api/tasksApi';

type Props = {
  tasks: TaskDto[];
  onEdit: (task: TaskDto) => void;
  onDelete: (task: TaskDto) => void;
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; class: string }> = {
  alta: {
    label: 'Alta',
    class: 'text-health-critical bg-health-critical/10',
  },
  media: { label: 'Média', class: 'text-health-alert bg-health-alert/10' },
  baixa: { label: 'Baixa', class: 'text-health-ok bg-health-ok/10' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; class: string }> = {
  todo: { label: 'A Fazer', class: 'text-muted-foreground bg-muted' },
  doing: {
    label: 'Em Progresso',
    class: 'text-health-alert bg-health-alert/10',
  },
  done: { label: 'Concluído', class: 'text-health-ok bg-health-ok/10' },
};

export function TaskList({ tasks, onEdit, onDelete }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed">
        <p className="text-muted-foreground">Nenhuma tarefa encontrada com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Projeto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Atribuído</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const priority = PRIORITY_CONFIG[task.priority];
            const status = STATUS_CONFIG[task.status];

            return (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{task.title}</span>
                    {task.isOverdue && (
                      <AlertCircle className="size-4 text-health-critical" aria-label="Atrasada" />
                    )}
                  </div>
                  {task.adoWorkItemId && (
                    <span className="text-[11px] font-mono text-muted-foreground mt-1">
                      #{task.adoWorkItemId}
                    </span>
                  )}
                </TableCell>
                <TableCell>{task.projectName}</TableCell>
                <TableCell>{task.clientName}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-medium',
                      priority.class,
                    )}
                  >
                    {priority.label}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', status.class)}
                  >
                    {status.label}
                  </span>
                </TableCell>
                <TableCell>
                  {task.assigneeName ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {task.assigneeName.charAt(0)}
                      </div>
                      <span className="text-[12px]">{task.assigneeName}</span>
                    </div>
                  ) : (
                    <span className="text-[12px] text-muted-foreground">Não atribuído</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(task)}>
                          <Edit className="size-4" />
                          <span className="sr-only">Editar Tarefa</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar Tarefa</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-health-critical hover:text-health-critical hover:bg-health-critical/10"
                          onClick={() => onDelete(task)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Excluir Tarefa</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Excluir Tarefa</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
