import { Activity, AlertTriangle, DollarSign, FolderOpen, Users } from 'lucide-react';
import {
  BudgetMonthlyChart,
  BudgetRankingList,
  CriticalAlertsBanner,
  PortfolioHealthChart,
  useDashboard,
} from '@/features/dashboard';
import { KpiCard } from '@/shared/components/KpiCard';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function DashboardPage() {
  const query = useDashboard();

  if (query.isLoading) {
    return (
      <>
        <PageHeader eyebrow="Visão Executiva" title="Dashboard" />
        <main className="p-5">
          <LoadingState />
        </main>
      </>
    );
  }

  if (query.isError || !query.data) {
    return (
      <>
        <PageHeader eyebrow="Visão Executiva" title="Dashboard" />
        <main className="p-5">
          <ErrorState
            title="Não foi possível carregar o dashboard"
            description="Verifique a API e tente novamente."
            onRetry={() => query.refetch()}
          />
        </main>
      </>
    );
  }

  const { kpis, portfolioHealth, budgetMonthly, criticalAlerts, budgetRanking } = query.data;

  return (
    <>
      <PageHeader
        eyebrow="Visão Executiva"
        title="Dashboard"
        description="Saúde do portfólio em tempo real."
      />
      <main className="flex flex-col gap-6 p-5">
        {/* KPI cards */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total de Projetos"
            value={String(kpis.totalProjects)}
            icon={FolderOpen}
            sparkData={[38, 40, 41, 44, 43, 46, kpis.totalProjects]}
          />
          <KpiCard
            title="Projetos em Risco"
            value={String(kpis.criticalProjects)}
            icon={AlertTriangle}
            tone={kpis.criticalProjects > 0 ? 'negative' : 'positive'}
            sparkData={[2, 3, 1, 2, 3, 4, kpis.criticalProjects]}
          />
          <KpiCard
            title="Utilização do Time"
            value={`${kpis.utilizationRate.toFixed(0)}%`}
            icon={Users}
            tone={
              kpis.utilizationRate > 100
                ? 'negative'
                : kpis.utilizationRate > 85
                  ? 'warning'
                  : 'positive'
            }
            sparkData={[70, 74, 78, 72, 80, 83, kpis.utilizationRate]}
          />
          <KpiCard
            title="Budget vs Realizado"
            value={BRL.format(kpis.totalRevenue)}
            description={`Custo: ${BRL.format(kpis.totalCost)}`}
            icon={DollarSign}
            trend={((kpis.totalRevenue - kpis.totalCost) / kpis.totalRevenue) * 100}
            sparkData={[800, 900, 850, 950, 1000, 1100, kpis.totalRevenue / 1000]}
          />
        </div>

        {/* Alerts */}
        {criticalAlerts.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              Alertas Críticos ({criticalAlerts.length})
            </p>
            <CriticalAlertsBanner alerts={criticalAlerts} />
          </div>
        )}

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="size-4" aria-hidden="true" />
                Saúde do Portfólio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PortfolioHealthChart data={portfolioHealth} />
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold tabular-nums text-health-ok">
                    {portfolioHealth.onTrack}
                  </p>
                  <p className="text-[11px] text-muted-foreground">No prazo</p>
                </div>
                <div>
                  <p className="text-lg font-bold tabular-nums text-health-alert">
                    {portfolioHealth.alert}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Alerta</p>
                </div>
                <div>
                  <p className="text-lg font-bold tabular-nums text-health-critical">
                    {portfolioHealth.critical}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Crítico</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custo Planejado vs Realizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetMonthlyChart data={budgetMonthly} />
            </CardContent>
          </Card>
        </div>

        {/* Budget ranking */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ranking de Consumo de Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetRankingList items={budgetRanking} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
