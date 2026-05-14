import { BriefcaseBusiness, Clock, DollarSign, Search, TrendingUp } from 'lucide-react';
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
import { filterProjectsMatrixBySearch } from '@/features/projects-matrix/utils/search';
import { KpiCard } from '@/shared/components/KpiCard';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState, ErrorState, ProjectsPageSkeleton } from '@/shared/components/StateViews';
import { Input } from '@/shared/components/ui/input';

export function FinanceiroPage() {
  const [filters, setFilters] = useState<MatrixFilters>({ year: 2025 });
  const [search, setSearch] = useState('');
  const matrixQuery = useProjectsMatrix(filters);
  const filteredMatrix = useMemo(
    () =>
      matrixQuery.data ? filterProjectsMatrixBySearch(matrixQuery.data, search) : matrixQuery.data,
    [matrixQuery.data, search],
  );

  const totalProjects = useMemo(
    () => filteredMatrix?.clients.reduce((sum, client) => sum + client.projects.length, 0) ?? 0,
    [filteredMatrix],
  );

  if (matrixQuery.isLoading) return <ProjectsPageSkeleton />;

  return (
    <>
      <PageHeader
        eyebrow="Financeiro"
        title="Matriz de Rentabilidade"
        description="Visão hierárquica financeira por cliente, projeto e período."
        actions={<ExportButton matrix={matrixQuery.data} />}
      />
      <main className="flex flex-col gap-4 p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Faturamento"
            value={currencyFormatter.format(matrixQuery.data?.total.revenue ?? 0)}
            icon={DollarSign}
            sparkData={[820, 940, 880, 1060, 990, 1150, 1270]}
            trend={10.4}
          />
          <KpiCard
            title="Margem R$"
            value={currencyFormatter.format(matrixQuery.data?.total.marginValue ?? 0)}
            icon={TrendingUp}
            tone={(matrixQuery.data?.total.marginValue ?? 0) < 0 ? 'negative' : 'positive'}
            sparkData={[140, 165, 130, 190, 170, 210, 284]}
            trend={35.2}
          />
          <KpiCard
            title="Margem %"
            value={
              matrixQuery.data?.total.marginPercent == null
                ? '-'
                : percentFormatter.format(matrixQuery.data.total.marginPercent)
            }
            icon={BriefcaseBusiness}
            sparkData={[17.1, 17.5, 14.8, 17.9, 17.2, 18.3, 22.4]}
            trend={2.1}
          />
          <KpiCard
            title="Horas"
            value={numberFormatter.format(matrixQuery.data?.total.hours ?? 0)}
            description={`${totalProjects} projetos no filtro`}
            icon={Clock}
            sparkData={[2800, 3100, 2950, 3300, 3150, 3400, 3482]}
            trend={2.4}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 xl:flex-row xl:items-center xl:justify-between">
          <YearMonthFilter value={filters} onChange={setFilters} />
          <div className="flex min-w-72 items-center gap-2 rounded-md border bg-background px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente, projeto ou código"
              className="border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {matrixQuery.isError ? (
          <ErrorState
            title="Não foi possível carregar a matriz"
            description="Verifique a API e tente novamente."
            onRetry={() => matrixQuery.refetch()}
          />
        ) : null}
        {filteredMatrix && filteredMatrix.clients.length === 0 ? (
          <EmptyState
            title={search ? 'Nenhum resultado encontrado' : 'Sem dados no filtro'}
            description={
              search
                ? 'Revise o termo de busca ou limpe o campo para ver todos os projetos.'
                : 'Altere ano ou mês para ampliar a busca.'
            }
          />
        ) : null}
        {filteredMatrix && filteredMatrix.clients.length > 0 ? (
          <ProjectsMatrix matrix={filteredMatrix} />
        ) : null}
      </main>
    </>
  );
}
