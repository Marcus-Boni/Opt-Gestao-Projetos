import type { ProjectsMatrixResponseDto } from '@optsolv/shared/schemas';
import { Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

type ExportButtonProps = {
  matrix?: ProjectsMatrixResponseDto | undefined;
};

export function ExportButton({ matrix }: ExportButtonProps) {
  const exportCsv = () => {
    if (!matrix) return;

    const rows = matrix.clients.flatMap((client) =>
      client.projects.flatMap((project) =>
        project.months.map((month) => [
          client.name,
          project.name,
          month.year,
          month.month,
          month.revenue,
          month.expenses,
          month.commissions,
          month.taxes,
          month.harvestCost,
          month.marginValue,
          month.marginPercent ?? '',
          month.budget,
          month.hours,
          month.remainingBudget,
        ]),
      ),
    );

    const content = [
      [
        'Cliente',
        'Projeto',
        'Ano',
        'Mes',
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
      ],
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'optsolv-pms-matriz.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={exportCsv} disabled={!matrix}>
      <Download data-icon="inline-start" />
      Exportar
    </Button>
  );
}
