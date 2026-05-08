import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatDate(value: string | null) {
  if (!value) return '-';
  return format(new Date(`${value}T00:00:00`), 'dd/MM/yyyy', { locale: ptBR });
}

export function formatMonth(year: number, month: number) {
  return format(new Date(year, month - 1, 1), 'MMM/yyyy', { locale: ptBR });
}
