import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  BriefcaseBusiness,
  CheckSquare,
  DollarSign,
  LayoutDashboard,
  Menu,
  PanelLeft,
  Settings,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { AppSearch } from '@/shared/components/AppSearch';
import { useAllowedNavItems } from '@/shared/components/RoleGuard';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { UserMenu } from '@/shared/components/UserMenu';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { authClient } from '@/shared/lib/auth-client';
import { cn } from '@/shared/lib/utils';
import { type UserRole, useRoleStore } from '@/shared/stores/roleStore';
import { useSidebarStore } from '@/shared/stores/sidebarStore';

const SIDEBAR_W = 256;
const COLLAPSED_W = 72;

const navItems = [
  {
    to: '/app/dashboard',
    label: 'Dashboard',
    description: 'Visão executiva do portfólio',
    icon: LayoutDashboard,
  },
  {
    to: '/app/tarefas',
    label: 'Minhas Tarefas',
    description: 'Kanban e lista de tarefas',
    icon: CheckSquare,
  },
  {
    to: '/app/projetos',
    label: 'Project Center',
    description: 'Gestão completa de projetos',
    icon: BriefcaseBusiness,
  },
  {
    to: '/app/financeiro',
    label: 'Financeiro',
    description: 'Matriz financeira e rentabilidade',
    icon: DollarSign,
  },
  {
    to: '/app/relatorios',
    label: 'Relatórios',
    description: 'Status report e exportações',
    icon: BarChart3,
  },
  {
    to: '/app/recursos',
    label: 'Recursos',
    description: 'Equipe, alocação e capacidade',
    icon: Users,
  },
  {
    to: '/app/configuracoes',
    label: 'Configurações',
    description: 'Perfis, integrações e auditoria',
    icon: Settings,
  },
] as const;

type NavItem = (typeof navItems)[number];

function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = pathname.startsWith(item.to);
  const Icon = item.icon;

  const linkEl = (
    <Link
      to={item.to}
      className={cn(
        'flex items-center rounded-lg text-sm font-medium transition-colors',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        collapsed ? 'size-10 justify-center' : 'w-full gap-3 px-3 py-2.5',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="lbl"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.12 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{linkEl}</div>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          <p className="font-semibold">{item.label}</p>
          <p className="text-muted-foreground">{item.description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkEl;
}

function SidebarContent({
  collapsed,
  isMobile = false,
  onClose,
}: {
  collapsed: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const allowedItems = useAllowedNavItems(navItems);
  return (
    <>
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b',
          collapsed ? 'justify-center px-3' : 'gap-3 px-4',
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
          <img src="/assets/logo.png" alt="Optsolv" className="h-5 w-auto brightness-0 invert" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex min-w-0 flex-1 flex-col overflow-hidden"
            >
              <p className="font-display text-sm font-bold leading-tight">Optsolv PMS</p>
              <p className="text-xs leading-tight text-muted-foreground">Gestão de projetos</p>
            </motion.div>
          )}
        </AnimatePresence>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          'flex flex-1 flex-col gap-0.5 overflow-y-auto py-3',
          collapsed ? 'items-center px-2' : 'px-2',
        )}
      >
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              key="nav-hd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50"
            >
              Menu
            </motion.p>
          )}
        </AnimatePresence>
        {allowedItems.map((item) => (
          <SidebarItem key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      <div className={cn('shrink-0 border-t p-3', collapsed ? 'flex justify-center' : '')}>
        <AnimatePresence initial={false} mode="wait">
          {collapsed ? (
            <motion.div
              key="dot"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
              className="size-2.5 rounded-full bg-primary/40"
            />
          ) : (
            <motion.div
              key="ver"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="rounded-md bg-muted/50 px-2.5 py-2"
            >
              <p className="text-[10px] font-medium text-muted-foreground">Optsolv PMS · v0.1</p>
              <p className="text-[10px] text-muted-foreground/60">Ambiente de desenvolvimento</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function TopBar({
  onMobileMenu,
  onToggle,
  collapsed,
}: {
  onMobileMenu: () => void;
  onToggle: () => void;
  collapsed: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenu}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <PanelLeft className="size-5" />
          </motion.div>
        </Button>
        <AppSearch
          navItems={navItems as readonly { to: string; label: string; description: string }[]}
        />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

function SimulationBanner({ role, onClear }: { role: UserRole; onClear: () => void }) {
  const roleLabel =
    role === 'gerente' ? 'Gerente' : role === 'usuario' ? 'Usuário' : 'Administrador';
  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 px-4 py-2 text-xs flex justify-between items-center font-medium shadow-sm shrink-0 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
        <span>
          Você está visualizando o sistema PMS com as permissões de <strong>{roleLabel}</strong>.
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onClear}
        className="h-6 px-2 text-[10px] border-amber-500/35 hover:bg-amber-500/10 text-amber-800 dark:text-amber-300 font-semibold"
      >
        Voltar ao Perfil Real
      </Button>
    </div>
  );
}

export function AppShell() {
  const { collapsed, mobileOpen, toggle, setMobileOpen } = useSidebarStore();
  const session = authClient.useSession();
  const userId = session.data?.user?.id;

  const simulatedRole = useRoleStore((s) => s.simulatedRole);
  const setSimulatedRole = useRoleStore((s) => s.setSimulatedRole);
  const userRoles = useRoleStore((s) => s.userRoles);

  const realRole = userId
    ? userRoles[userId] || (Object.keys(userRoles).length === 0 ? 'admin' : 'usuario')
    : 'usuario';

  const isSimulating = realRole === 'admin' && simulatedRole !== null;

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card shadow-2xl lg:hidden"
          >
            <SidebarContent collapsed={false} isMobile onClose={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        initial={{ width: collapsed ? COLLAPSED_W : SIDEBAR_W }}
        animate={{ width: collapsed ? COLLAPSED_W : SIDEBAR_W }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden border-r bg-card lg:flex"
      >
        <SidebarContent collapsed={collapsed} />
      </motion.aside>

      {/* Desktop content */}
      <motion.div
        initial={{ paddingLeft: collapsed ? COLLAPSED_W : SIDEBAR_W }}
        animate={{ paddingLeft: collapsed ? COLLAPSED_W : SIDEBAR_W }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="hidden lg:block"
      >
        {isSimulating && simulatedRole && (
          <SimulationBanner role={simulatedRole} onClear={() => setSimulatedRole(null)} />
        )}
        <TopBar onMobileMenu={() => setMobileOpen(true)} onToggle={toggle} collapsed={collapsed} />
        <Outlet />
      </motion.div>

      {/* Mobile content */}
      <div className="lg:hidden">
        {isSimulating && simulatedRole && (
          <SimulationBanner role={simulatedRole} onClear={() => setSimulatedRole(null)} />
        )}
        <TopBar onMobileMenu={() => setMobileOpen(true)} onToggle={toggle} collapsed={collapsed} />
        <Outlet />
      </div>
    </div>
  );
}
