import { cn } from '@/shared/lib/utils';
import type { BudgetRankingItemDto } from '../api/dashboardApi';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

type Props = { items: BudgetRankingItemDto[] };

export function BudgetRankingList({ items }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div key={item.projectId} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 text-xs font-mono text-muted-foreground w-4">
                {index + 1}
              </span>
              <span className="truncate font-medium">{item.projectName}</span>
              <span className="hidden text-xs text-muted-foreground sm:inline truncate">
                · {item.clientName}
              </span>
            </span>
            <span
              className={cn(
                'shrink-0 text-xs font-mono font-semibold tabular-nums ml-2',
                item.status === 'critical'
                  ? 'text-health-critical'
                  : item.status === 'alert'
                    ? 'text-health-alert'
                    : 'text-health-ok',
              )}
            >
              {item.usedPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                item.status === 'critical'
                  ? 'bg-health-critical'
                  : item.status === 'alert'
                    ? 'bg-health-alert'
                    : 'bg-health-ok',
              )}
              style={{ width: `${Math.min(item.usedPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Realizado: {BRL.format(item.budgetUsed)}</span>
            <span>Budget: {BRL.format(item.budgetTotal)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
