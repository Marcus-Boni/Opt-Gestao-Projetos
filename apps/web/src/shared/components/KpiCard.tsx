import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

type KpiTone = 'default' | 'positive' | 'negative' | 'warning';

type KpiCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  tone?: KpiTone;
  sparkData?: number[];
  trend?: number;
};

const toneClass: Record<KpiTone, string> = {
  default: 'text-foreground',
  positive: 'text-financial-positive',
  negative: 'text-financial-negative',
  warning: 'text-financial-warning',
};

const sparkColor: Record<KpiTone, string> = {
  default: 'hsl(var(--muted-foreground))',
  positive: 'hsl(var(--financial-positive))',
  negative: 'hsl(var(--financial-negative))',
  warning: 'hsl(var(--financial-warning))',
};

function Sparkline({ data, tone }: { data: number[]; tone: KpiTone }) {
  const chartData = data.map((v) => ({ v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={sparkColor[tone]}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function TrendBadge({ trend }: { trend: number }) {
  const isPositive = trend >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        'flex items-center gap-1 text-xs font-medium',
        isPositive ? 'text-financial-positive' : 'text-financial-negative',
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {Math.abs(trend).toFixed(1)}%
    </span>
  );
}

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  tone = 'default',
  sparkData,
  trend,
}: KpiCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className={cn('font-display text-2xl font-bold tabular-nums', toneClass[tone])}>
              {value}
            </p>
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {trend !== undefined ? <TrendBadge trend={trend} /> : null}
        </div>
        {sparkData && sparkData.length > 1 ? (
          <div className="mt-3">
            <Sparkline data={sparkData} tone={tone} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
