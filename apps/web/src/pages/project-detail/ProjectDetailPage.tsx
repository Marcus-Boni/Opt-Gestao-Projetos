import { useParams } from '@tanstack/react-router';
import { BarChart3, Clock, TrendingUp, WalletCards } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useProjectDetail } from '@/features/projects-matrix';
import {
  currencyFormatter,
  formatDate,
  formatMonth,
  percentFormatter,
} from '@/features/projects-matrix/utils/formatters';
import { KpiCard } from '@/shared/components/KpiCard';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState, ProjectDetailSkeleton } from '@/shared/components/StateViews';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export function ProjectDetailPage() {
  const { projectId } = useParams({ from: '/app/projetos/$projectId' });
  const detailQuery = useProjectDetail(projectId);
  const detail = detailQuery.data;

  if (detailQuery.isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (detailQuery.isError || !detail) {
    return (
      <>
        <PageHeader title="Projeto" />
        <main className="p-5">
          <ErrorState
            title="Projeto nao encontrado"
            description="A API nao retornou dados para este projeto."
            onRetry={() => detailQuery.refetch()}
          />
        </main>
      </>
    );
  }

  const chartData = detail.months.map((month) => ({
    name: formatMonth(month.year, month.month),
    custo: month.harvestCost,
    margem: month.marginValue,
  }));

  return (
    <>
      <PageHeader
        eyebrow={detail.client.name}
        title={detail.name}
        description={`${formatDate(detail.startDate)} ate ${formatDate(detail.endDate)}`}
        actions={<Badge variant="secondary">{detail.status}</Badge>}
      />
      <main className="flex flex-col gap-4 p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Faturamento"
            value={currencyFormatter.format(detail.revenue)}
            icon={WalletCards}
          />
          <KpiCard
            title="Custo Harvest"
            value={currencyFormatter.format(detail.harvestCost)}
            icon={Clock}
          />
          <KpiCard
            title="Margem R$"
            value={currencyFormatter.format(detail.marginValue)}
            icon={TrendingUp}
            tone={detail.marginValue < 0 ? 'negative' : 'positive'}
          />
          <KpiCard
            title="Margem %"
            value={
              detail.marginPercent === null ? '-' : percentFormatter.format(detail.marginPercent)
            }
            icon={BarChart3}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Evolucao mensal</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => currencyFormatter.format(Number(value))} />
                <Bar dataKey="custo" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="margem"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Colaboradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {detail.collaborators.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_90px_120px] gap-3 rounded-md border p-3 text-sm"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-right font-mono tabular-nums">{item.hours}h</span>
                    <span className="text-right font-mono tabular-nums">
                      {currencyFormatter.format(item.cost)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Apontamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {detail.timeEntries.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[96px_1fr_70px] gap-3 rounded-md border p-3 text-sm"
                  >
                    <span className="text-muted-foreground">{formatDate(item.date)}</span>
                    <span className="truncate">{item.task}</span>
                    <span className="text-right font-mono tabular-nums">{item.hours}h</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
