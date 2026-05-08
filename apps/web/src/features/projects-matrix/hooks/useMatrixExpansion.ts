import type { MatrixClientDto, MatrixMonthDto, MatrixProjectDto } from '@optsolv/shared/schemas';
import { useCallback, useMemo, useState } from 'react';

type MatrixRowBase = {
  key: string;
  level: 0 | 1 | 2;
};

export type ClientRow = MatrixRowBase & {
  type: 'client';
  item: MatrixClientDto;
};

export type ProjectRow = MatrixRowBase & {
  type: 'project';
  item: MatrixProjectDto;
  clientId: string;
};

export type MonthRow = MatrixRowBase & {
  type: 'month';
  item: MatrixMonthDto;
  projectId: string;
};

export type MatrixRow = ClientRow | ProjectRow | MonthRow;

export function useMatrixExpansion(clients: MatrixClientDto[]) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((key: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const rows = useMemo(() => {
    const nextRows: MatrixRow[] = [];

    for (const client of clients) {
      const clientKey = `client:${client.id}`;
      nextRows.push({ key: clientKey, type: 'client', level: 0, item: client });

      if (!expanded.has(clientKey)) continue;

      for (const project of client.projects) {
        const projectKey = `project:${project.id}`;
        nextRows.push({
          key: projectKey,
          type: 'project',
          level: 1,
          item: project,
          clientId: client.id,
        });

        if (!expanded.has(projectKey)) continue;

        for (const month of project.months) {
          nextRows.push({
            key: `month:${month.id}`,
            type: 'month',
            level: 2,
            item: month,
            projectId: project.id,
          });
        }
      }
    }

    return nextRows;
  }, [clients, expanded]);

  return { expanded, rows, toggle };
}
