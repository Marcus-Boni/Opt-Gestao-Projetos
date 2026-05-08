import { Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { MatrixFilters } from '../api/projectsMatrixApi';

type YearMonthFilterProps = {
  value: MatrixFilters;
  onChange: (value: MatrixFilters) => void;
};

const years = [2025, 2024];
const months = [
  { value: undefined, label: 'Todos os meses' },
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Marco' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
] as const;

export function YearMonthFilter({ value, onChange }: YearMonthFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
        <Calendar aria-hidden="true" />
        <select
          className="bg-transparent text-sm outline-none"
          value={value.year ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              year: event.target.value ? Number(event.target.value) : undefined,
            })
          }
          aria-label="Filtrar por ano"
        >
          <option value="">Todos os anos</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <select
        className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={value.month ?? ''}
        onChange={(event) =>
          onChange({
            ...value,
            month: event.target.value ? Number(event.target.value) : undefined,
          })
        }
        aria-label="Filtrar por mes"
      >
        {months.map((month) => (
          <option key={month.label} value={month.value ?? ''}>
            {month.label}
          </option>
        ))}
      </select>
      <Button variant="outline" onClick={() => onChange({ year: 2025 })}>
        2025
      </Button>
    </div>
  );
}
