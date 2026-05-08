import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { BarChart3, BriefcaseBusiness, Command, Settings, Users } from 'lucide-react';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

const navItems = [
  { to: '/app/projetos', label: 'Projetos', icon: BriefcaseBusiness },
  { to: '/app/relatorios', label: 'Relatorios', icon: BarChart3 },
  { to: '/app/colaboradores', label: 'Colaboradores', icon: Users },
  { to: '/app/configuracoes', label: 'Configuracoes', icon: Settings },
] as const;

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <img src="/assets/logo.png" alt="Optsolv" className="h-9 w-auto" />
          <div>
            <p className="font-display text-sm font-bold">Optsolv PMS</p>
            <p className="text-xs text-muted-foreground">Gestao de projetos</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Icon aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="hidden gap-2 md:inline-flex">
              <Command data-icon="inline-start" />
              Buscar
              <Badge variant="secondary">Ctrl K</Badge>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm">
              MS
            </Button>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
