import { cn } from '@/shared/lib/utils';
import type { ResourceDto, ResourceStatus } from '../api/resourcesApi';

const STATUS_CONFIG: Record<ResourceStatus, { label: string; class: string; bar: string }> = {
  disponivel: { label: 'Disponível', class: 'text-health-ok', bar: 'bg-health-ok' },
  alocado: { label: 'Alocado', class: 'text-primary', bar: 'bg-primary' },
  sobrecarga: { label: 'Sobrecarga', class: 'text-health-critical', bar: 'bg-health-critical' },
};

type Props = { resource: ResourceDto };

export function ResourceCard({ resource }: Props) {
  const config = STATUS_CONFIG[resource.status];

  return (
    <div className="rounded-xl border bg-card p-4 transition-shadow hover:shadow-md hover:border-primary/20">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {resource.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold text-sm">{resource.name}</p>
            <span className={cn('shrink-0 text-xs font-medium', config.class)}>{config.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{resource.role}</p>
        </div>
      </div>

      {/* Utilization bar */}
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>Utilização</span>
          <span className={cn('font-semibold tabular-nums', config.class)}>
            {resource.utilizationPercent.toFixed(0)}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full', config.bar)}
            style={{ width: `${Math.min(resource.utilizationPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Skills */}
      {resource.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {resource.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-full border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {resource.skills.length > 4 && (
            <span className="rounded-full border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
              +{resource.skills.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
