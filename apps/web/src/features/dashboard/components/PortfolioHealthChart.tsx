import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { PortfolioHealthDto } from '../api/dashboardApi';

const COLORS = ['hsl(var(--health-ok))', 'hsl(var(--health-alert))', 'hsl(var(--health-critical))'];

const LABELS = ['No prazo', 'Alerta', 'Crítico'];

type Props = { data: PortfolioHealthDto };

export function PortfolioHealthChart({ data }: Props) {
  const chartData = [
    { name: LABELS[0], value: data.onTrack },
    { name: LABELS[1], value: data.alert },
    { name: LABELS[2], value: data.critical },
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => {
            const fill = COLORS[index % COLORS.length];
            return fill ? <Cell key={entry.name} fill={fill} /> : null;
          })}
        </Pie>
        <Tooltip
          formatter={(value: unknown, name: unknown) => [value as number, name as string]}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '12px',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
