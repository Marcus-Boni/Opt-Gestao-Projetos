import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

type KpiCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  tone?: 'default' | 'positive' | 'negative' | 'warning';
};

const toneClass = {
  default: 'text-foreground',
  positive: 'text-financial-positive',
  negative: 'text-financial-negative',
  warning: 'text-financial-warning',
};

export function KpiCard({ title, value, description, icon: Icon, tone = 'default' }: KpiCardProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className={cn('font-display text-2xl font-bold tabular-nums', toneClass[tone])}>
          {value}
        </p>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
