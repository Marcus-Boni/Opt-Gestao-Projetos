import { cn } from '@/shared/lib/utils';
import type { ProjectStatus } from '../api/projectsApi';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; dot: string; text: string }> = {
  no_prazo: { label: 'No prazo', dot: 'bg-health-ok', text: 'text-health-ok' },
  alerta: { label: 'Alerta', dot: 'bg-health-alert', text: 'text-health-alert' },
  critico: { label: 'Crítico', dot: 'bg-health-critical', text: 'text-health-critical' },
  concluido: { label: 'Concluído', dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
  cancelado: { label: 'Cancelado', dot: 'bg-destructive', text: 'text-destructive' },
};

type Props = { status: ProjectStatus; size?: 'sm' | 'md' };

export function ProjectStatusBadge({ status, size = 'sm' }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5',
        size === 'sm' ? 'text-xs' : 'text-sm',
        config.text,
      )}
    >
      <span className={cn('size-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </span>
  );
}
