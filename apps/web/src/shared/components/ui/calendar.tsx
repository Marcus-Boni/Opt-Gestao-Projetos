import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

type CalendarProps = {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
};

const weekDays = [
  ['domingo', 'D'],
  ['segunda', 'S'],
  ['terca', 'T'],
  ['quarta', 'Q'],
  ['quinta', 'Q'],
  ['sexta', 'S'],
  ['sabado', 'S'],
] as const;

export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => selected ?? new Date());
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { locale: ptBR });
    const end = endOfWeek(endOfMonth(visibleMonth), { locale: ptBR });
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  return (
    <div className={cn('rounded-md bg-popover text-popover-foreground', className)}>
      <div className="mb-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
          aria-label="Mes anterior"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <p className="text-sm font-semibold capitalize">
          {format(visibleMonth, 'MMMM yyyy', { locale: ptBR })}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
          aria-label="Proximo mes"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {weekDays.map(([key, label]) => (
          <span key={key} className="flex h-8 items-center justify-center font-medium">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = selected ? isSameDay(day, selected) : false;
          return (
            <Button
              key={day.toISOString()}
              type="button"
              variant={isSelected ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'size-8 text-xs',
                !isSameMonth(day, visibleMonth) && 'text-muted-foreground opacity-50',
              )}
              onClick={() => onSelect?.(day)}
            >
              {format(day, 'd')}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
