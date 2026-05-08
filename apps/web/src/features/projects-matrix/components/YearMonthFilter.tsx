import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { MatrixFilters } from '../api/projectsMatrixApi';

type YearMonthFilterProps = {
  value: MatrixFilters;
  onChange: (value: MatrixFilters) => void;
};

const years = [2026, 2025, 2024];
const months = [
  { value: 'all', label: 'Todos os meses' },
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Marco' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
] as const;

export function YearMonthFilter({ value, onChange }: YearMonthFilterProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(
    () => new Date(value.year ?? new Date().getFullYear(), (value.month ?? 1) - 1, 1),
    [value.month, value.year],
  );
  const selectedLabel = value.year
    ? value.month
      ? format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })
      : `Ano ${value.year}`
    : 'Todos os periodos';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start">
            <CalendarIcon data-icon="inline-start" />
            <span className="capitalize">{selectedLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <Calendar
            selected={selectedDate}
            onSelect={(date) => {
              onChange({ year: date.getFullYear(), month: date.getMonth() + 1 });
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Select
        value={value.year ? String(value.year) : 'all'}
        onValueChange={(nextYear) =>
          onChange({
            ...value,
            year: nextYear === 'all' ? undefined : Number(nextYear),
          })
        }
      >
        <SelectTrigger className="w-36" aria-label="Filtrar por ano">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">Todos os anos</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={value.month ? String(value.month) : 'all'}
        onValueChange={(nextMonth) =>
          onChange({
            ...value,
            month: nextMonth === 'all' ? undefined : Number(nextMonth),
          })
        }
      >
        <SelectTrigger className="w-44" aria-label="Filtrar por mes">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {months.map((month) => (
              <SelectItem key={month.label} value={String(month.value)}>
                {month.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button variant="secondary" onClick={() => onChange({ year: 2025 })}>
        2025
      </Button>
    </div>
  );
}
