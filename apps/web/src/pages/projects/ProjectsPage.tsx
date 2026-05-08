import { BriefcaseBusiness, Clock, Search, TrendingUp, WalletCards } from 'lucide-react';
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

export function ProjectsPage() {
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

        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 xl:flex-row xl:items-center xl:justify-between">
          <YearMonthFilter value={filters} onChange={setFilters} />
          <div className="flex min-w-72 items-center gap-2 rounded-md border bg-background px-3">
            <Search aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por cliente, projeto ou codigo"
              className="border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {matrixQuery.isError ? (
          <ErrorState
            title="Nao foi possivel carregar a matriz"
            description="Verifique a API e tente novamente."
            onRetry={() => matrixQuery.refetch()}
          />
        ) : null}
        {filteredMatrix && filteredMatrix.clients.length === 0 ? (
          <EmptyState
            title={search ? 'Nenhum resultado encontrado' : 'Sem projetos no filtro'}
            description={
              search
                ? 'Revise o termo de busca ou limpe o campo para ver todos os projetos.'
                : 'Altere ano ou mes para ampliar a busca.'
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
