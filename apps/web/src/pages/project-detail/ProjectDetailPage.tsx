import { useParams } from '@tanstack/react-router';
import { DollarSign, Gauge, TrendingUp, Users } from 'lucide-react';
import {
  CostsTab,
  OverviewTab,
  ProjectStatusBadge,
  ResourcesTab,
  useProjectDetailFull,
} from '@/features/projects';
import { KpiCard } from '@/shared/components/KpiCard';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState, ProjectDetailSkeleton } from '@/shared/components/StateViews';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const PCT = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function ProjectDetailPage() {
  const { projectId } = useParams({ from: '/app/projetos/$projectId' });
  const query = useProjectDetailFull(projectId);
  const detail = query.data;

  if (query.isLoading) return <ProjectDetailSkeleton />;

  if (query.isError || !detail) {
    return (
      <>
        <PageHeader title="Projeto" />
        <main className="p-5">
          <ErrorState
            title="Projeto não encontrado"
            description="A API não retornou dados para este projeto."
            onRetry={() => query.refetch()}
          />
        </main>
      </>
    );
  }

  const budgetUsedPct = detail.budgetTotal > 0 ? detail.budgetUsed / detail.budgetTotal : 0;

  return (
    <>
      <PageHeader
        eyebrow={detail.clientName}
        title={detail.name}
        {...(detail.code ? { description: detail.code } : {})}
        actions={<ProjectStatusBadge status={detail.status} size="md" />}
      />
      <main className="flex flex-col gap-4 p-5">
        {/* KPI cards */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Progresso"
            value={`${detail.progressActual.toFixed(0)}%`}
            description={`Planejado: ${detail.progressPlanned.toFixed(0)}%`}
            icon={Gauge}
            tone={detail.progressActual >= detail.progressPlanned ? 'positive' : 'warning'}
          />
          <KpiCard
            title="Budget Realizado"
            value={BRL.format(detail.budgetUsed)}
            description={`Total: ${BRL.format(detail.budgetTotal)}`}
            icon={DollarSign}
            tone={budgetUsedPct > 0.85 ? 'negative' : budgetUsedPct > 0.7 ? 'warning' : 'positive'}
          />
          <KpiCard
            title="Margem"
            value={detail.marginPercent !== null ? PCT.format(detail.marginPercent) : '—'}
            icon={TrendingUp}
            tone={
              detail.marginPercent === null
                ? 'default'
                : detail.marginPercent < 0
                  ? 'negative'
                  : detail.marginPercent < 0.05
                    ? 'warning'
                    : 'positive'
            }
          />
          <KpiCard
            title="Equipe"
            value={String(detail.team.length)}
            description="Membros alocados"
            icon={Users}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="recursos">Recursos</TabsTrigger>
            <TabsTrigger value="custos">Custos</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <OverviewTab detail={detail} />
          </TabsContent>
          <TabsContent value="recursos" className="mt-4">
            <ResourcesTab detail={detail} />
          </TabsContent>
          <TabsContent value="custos" className="mt-4">
            <CostsTab detail={detail} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
