import { Check, Search, Shield, ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CadastrosTab } from '@/features/settings/components/CadastrosTab';
import { useUsers } from '@/features/settings/hooks/useProjectsAdmin';
import { PageHeader } from '@/shared/components/PageHeader';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { authClient } from '@/shared/lib/auth-client';
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  type UserRole,
  useRoleStore,
} from '@/shared/stores/roleStore';

function AccessTab() {
  const {
    simulatedRole,
    setSimulatedRole,
    permissions,
    togglePermission,
    resetPermissions,
    userRoles,
    setUserRole,
  } = useRoleStore();
  const { data: usersList, isLoading } = useUsers();
  const session = authClient.useSession();
  const activeUserId = session.data?.user?.id;

  // Filters and search states for Directory
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  const realRole = activeUserId
    ? userRoles[activeUserId] || (Object.keys(userRoles).length === 0 ? 'admin' : 'usuario')
    : 'usuario';

  const isAdmin = realRole === 'admin';

  const modules = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      category: 'Operacional',
      desc: 'Resumo executivo do portfólio',
    },
    {
      key: 'tarefas',
      label: 'Minhas Tarefas',
      category: 'Operacional',
      desc: 'Kanban e listas de tarefas',
    },
    {
      key: 'projetos',
      label: 'Project Center',
      category: 'Gestão',
      desc: 'Gestão completa de projetos',
    },
    {
      key: 'financeiro',
      label: 'Financeiro',
      category: 'Gestão',
      desc: 'Controle de orçamentos e custos',
    },
    {
      key: 'relatorios',
      label: 'Relatórios',
      category: 'Gestão',
      desc: 'Status report e exportações',
    },
    {
      key: 'recursos',
      label: 'Recursos',
      category: 'Gestão',
      desc: 'Capacidade e alocação de equipes',
    },
    {
      key: 'configuracoes',
      label: 'Configurações',
      category: 'Configuração',
      desc: 'Administração de acessos e integrações',
    },
  ];

  const roles: UserRole[] = ['admin', 'gerente', 'usuario'];

  // Filtered users directory list
  const filteredUsers = (usersList || []).filter((u) => {
    const uRole =
      userRoles[u.id] ||
      (Object.keys(userRoles).length === 0 && u.id === activeUserId ? 'admin' : 'usuario');
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || uRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSimulationToggle = (r: UserRole) => {
    if (simulatedRole === r) {
      setSimulatedRole(null);
      toast.success('Retornado ao perfil real de Administrador');
    } else {
      setSimulatedRole(r);
      toast.success(`Simulando acesso como ${ROLE_LABELS[r]}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Administrative Impersonation Panel */}
      {isAdmin ? (
        <Card className="overflow-hidden border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/[0.02]">
          <CardHeader className="pb-3 border-b border-amber-500/10">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-amber-600 dark:text-amber-400" />
              <div>
                <CardTitle className="text-sm font-semibold">
                  Simulador Administrativo de Perfis
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Como Administrador, experimente as restrições e visualizações do sistema de cada
                  perfil de acesso.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3">
              {roles.map((r) => {
                const isCurrent = simulatedRole === r || (simulatedRole === null && r === 'admin');
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSimulationToggle(r)}
                    className={`flex-1 min-w-[150px] text-left p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary'
                        : 'border-border bg-background hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {ROLE_LABELS[r]}
                      </span>
                      {isCurrent && <Check className="size-3.5 text-primary font-bold" />}
                    </div>
                    <p className="mt-1 text-[11px] leading-tight text-muted-foreground/90 font-normal">
                      {ROLE_DESCRIPTIONS[r]}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/[0.02]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-blue-500" />
              <div>
                <CardTitle className="text-sm font-medium">Seu Perfil de Acesso</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Você possui acesso operacional sob as diretrizes de{' '}
                  <strong>{ROLE_LABELS[realRole]}</strong>.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Dynamic Permission Matrix Layout */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">Matriz de Permissões de Perfis</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Defina em tempo real o que Administradores, Gerentes e Usuários podem visualizar no
              PMS.
            </p>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetPermissions();
                toast.success('Permissões restauradas aos valores padrão');
              }}
              className="h-8 text-xs"
            >
              Restaurar Padrões
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0 border-t">
          {['Operacional', 'Gestão', 'Configuração'].map((cat) => {
            const catModules = modules.filter((m) => m.category === cat);
            if (catModules.length === 0) return null;

            return (
              <div key={cat} className="border-b last:border-b-0 pb-4">
                <div className="bg-muted/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b">
                  Categoria: {cat}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {catModules.map((m) => (
                    <div
                      key={m.key}
                      className="flex flex-col justify-between p-3.5 rounded-lg border bg-card shadow-sm hover:border-accent-foreground/10 transition-colors"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{m.label}</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                          {m.desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t flex items-center justify-between gap-1">
                        {roles.map((r) => {
                          const isAllowed = permissions[m.key]?.includes(r) ?? false;
                          return (
                            <button
                              key={r}
                              type="button"
                              disabled={!isAdmin}
                              onClick={() => {
                                togglePermission(m.key, r);
                                toast.info(
                                  `Permissão do perfil ${ROLE_LABELS[r]} alterada para o módulo ${m.label}`,
                                );
                              }}
                              className={`flex flex-col items-center flex-1 py-1 px-1.5 rounded transition-all text-center ${
                                !isAdmin ? 'cursor-default' : 'hover:bg-muted'
                              }`}
                            >
                              <span className="text-[9px] font-medium text-muted-foreground uppercase mb-1">
                                {r.substring(0, 3)}
                              </span>
                              <div
                                className={`size-5 rounded-full flex items-center justify-center border transition-colors ${
                                  isAllowed
                                    ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-600'
                                    : 'bg-destructive/5 border-destructive/20 text-destructive/70'
                                }`}
                              >
                                {isAllowed ? (
                                  <Check className="size-3" />
                                ) : (
                                  <X className="size-2.5" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Custom Interactive Directory List */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">
                Diretório de Perfis de Colaboradores
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gerencie a atribuição de permissões reais dos usuários cadastrados.
              </p>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filtrar por nome/email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 w-[200px] pl-8 text-xs"
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(val) => setRoleFilter(val as 'all' | UserRole)}
              >
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue placeholder="Filtrar Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Perfis</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="usuario">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs">Colaborador</TableHead>
                  <TableHead className="text-xs">E-mail</TableHead>
                  <TableHead className="text-xs">Perfil Real</TableHead>
                  {isAdmin && <TableHead className="text-right text-xs">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 4 : 3}
                      className="text-center py-8 text-xs text-muted-foreground"
                    >
                      Carregando usuários...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 4 : 3}
                      className="text-center py-8 text-xs text-muted-foreground"
                    >
                      Nenhum colaborador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => {
                    const uRole =
                      userRoles[u.id] ||
                      (Object.keys(userRoles).length === 0 && u.id === activeUserId
                        ? 'admin'
                        : 'usuario');
                    return (
                      <TableRow key={u.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-semibold text-xs">{u.name || '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.email || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              uRole === 'admin'
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-400 dark:border-emerald-500/30'
                                : uRole === 'gerente'
                                  ? 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-400 dark:border-blue-500/30'
                                  : 'bg-slate-500/10 text-slate-700 border-slate-500/25 dark:text-slate-400 dark:border-slate-500/30'
                            }
                          >
                            {ROLE_LABELS[uRole]}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Select
                                value={uRole}
                                onValueChange={(val: UserRole) => {
                                  setUserRole(u.id, val);
                                  toast.success(
                                    `Perfil de ${u.name || u.email} atualizado para ${ROLE_LABELS[val]}`,
                                  );
                                }}
                              >
                                <SelectTrigger className="h-8 w-[150px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Administrador / GP</SelectItem>
                                  <SelectItem value="gerente">Gerente</SelectItem>
                                  <SelectItem value="usuario">Usuário</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationsTab() {
  const [adoOrg, setAdoOrg] = useState('');
  const [adoPat, setAdoPat] = useState('');
  const [optTimeToken, setOptTimeToken] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Azure DevOps</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="ado-org" className="text-xs font-medium text-muted-foreground">
              Organization URL
            </label>
            <Input
              id="ado-org"
              value={adoOrg}
              onChange={(e) => setAdoOrg(e.target.value)}
              placeholder="https://dev.azure.com/organization"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="ado-pat" className="text-xs font-medium text-muted-foreground">
              PAT Token
            </label>
            <Input
              id="ado-pat"
              type="password"
              value={adoPat}
              onChange={(e) => setAdoPat(e.target.value)}
              placeholder="••••••••••••••••"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info('Conexão ADO: não configurada ainda')}
            >
              Testar conexão
            </Button>
            <Button size="sm" onClick={() => toast.success('Configurações ADO salvas')}>
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">OPT-TIME</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="opttime-token" className="text-xs font-medium text-muted-foreground">
              Access Token
            </label>
            <Input
              id="opttime-token"
              type="password"
              value={optTimeToken}
              onChange={(e) => setOptTimeToken(e.target.value)}
              placeholder="••••••••••••••••"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info('Conexão OPT-TIME: não configurada ainda')}
            >
              Testar conexão
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success('Sincronização iniciada')}
            >
              Sincronizar agora
            </Button>
            <Button size="sm" onClick={() => toast.success('Configurações OPT-TIME salvas')}>
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SystemTab() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Informações do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Versão</p>
            <p className="font-semibold">0.2.0</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ambiente</p>
            <p className="font-semibold">Desenvolvimento</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stack</p>
            <p className="font-semibold">React 18 · Fastify · Drizzle</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Banco</p>
            <p className="font-semibold">PostgreSQL (fixtures)</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast.success('Cache atualizado')}>
          Forçar atualização de cache
        </Button>
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Configurações"
        title="Configurações do Sistema"
        description="Perfis, integrações e parâmetros do sistema."
      />
      <main className="p-5">
        <Tabs defaultValue="access">
          <TabsList>
            <TabsTrigger value="access">Acesso</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="registrations">Cadastros</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>
          <TabsContent value="access" className="mt-4">
            <AccessTab />
          </TabsContent>
          <TabsContent value="integrations" className="mt-4">
            <IntegrationsTab />
          </TabsContent>
          <TabsContent value="registrations" className="mt-4">
            <CadastrosTab />
          </TabsContent>
          <TabsContent value="system" className="mt-4">
            <SystemTab />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
