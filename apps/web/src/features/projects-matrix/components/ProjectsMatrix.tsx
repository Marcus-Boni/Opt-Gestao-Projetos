import type { ProjectsMatrixResponseDto } from '@optsolv/shared/schemas';
import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { type MatrixRow, useMatrixExpansion } from '../hooks/useMatrixExpansion';
import { marginPercentClass, marginValueClass, remainingBudgetClass } from '../utils/colorRules';
import {
  currencyFormatter,
  formatDate,
  formatMonth,
  numberFormatter,
  percentFormatter,
} from '../utils/formatters';

type ProjectsMatrixProps = {
  matrix: ProjectsMatrixResponseDto;
};

const columns = [
  'Cliente',
  'Data de Inicio',
  'Data de Fim',
  'Faturamento',
  'Despesas',
  'Comissoes',
  'Imposto',
  'Custo Harvest',
  'Margem R$',
  'Margem %',
  'Orcamento',
  'Horas',
  'Sobras',
] as const;

function getRowName(row: MatrixRow) {
  if (row.type === 'client') return row.item.name;
  if (row.type === 'project') return row.item.name;
  return formatMonth(row.item.year, row.item.month);
}

function getRowDates(row: MatrixRow) {
  if (row.type === 'project') {
    return { startDate: formatDate(row.item.startDate), endDate: formatDate(row.item.endDate) };
  }
  if (row.type === 'client') return { startDate: '-', endDate: '-' };
  return { startDate: formatMonth(row.item.year, row.item.month), endDate: '-' };
}

function getRowChildrenCount(row: MatrixRow) {
  if (row.type === 'client') return row.item.projects.length;
  if (row.type === 'project') return row.item.months.length;
  return 0;
}

export function ProjectsMatrix({ matrix }: ProjectsMatrixProps) {
  const { expanded, rows, toggle } = useMatrixExpansion(matrix.clients);

  return (
    <Card className="overflow-hidden">
      <div className="max-h-[calc(100vh-15rem)] overflow-auto">
        <table className="w-full min-w-[1320px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-background shadow-sm">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column}
                  className={cn(
                    'h-10 border-b px-3 text-left text-xs font-semibold text-muted-foreground',
                    index > 2 && 'text-right',
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const dates = getRowDates(row);
              const hasChildren = getRowChildrenCount(row) > 0;
              const isExpanded = expanded.has(row.key);
              const isProject = row.type === 'project';

              return (
                <tr
                  key={row.key}
                  className={cn(
                    'h-9 border-b transition-colors hover:bg-accent/60',
                    row.type === 'client' && 'bg-muted/40 font-semibold',
                    row.type === 'month' && 'text-muted-foreground',
                  )}
                >
                  <td className="px-3">
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: `${row.level * 18}px` }}
                    >
                      {hasChildren ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => toggle(row.key)}
                          aria-label={isExpanded ? 'Recolher linha' : 'Expandir linha'}
                        >
                          <ChevronRight
                            aria-hidden="true"
                            className={cn('transition-transform', isExpanded && 'rotate-90')}
                          />
                        </Button>
                      ) : (
                        <span className="size-7" />
                      )}
                      {isProject ? (
                        <Link
                          to="/app/projetos/$projectId"
                          params={{ projectId: row.item.id }}
                          className="truncate font-medium text-primary hover:underline"
                        >
                          {getRowName(row)}
                        </Link>
                      ) : (
                        <span className="truncate">{getRowName(row)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 text-muted-foreground">{dates.startDate}</td>
                  <td className="px-3 text-muted-foreground">{dates.endDate}</td>
                  <td className="px-3 text-right font-mono tabular-nums">
                    {currencyFormatter.format(row.item.revenue)}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums">
                    {currencyFormatter.format(row.item.expenses)}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums">
                    {currencyFormatter.format(row.item.commissions)}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums">
                    {currencyFormatter.format(row.item.taxes)}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums">
                    {currencyFormatter.format(row.item.harvestCost)}
                  </td>
                  <td
                    className={cn(
                      'px-3 text-right font-mono tabular-nums',
                      marginValueClass(row.item.marginValue),
                    )}
                  >
                    {currencyFormatter.format(row.item.marginValue)}
                  </td>
                  <td
                    className={cn(
                      'px-3 text-right font-mono tabular-nums',
                      marginPercentClass(row.item.marginPercent),
                    )}
                  >
                    {row.item.marginPercent === null
                      ? '-'
                      : percentFormatter.format(row.item.marginPercent)}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums">
                    {currencyFormatter.format(row.item.budget)}
                  </td>
                  <td className="px-3 text-right font-mono tabular-nums">
                    {numberFormatter.format(row.item.hours)}
                  </td>
                  <td
                    className={cn(
                      'px-3 text-right font-mono tabular-nums',
                      remainingBudgetClass(row.item.remainingBudget, row.item.budget),
                    )}
                  >
                    {currencyFormatter.format(row.item.remainingBudget)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="sticky bottom-0 bg-background shadow-[0_-1px_0_hsl(var(--border))]">
            <tr className="h-10 font-semibold">
              <td className="px-3">Total</td>
              <td className="px-3" />
              <td className="px-3" />
              <td className="px-3 text-right font-mono tabular-nums">
                {currencyFormatter.format(matrix.total.revenue)}
              </td>
              <td className="px-3 text-right font-mono tabular-nums">
                {currencyFormatter.format(matrix.total.expenses)}
              </td>
              <td className="px-3 text-right font-mono tabular-nums">
                {currencyFormatter.format(matrix.total.commissions)}
              </td>
              <td className="px-3 text-right font-mono tabular-nums">
                {currencyFormatter.format(matrix.total.taxes)}
              </td>
              <td className="px-3 text-right font-mono tabular-nums">
                {currencyFormatter.format(matrix.total.harvestCost)}
              </td>
              <td
                className={cn(
                  'px-3 text-right font-mono tabular-nums',
                  marginValueClass(matrix.total.marginValue),
                )}
              >
                {currencyFormatter.format(matrix.total.marginValue)}
              </td>
              <td
                className={cn(
                  'px-3 text-right font-mono tabular-nums',
                  marginPercentClass(matrix.total.marginPercent),
                )}
              >
                {matrix.total.marginPercent === null
                  ? '-'
                  : percentFormatter.format(matrix.total.marginPercent)}
              </td>
              <td className="px-3 text-right font-mono tabular-nums">
                {currencyFormatter.format(matrix.total.budget)}
              </td>
              <td className="px-3 text-right font-mono tabular-nums">
                {numberFormatter.format(matrix.total.hours)}
              </td>
              <td
                className={cn(
                  'px-3 text-right font-mono tabular-nums',
                  remainingBudgetClass(matrix.total.remainingBudget, matrix.total.budget),
                )}
              >
                {currencyFormatter.format(matrix.total.remainingBudget)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
