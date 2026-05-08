import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { BarChart3, BriefcaseBusiness, Settings, Users } from 'lucide-react';
import { AppSearch } from '@/shared/components/AppSearch';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { UserMenu } from '@/shared/components/UserMenu';
import { cn } from '@/shared/lib/utils';

const navItems = [
  {
    to: '/app/projetos',
    label: 'Projetos',
    description: 'Matriz financeira, clientes e projetos',
    icon: BriefcaseBusiness,
  },
  {
    to: '/app/relatorios',
    label: 'Relatorios',
    description: 'Indicadores executivos e acompanhamento',
    icon: BarChart3,
  },
  {
    to: '/app/colaboradores',
    label: 'Colaboradores',
    description: 'Equipe, horas e custos por pessoa',
    icon: Users,
  },
  {
    to: '/app/configuracoes',
    label: 'Configuracoes',
    description: 'Preferencias e parametros do sistema',
    icon: Settings,
  },
] as const;

export function AppShell() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-500 shadow-lg shadow-brand-500/20">
            <img src="/assets/logo.png" alt="Optsolv" className="h-6 w-auto brightness-0 invert" />
          </div>
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
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-foreground/75 hover:bg-accent hover:text-accent-foreground',
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
            <AppSearch navItems={navItems} />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
