import type { ProjectsMatrixResponseDto } from '@optsolv/shared/schemas';
import { describe, expect, it } from 'vitest';
import { filterProjectsMatrixBySearch } from './search';

const matrix = {
  filters: { year: 2025, month: null },
  clients: [
    {
      id: 'client-1',
      name: 'Acme Energia',
      taxId: '11.111.111/0001-11',
      revenue: 100,
      expenses: 20,
      commissions: 10,
      taxes: 5,
      harvestCost: 30,
      budget: 120,
      hours: 8,
      marginValue: 35,
      marginPercent: 0.35,
      remainingBudget: 90,
      projects: [
        {
          id: 'project-1',
          name: 'Portal Comercial',
          code: 'PC-001',
          startDate: null,
          endDate: null,
          status: 'active',
          revenue: 100,
          expenses: 20,
          commissions: 10,
          taxes: 5,
          harvestCost: 30,
          budget: 120,
          hours: 8,
          marginValue: 35,
          marginPercent: 0.35,
          remainingBudget: 90,
          months: [],
        },
      ],
    },
    {
      id: 'client-2',
      name: 'Beta Saude',
      taxId: null,
      revenue: 50,
      expenses: 10,
      commissions: 5,
      taxes: 3,
      harvestCost: 12,
      budget: 60,
      hours: 4,
      marginValue: 20,
      marginPercent: 0.4,
      remainingBudget: 48,
      projects: [
        {
          id: 'project-2',
          name: 'App Clinico',
          code: 'MED-222',
          startDate: null,
          endDate: null,
          status: 'paused',
          revenue: 50,
          expenses: 10,
          commissions: 5,
          taxes: 3,
          harvestCost: 12,
          budget: 60,
          hours: 4,
          marginValue: 20,
          marginPercent: 0.4,
          remainingBudget: 48,
          months: [],
        },
      ],
    },
  ],
  total: {
    revenue: 150,
    expenses: 30,
    commissions: 15,
    taxes: 8,
    harvestCost: 42,
    budget: 180,
    hours: 12,
    marginValue: 55,
    marginPercent: 0.36,
    remainingBudget: 138,
  },
} satisfies ProjectsMatrixResponseDto;

describe('filterProjectsMatrixBySearch', () => {
  it('keeps the original matrix when the query is blank', () => {
    expect(filterProjectsMatrixBySearch(matrix, '   ')).toBe(matrix);
  });

  it('filters by client name', () => {
    const filtered = filterProjectsMatrixBySearch(matrix, 'acme');
    expect(filtered.clients).toHaveLength(1);
    expect(filtered.clients[0]?.name).toBe('Acme Energia');
  });

  it('filters by project code while preserving the owning client', () => {
    const filtered = filterProjectsMatrixBySearch(matrix, 'med-222');
    expect(filtered.clients).toHaveLength(1);
    expect(filtered.clients[0]?.name).toBe('Beta Saude');
    expect(filtered.clients[0]?.projects).toHaveLength(1);
    expect(filtered.clients[0]?.projects[0]?.name).toBe('App Clinico');
  });
});
