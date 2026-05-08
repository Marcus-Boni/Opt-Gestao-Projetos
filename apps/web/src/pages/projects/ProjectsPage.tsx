import { BriefcaseBusiness, Clock, TrendingUp, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  ExportButton,
  ProjectsMatrix,
  useProjectsMatrix,
  YearMonthFilter,
} from '@/features/projects-matrix';
import type { MatrixFilters } from '@/features/projects-matrix/api/projectsMatrixApi';
import {
  currencyFormatter,
  numberFormatter,
  percentFormatter,
} from '@/features/projects-matrix/utils/formatters';
import { KpiCard } from '@/shared/components/KpiCard';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StateViews';

export function ProjectsPage() {
  const [filters, setFilters] = useState<MatrixFilters>({ year: 2025 });
  const matrixQuery = useProjectsMatrix(filters);

  const totalProjects = useMemo(
    () => matrixQuery.data?.clients.reduce((sum, client) => sum + client.projects.length, 0) ?? 0,
    [matrixQuery.data],
  );

  return (
    <>
      <PageHeader
        eyebrow="Matriz de Projetos"
        title="Projetos"
        description="Visao hierarquica financeira por cliente, projeto e periodo."
        actions={<ExportButton matrix={matrixQuery.data} />}
      />
      <main className="flex flex-col gap-4 p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Faturamento"
            value={currencyFormatter.format(matrixQuery.data?.total.revenue ?? 0)}
            icon={WalletCards}
          />
          <KpiCard
            title="Margem"
            value={currencyFormatter.format(matrixQuery.data?.total.marginValue ?? 0)}
            icon={TrendingUp}
            tone={(matrixQuery.data?.total.marginValue ?? 0) < 0 ? 'negative' : 'positive'}
          />
          <KpiCard
            title="Margem %"
            value={
              matrixQuery.data?.total.marginPercent === null ||
              matrixQuery.data?.total.marginPercent === undefined
                ? '-'
                : percentFormatter.format(matrixQuery.data.total.marginPercent)
            }
            icon={BriefcaseBusiness}
          />
          <KpiCard
            title="Horas"
            value={numberFormatter.format(matrixQuery.data?.total.hours ?? 0)}
            description={`${totalProjects} projetos ativos no filtro`}
            icon={Clock}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
          <YearMonthFilter value={filters} onChange={setFilters} />
        </div>

        {matrixQuery.isLoading ? <LoadingState /> : null}
        {matrixQuery.isError ? (
          <ErrorState
            title="Nao foi possivel carregar a matriz"
            description="Verifique a API e tente novamente."
            onRetry={() => matrixQuery.refetch()}
          />
        ) : null}
        {matrixQuery.data && matrixQuery.data.clients.length === 0 ? (
          <EmptyState
            title="Sem projetos no filtro"
            description="Altere ano ou mes para ampliar a busca."
          />
        ) : null}
        {matrixQuery.data && matrixQuery.data.clients.length > 0 ? (
          <ProjectsMatrix matrix={matrixQuery.data} />
        ) : null}
      </main>
    </>
  );
}
