import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProjectTable, useProjectCenter } from '@/features/projects';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StateViews';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function ProjectsPage() {
  const query = useProjectCenter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredGroups = useMemo(() => {
    if (!query.data) return [];
    const term = normalize(search.trim());
    return query.data.groups
      .map((group) => ({
        ...group,
        projects: group.projects.filter((p) => {
          const matchesSearch =
            !term || normalize(`${p.name} ${p.clientName} ${p.code ?? ''}`).includes(term);
          const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
          return matchesSearch && matchesStatus;
        }),
      }))
      .filter((g) => g.projects.length > 0);
  }, [query.data, search, statusFilter]);

  if (query.isLoading) {
    return (
      <>
        <PageHeader eyebrow="Project Center" title="Projetos" />
        <main className="p-5">
          <LoadingState />
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Project Center"
        title="Projetos"
        description="Portfólio agrupado por gerente responsável."
      />
      <main className="flex flex-col gap-4 p-5">
        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-md border bg-background px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por projeto, cliente ou código"
              className="border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="no_prazo">No prazo</SelectItem>
              <SelectItem value="alerta">Alerta</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {query.isError && (
          <ErrorState
            title="Não foi possível carregar os projetos"
            description="Verifique a API e tente novamente."
            onRetry={() => query.refetch()}
          />
        )}

        {!query.isError && filteredGroups.length === 0 && (
          <EmptyState
            title="Nenhum projeto encontrado"
            description="Ajuste os filtros para ampliar a busca."
          />
        )}

        {filteredGroups.length > 0 && <ProjectTable groups={filteredGroups} />}
      </main>
    </>
  );
}
