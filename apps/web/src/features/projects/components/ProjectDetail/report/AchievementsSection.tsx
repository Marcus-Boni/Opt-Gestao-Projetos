import { CalendarDays, Trophy } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { cn } from '@/shared/lib/utils';

// Placeholder — futuramente virá do opt-time via API
type WorkItem = {
  id: string;
  title: string;
  type: 'Epic' | 'Feature' | 'Task';
  completedAt: string; // YYYY-MM-DD
  assignee: string;
};

const PLACEHOLDER_ITEMS: WorkItem[] = [
  {
    id: '1',
    title: 'Módulo de autenticação implementado',
    type: 'Feature',
    completedAt: '2026-04-15',
    assignee: 'Ana Souza',
  },
  {
    id: '2',
    title: 'Pipeline de CI/CD configurado',
    type: 'Task',
    completedAt: '2026-04-22',
    assignee: 'Carlos Lima',
  },
  {
    id: '3',
    title: 'Épico de gestão de projetos concluído',
    type: 'Epic',
    completedAt: '2026-05-01',
    assignee: 'Maria Paula',
  },
];

const TYPE_STYLES: Record<WorkItem['type'], string> = {
  Epic: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Feature: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Task: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const PERIOD_OPTIONS = [
  { label: 'Todos os períodos', value: 'all' },
  { label: 'Últimos 30 dias', value: '30' },
  { label: 'Últimos 90 dias', value: '90' },
  { label: 'Este mês', value: 'month' },
];

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function filterByPeriod(items: WorkItem[], period: string): WorkItem[] {
  if (period === 'all') return items;
  const now = new Date();
  return items.filter((item) => {
    const date = new Date(item.completedAt);
    if (period === '30') {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 30);
      return date >= cutoff;
    }
    if (period === '90') {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 90);
      return date >= cutoff;
    }
    if (period === 'month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  });
}

type Props = { isPrintMode?: boolean };

export function AchievementsSection({ isPrintMode = false }: Props) {
  const [period, setPeriod] = useState('all');
  const filteredItems = filterByPeriod(PLACEHOLDER_ITEMS, period);

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-primary" aria-hidden="true" />
          <h3 className="font-semibold text-foreground">Conquistas</h3>
        </div>

        {!isPrintMode && (
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 w-48 text-xs" aria-label="Filtrar conquistas por período">
              <CalendarDays className="mr-1.5 size-3.5 shrink-0 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <p className="mb-3 rounded-md bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
        🔗 Integração com <strong className="font-medium">opt-time</strong> em desenvolvimento — os
        itens abaixo são dados de exemplo.
      </p>

      {filteredItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhuma conquista no período selecionado.
        </p>
      ) : (
        <ul className="flex flex-col divide-y">
          {filteredItems.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span
                className={cn(
                  'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  TYPE_STYLES[item.type],
                )}
              >
                {item.type}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {item.assignee} · {formatDate(item.completedAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
