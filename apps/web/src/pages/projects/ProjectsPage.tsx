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
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');

  const filterOptions = useMemo(() => {
    if (!query.data) return { clients: [], projects: [], scopes: [] };
    const allProjects = query.data.groups.flatMap((g) => g.projects);
    const clients = Array.from(new Set(allProjects.map((p) => p.clientName))).sort();
    const projects = Array.from(new Set(allProjects.map((p) => p.name))).sort();
    const scopes = Array.from(new Set(allProjects.map((p) => p.scope).filter(Boolean))).sort();
    return { clients, projects, scopes };
  }, [query.data]);

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
          const matchesClient = clientFilter === 'all' || p.clientName === clientFilter;
          const matchesProject = projectFilter === 'all' || p.name === projectFilter;
          const matchesScope = scopeFilter === 'all' || p.scope === scopeFilter;

          return matchesSearch && matchesStatus && matchesClient && matchesProject && matchesScope;
        }),
      }))
      .filter((g) => g.projects.length > 0);
  }, [query.data, search, statusFilter, clientFilter, projectFilter, scopeFilter]);

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
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-md border bg-background px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por projeto, cliente ou código"
                className="border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full sm:w-44 flex-1 sm:flex-none">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {filterOptions.clients.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full sm:w-44 flex-1 sm:flex-none">
                <SelectValue placeholder="Projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                {filterOptions.projects.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger className="w-full sm:w-44 flex-1 sm:flex-none">
                <SelectValue placeholder="Escopo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os escopos</SelectItem>
                {filterOptions.scopes.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 flex-1 sm:flex-none">
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
