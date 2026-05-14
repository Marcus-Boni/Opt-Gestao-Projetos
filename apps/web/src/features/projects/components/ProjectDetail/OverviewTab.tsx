import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/shared/lib/utils';
import type { ProjectDetailTabDto } from '../../api/projectsApi';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

type Props = { detail: ProjectDetailTabDto };

export function OverviewTab({ detail }: Props) {
  const chartData = detail.monthlyFinance.map((m) => ({
    name: m.month,
    Custo: m.cost,
    Margem: m.margin,
  }));

  const progressDiff = detail.progressActual - detail.progressPlanned;

  return (
    <div className="flex flex-col gap-6">
      {/* Timeline */}
      <div className="rounded-lg border bg-card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Linha do tempo
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{detail.startDate ?? '—'}</span>
          <div className="relative flex-1">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(detail.progressActual, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-muted-foreground">{detail.endDate ?? '—'}</span>
        </div>
        <div className="mt-2 flex gap-6 text-xs text-muted-foreground">
          <span>
            Planejado:{' '}
            <strong className="text-foreground">{detail.progressPlanned.toFixed(0)}%</strong>
          </span>
          <span>
            Realizado:{' '}
            <strong className={cn(progressDiff >= 0 ? 'text-health-ok' : 'text-health-alert')}>
              {detail.progressActual.toFixed(0)}%
            </strong>
          </span>
          {progressDiff !== 0 && (
            <span className={progressDiff > 0 ? 'text-health-ok' : 'text-health-alert'}>
              {progressDiff > 0 ? '+' : ''}
              {progressDiff.toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {/* Evolução mensal */}
      {chartData.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Evolução mensal
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => BRL.format(v)}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [
                  BRL.format(value as number),
                  name as string,
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="Custo"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Margem"
                stroke="hsl(var(--financial-positive))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Equipe */}
      {detail.team.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Equipe alocada
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {detail.team.map((member) => (
              <div key={member.name} className="flex items-center gap-3 rounded-md border p-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="text-[11px] text-muted-foreground">{member.role}</p>
                  <p className="text-[11px] tabular-nums text-muted-foreground">
                    {member.hoursActual}h / {member.hoursPlanned}h
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
