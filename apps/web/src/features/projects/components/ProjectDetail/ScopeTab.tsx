import { cn } from '@/shared/lib/utils';
import type { ProjectDetailTabDto } from '../../api/projectsApi';

type Props = { detail: ProjectDetailTabDto };

function getStatusColor(status: string) {
  if (status === 'Concluído') return 'bg-primary text-primary-foreground';
  if (status === 'Atrasado') return 'bg-health-critical text-white';
  return 'bg-muted text-muted-foreground';
}

function getTypeColor(type: string) {
  switch (type) {
    case 'Épico':
      return 'border bg-primary text-primary-foreground';
    case 'Feature':
      return 'border bg-health-ok text-health-ok-foreground';
    case 'PBI':
      return 'border bg-muted text-muted-foreground';
    default:
      return 'border bg-background text-foreground';
  }
}

export function ScopeTab({ detail }: Props) {
  const { backlog } = detail;
  const completedCount = backlog.filter((b) => b.status === 'Concluído').length;
  const delayedCount = backlog.filter((b) => b.status === 'Atrasado').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Itens no escopo
          </p>
          <p className="text-2xl font-bold">{backlog.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Concluídos
          </p>
          <p className="text-2xl font-bold text-health-ok">{completedCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Atrasados
          </p>
          <p className="text-2xl font-bold text-health-critical">{delayedCount}</p>
        </div>
      </div>

      {/* Backlog Table Card */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b p-5">
          <h3 className="font-semibold text-foreground">Backlog (Azure DevOps)</h3>
          <p className="text-sm text-muted-foreground">Épicos, Features e PBIs sincronizados</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="h-10 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tipo
                </th>
                <th className="h-10 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Item
                </th>
                <th className="h-10 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Progresso
                </th>
                <th className="h-10 px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estimado
                </th>
                <th className="h-10 px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Realizado
                </th>
                <th className="h-10 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {backlog.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        getTypeColor(item.type),
                      )}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{item.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(item.progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{item.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {item.estimatedHours}h
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {item.actualHours}h
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        getStatusColor(item.status),
                      )}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}

              {backlog.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum item sincronizado do Azure DevOps.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
