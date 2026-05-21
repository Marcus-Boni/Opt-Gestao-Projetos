import { Edit2, MoreVertical, PowerOff, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import type { ResourceDto, ResourceStatus } from '../api/resourcesApi';

const STATUS_CONFIG: Record<ResourceStatus, { label: string; class: string; bar: string }> = {
  disponivel: { label: 'Disponível', class: 'text-health-ok', bar: 'bg-health-ok' },
  alocado: { label: 'Alocado', class: 'text-primary', bar: 'bg-primary' },
  sobrecarga: { label: 'Sobrecarga', class: 'text-health-critical', bar: 'bg-health-critical' },
  inativo: { label: 'Inativo', class: 'text-muted-foreground', bar: 'bg-muted-foreground' },
};

type Props = {
  resource: ResourceDto;
  onEdit?: (resource: ResourceDto) => void;
  onToggleActive?: (resource: ResourceDto) => void;
  onRemoveFromProject?: (resource: ResourceDto) => void;
};

export function ResourceCard({ resource, onEdit, onToggleActive, onRemoveFromProject }: Props) {
  const config = STATUS_CONFIG[resource.status] || STATUS_CONFIG.disponivel;

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-4 transition-shadow hover:shadow-md hover:border-primary/20',
        resource.status === 'inativo' && 'opacity-75 grayscale-[0.5]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {resource.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="truncate font-semibold text-sm max-w-[150px]">{resource.name}</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{resource.name}</p>
                </TooltipContent>
              </Tooltip>
              <span
                className={cn(
                  'shrink-0 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-muted',
                  config.class,
                )}
              >
                {config.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{resource.role}</p>
          </div>
        </div>

        {onEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2 size-8 text-muted-foreground shrink-0"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(resource)}>
                <Edit2 className="mr-2 size-4" />
                Editar Recurso
              </DropdownMenuItem>
              {onToggleActive && (
                <DropdownMenuItem onClick={() => onToggleActive(resource)}>
                  <PowerOff className="mr-2 size-4" />
                  {resource.active ? 'Inativar Recurso' : 'Ativar Recurso'}
                </DropdownMenuItem>
              )}
              {onRemoveFromProject && (
                <DropdownMenuItem
                  onClick={() => onRemoveFromProject(resource)}
                  className="text-health-critical focus:text-health-critical"
                >
                  <Trash2 className="mr-2 size-4" />
                  Remover do Projeto
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help rounded-full border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
                  +{resource.skills.length - 4}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{resource.skills.slice(4).join(', ')}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}
