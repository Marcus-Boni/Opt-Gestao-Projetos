import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, BriefcaseBusiness, Command, Search } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { fetchProjectsMatrix } from '@/features/projects-matrix/api/projectsMatrixApi';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';

type SearchNavItem = {
  to: string;
  label: string;
  description: string;
};

type AppSearchProps = {
  navItems: readonly SearchNavItem[];
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function AppSearch({ navItems }: AppSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const navigate = useNavigate();

  const matrixQuery = useQuery({
    queryKey: ['app-search', 'projects'],
    queryFn: () => fetchProjectsMatrix({ year: 2025 }),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const searchTerm = normalize(deferredQuery.trim());
  const visibleNavItems = useMemo(() => {
    if (!searchTerm) return navItems;
    return navItems.filter((item) =>
      normalize(`${item.label} ${item.description}`).includes(searchTerm),
    );
  }, [navItems, searchTerm]);

  const visibleProjects = useMemo(() => {
    if (!searchTerm) return [];
    return (
      matrixQuery.data?.clients.flatMap((client) =>
        client.projects
          .filter((project) =>
            normalize(`${client.name} ${project.name} ${project.code ?? ''}`).includes(searchTerm),
          )
          .slice(0, 4)
          .map((project) => ({ ...project, clientName: client.name })),
      ) ?? []
    ).slice(0, 6);
  }, [matrixQuery.data, searchTerm]);

  const hasResults = visibleNavItems.length > 0 || visibleProjects.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="hidden gap-2 md:inline-flex">
          <Command data-icon="inline-start" />
          Buscar
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            Ctrl K
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(34rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar telas, clientes ou projetos"
            className="border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
        <div className="max-h-96 overflow-auto p-2">
          {visibleNavItems.length > 0 ? (
            <div className="flex flex-col gap-1">
              <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                Navegacao
              </p>
              {visibleNavItems.map((item) => (
                <Button
                  key={item.to}
                  variant="ghost"
                  className="h-auto justify-start px-2 py-2 text-left"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to={item.to}>
                    <ArrowRight data-icon="inline-start" />
                    <span className="flex flex-col">
                      <span>{item.label}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </Button>
              ))}
            </div>
          ) : null}
          {visibleProjects.length > 0 ? (
            <div className="mt-2 flex flex-col gap-1">
              <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                Projetos
              </p>
              {visibleProjects.map((project) => (
                <Button
                  key={project.id}
                  type="button"
                  variant="ghost"
                  className="h-auto justify-start px-2 py-2 text-left"
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: '/app/projetos/$projectId', params: { projectId: project.id } });
                  }}
                >
                  <BriefcaseBusiness data-icon="inline-start" />
                  <span className="flex flex-col">
                    <span>{project.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {project.clientName}
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          ) : null}
          {!hasResults ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
