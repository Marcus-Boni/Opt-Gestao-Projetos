import { Link } from '@tanstack/react-router';
import { Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { ProjectGroupedByManager } from '../api/projectsApi';
import { ProjectStatusBadge } from './ProjectStatusBadge';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 0,
});

type Props = { groups: ProjectGroupedByManager[] };

function ProgressBar({ planned, actual }: { planned: number; actual: number }) {
  const isAhead = actual >= planned;
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="relative h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/40"
          style={{ width: `${Math.min(planned, 100)}%` }}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            isAhead ? 'bg-health-ok' : 'bg-health-alert',
          )}
          style={{ width: `${Math.min(actual, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
        {actual.toFixed(0)}%
      </span>
    </div>
  );
}

export function ProjectTable({ groups }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.managerName}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            {group.managerName}
          </p>
          <div className="overflow-hidden rounded-lg border bg-card">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {['Status', 'Projeto', 'Cliente', 'Duração', 'Progresso', 'Orçamento', ''].map(
                    (h) => (
                      <th
                        key={h}
                        className="h-9 px-3 text-left text-xs font-semibold text-muted-foreground"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {group.projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-3 py-2.5">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                    <td className="px-3 py-2.5 font-medium">
                      <Link
                        to="/app/projetos/$projectId"
                        params={{ projectId: project.id }}
                        className="hover:text-primary hover:underline"
                      >
                        {project.name}
                      </Link>
                      {project.code && (
                        <p className="text-[11px] text-muted-foreground">{project.code}</p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{project.clientName}</td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                      {project.durationMonths}m
                    </td>
                    <td className="px-3 py-2.5">
                      <ProgressBar
                        planned={project.progressPlanned}
                        actual={project.progressActual}
                      />
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">
                      <span
                        className={cn(
                          'text-xs font-medium',
                          project.budgetUsedPercent > 85
                            ? 'text-health-critical'
                            : 'text-foreground',
                        )}
                      >
                        {BRL.format(project.budgetUsed)} / {BRL.format(project.budgetTotal)}{' '}
                        <span className="text-muted-foreground">
                          ({project.budgetUsedPercent.toFixed(0)}%)
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/app/projetos/$projectId" params={{ projectId: project.id }}>
                          <Eye className="size-4" aria-label="Ver projeto" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
