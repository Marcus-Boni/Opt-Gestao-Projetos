import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { type UserRole, useRoleStore } from '@/shared/stores/roleStore';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador / GP',
  gerente: 'Gerente',
  usuario: 'Usuário',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Acesso completo a todos os módulos, incluindo Financeiro e Configurações.',
  gerente: 'Acesso a Dashboard, Projetos, Tarefas, Relatórios e Recursos.',
  usuario: 'Acesso somente leitura ao Dashboard.',
};

const MODULE_MATRIX = [
  { module: 'Dashboard', admin: '✅ Full', gerente: '✅ Full', usuario: '👁 Leitura' },
  { module: 'Minhas Tarefas', admin: '✅ Full', gerente: '✅ Full', usuario: '❌' },
  { module: 'Project Center', admin: '✅ Full', gerente: '👁 Leitura', usuario: '❌' },
  { module: 'Financeiro', admin: '✅ Full', gerente: '❌', usuario: '❌' },
  { module: 'Relatórios', admin: '✅ Full', gerente: '✅ Gerar', usuario: '❌' },
  { module: 'Recursos', admin: '✅ Full', gerente: '👁 Leitura', usuario: '❌' },
  { module: 'Configurações', admin: '✅ Full', gerente: '❌', usuario: '❌' },
];

function AccessTab() {
  const { role, setRole } = useRoleStore();

  return (
    <div className="flex flex-col gap-6">
      {/* Current role switcher (dev tool) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Perfil ativo (simulação)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-muted-foreground">
            Alterne o perfil para testar as permissões de acesso em tempo real.
          </p>
          <div className="flex flex-wrap gap-2">
            {(['admin', 'gerente', 'usuario'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  toast.success(`Perfil alterado: ${ROLE_LABELS[r]}`);
                }}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  role === r
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:bg-muted'
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
        </CardContent>
      </Card>

      {/* Permission matrix */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Matriz de Permissões</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                    Módulo
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                    Admin / GP
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                    Gerente
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                    Usuário
                  </th>
                </tr>
              </thead>
              <tbody>
                {MODULE_MATRIX.map((row) => (
                  <tr key={row.module} className="border-b last:border-b-0">
                    <td className="px-4 py-2 font-medium">{row.module}</td>
                    <td className="px-4 py-2 text-center text-xs">{row.admin}</td>
                    <td className="px-4 py-2 text-center text-xs">{row.gerente}</td>
                    <td className="px-4 py-2 text-center text-xs">{row.usuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        title="Configurações"
        description="Perfis, integrações e parâmetros do sistema."
      />
      <main className="p-5">
        <Tabs defaultValue="access">
          <TabsList>
            <TabsTrigger value="access">Acesso</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>
          <TabsContent value="access" className="mt-4">
            <AccessTab />
          </TabsContent>
          <TabsContent value="integrations" className="mt-4">
            <IntegrationsTab />
          </TabsContent>
          <TabsContent value="system" className="mt-4">
            <SystemTab />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
