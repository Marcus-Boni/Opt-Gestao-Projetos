import { cn } from '@/shared/lib/utils';
import type { ProjectDetailTabDto } from '../../../api/projectsApi';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const PCT = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

type KpiTone = 'default' | 'positive' | 'negative' | 'warning';

type KpiItem = {
  title: string;
  value: string;
  description: string;
  tone: KpiTone;
};

const toneValueClass: Record<KpiTone, string> = {
  default: 'text-foreground',
  positive: 'text-financial-positive',
  negative: 'text-financial-negative',
  warning: 'text-financial-warning',
};

const toneBorderClass: Record<KpiTone, string> = {
  default: 'border-border',
  positive: 'border-[hsl(var(--financial-positive)/0.3)]',
  negative: 'border-[hsl(var(--financial-negative)/0.3)]',
  warning: 'border-[hsl(var(--financial-warning)/0.3)]',
};

type Props = { detail: ProjectDetailTabDto };

export function KpiGrid({ detail }: Props) {
  const budgetUsedPct = detail.budgetTotal > 0 ? detail.budgetUsed / detail.budgetTotal : 0;

  const kpis: KpiItem[] = [
    {
      title: 'Cronograma',
      value:
        detail.scheduleDeviationPercent != null
          ? `${detail.scheduleDeviationPercent > 0 ? '+' : ''}${detail.scheduleDeviationPercent}%`
          : '—',
      description: 'Desvio vs Planejado',
      tone:
        detail.scheduleDeviationPercent === null
          ? 'default'
          : detail.scheduleDeviationPercent > 5
            ? 'negative'
            : detail.scheduleDeviationPercent < 0
              ? 'positive'
              : 'warning',
    },
    {
      title: 'Progresso',
      value: `${detail.progressActual.toFixed(0)}%`,
      description: `Planejado: ${detail.progressPlanned.toFixed(0)}%`,
      tone: detail.progressActual >= detail.progressPlanned ? 'positive' : 'warning',
    },
    {
      title: 'Budget Realizado',
      value: BRL.format(detail.budgetUsed),
      description: `Total: ${BRL.format(detail.budgetTotal)}`,
      tone: budgetUsedPct > 0.85 ? 'negative' : budgetUsedPct > 0.7 ? 'warning' : 'positive',
    },
    {
      title: 'Margem',
      value: detail.marginPercent !== null ? PCT.format(detail.marginPercent) : '—',
      description: 'Margem do projeto',
      tone:
        detail.marginPercent === null
          ? 'default'
          : detail.marginPercent < 0
            ? 'negative'
            : detail.marginPercent < 0.05
              ? 'warning'
              : 'positive',
    },
    {
      title: 'Equipe',
      value: String(detail.team.length),
      description: 'Membros alocados',
      tone: 'default',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {kpis.map((kpi) => (
        <div
          key={kpi.title}
          className={cn('rounded-lg border bg-card p-4', toneBorderClass[kpi.tone])}
        >
          <p className="mb-1 text-xs font-medium text-muted-foreground">{kpi.title}</p>
          <p
            className={cn('font-display text-xl font-bold tabular-nums', toneValueClass[kpi.tone])}
          >
            {kpi.value}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{kpi.description}</p>
        </div>
      ))}
    </div>
  );
}
