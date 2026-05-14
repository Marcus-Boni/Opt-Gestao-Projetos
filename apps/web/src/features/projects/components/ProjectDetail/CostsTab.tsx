import { cn } from '@/shared/lib/utils';
import type { ProjectDetailTabDto } from '../../api/projectsApi';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const PCT = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

type Props = { detail: ProjectDetailTabDto };

export function CostsTab({ detail }: Props) {
  const totalResourceCost = detail.team.reduce((s, m) => s + m.hoursActual * 120, 0);
  const marginValue = detail.contractPrice - totalResourceCost;
  const marginPct = detail.contractPrice > 0 ? marginValue / detail.contractPrice : null;

  const rows = [
    { label: 'Preço do Projeto', value: detail.contractPrice, highlight: false },
    { label: 'Budget disponível', value: detail.budgetTotal, highlight: false },
    { label: 'Custos — Recursos (HH)', value: totalResourceCost, highlight: false },
    {
      label: 'Margem R$',
      value: marginValue,
      highlight: true,
      negative: marginValue < 0,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="h-9 px-4 text-left text-xs font-semibold text-muted-foreground">
                Item
              </th>
              <th className="h-9 px-4 text-right text-xs font-semibold text-muted-foreground">
                Valor
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-b-0">
                <td className={cn('px-4 py-3', row.highlight && 'font-semibold')}>{row.label}</td>
                <td
                  className={cn(
                    'px-4 py-3 text-right tabular-nums font-mono',
                    row.highlight &&
                      ('negative' in row && row.negative
                        ? 'text-financial-negative font-semibold'
                        : 'text-financial-positive font-semibold'),
                  )}
                >
                  {BRL.format(row.value)}
                </td>
              </tr>
            ))}
            <tr className="border-b">
              <td className="px-4 py-3 font-semibold">Margem %</td>
              <td
                className={cn(
                  'px-4 py-3 text-right tabular-nums font-mono font-semibold',
                  marginPct !== null
                    ? marginPct < 0
                      ? 'text-financial-negative'
                      : marginPct < 0.05
                        ? 'text-financial-warning'
                        : 'text-financial-positive'
                    : 'text-muted-foreground',
                )}
              >
                {marginPct !== null ? PCT.format(marginPct) : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
