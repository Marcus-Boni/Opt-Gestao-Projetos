# Dedicated Project Creation and Editing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build dedicated pages for creating and editing projects inside the Project Center, using a premium responsive two-column layout, real-time margin live-preview calculations, and seamless TanStack Router navigation.

**Architecture:** Create a unified page `ProjectCreateEditPage.tsx` that determines whether it is in "create" or "edit" mode by reading route parameters, fetches client and manager lists dynamically, calculates expected project margins on change, and performs mutations updating the PostgreSQL database via Drizzle API endpoints.

**Tech Stack:** React 18, TanStack Router, TanStack Query, React Hook Form, Zod, Tailwind CSS 4, Lucide React, Shadcn UI (`Card`, `Input`, `Select`, `Switch`, `Button`).

---

### Task 1: Create the Dedicated Page `ProjectCreateEditPage.tsx`

**Files:**
- Create: [ProjectCreateEditPage.tsx](file:///c:/Users/mgalv/Projetos-Programacao/Projetos-Optsolv/Opt-PMS/apps/web/src/pages/projects/ProjectCreateEditPage.tsx)

- [ ] **Step 1: Write the unified form and two-column page layout with live preview**
  Implement the React Hook Form, Zod validation resolver, live dynamic margin calculations, responsive layout grid, styling, and action triggers.

  Code:
  ```tsx
  import { zodResolver } from '@hookform/resolvers/zod';
  import { Link, useNavigate, useParams } from '@tanstack/react-router';
  import { ArrowLeft, Building, Calculator, Calendar, DollarSign, Loader2, User } from 'lucide-react';
  import { useEffect } from 'react';
  import { useForm } from 'react-hook-form';
  import { toast } from 'sonner';
  import { z } from 'zod';
  import { useClients } from '@/features/settings/hooks/useClients';
  import { useCreateProjectAdmin, useUpdateProjectAdmin, useUsers, useProjectsAdmin } from '@/features/settings/hooks/useProjectsAdmin';
  import { PageHeader } from '@/shared/components/PageHeader';
  import { ErrorState, LoadingState } from '@/shared/components/StateViews';
  import { Badge } from '@/shared/components/ui/badge';
  import { Button } from '@/shared/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/shared/components/ui/form';
  import { Input } from '@/shared/components/ui/input';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/shared/components/ui/select';
  import { Switch } from '@/shared/components/ui/switch';
  import { cn } from '@/shared/lib/utils';

  const formSchema = z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
    clientId: z.string().uuid('Selecione um cliente'),
    code: z.string().optional().or(z.literal('')),
    type: z.enum(['desenvolvimento', 'sustentação', 'implantação', 'consultoria']),
    status: z.enum(['no_prazo', 'alerta', 'critico', 'concluido', 'cancelado']),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
    managerId: z.string().optional().or(z.literal('')),
    budget: z.coerce.number().min(0, 'O orçamento não pode ser negativo').optional(),
    contractPrice: z.coerce.number().min(0, 'O preço do contrato não pode ser negativo').optional(),
    active: z.boolean(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const PROJECT_STATUS_LABELS: Record<string, string> = {
    no_prazo: 'No Prazo',
    alerta: 'Alerta',
    critico: 'Crítico',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'no_prazo':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'alerta':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-400 dark:border-amber-500/30';
      case 'critico':
        return 'bg-destructive/10 text-destructive border-destructive/25';
      case 'concluido':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-400 dark:border-blue-500/30';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-500/25 dark:text-slate-400 dark:border-slate-500/30';
    }
  };

  const BRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  export function ProjectCreateEditPage() {
    const { projectId } = useParams({ strict: false }) as { projectId?: string };
    const isEditing = !!projectId;
    const navigate = useNavigate();

    const createMutation = useCreateProjectAdmin();
    const updateMutation = useUpdateProjectAdmin();
    const { data: clientsList } = useClients({ active: true });
    const { data: usersList } = useUsers();
    
    // Fetch project details through admin projects hook to prefill editing state
    const { data: projectsList, isLoading: isProjectsLoading, isError: isProjectsError, refetch } = useProjectsAdmin();

    const currentProject = isEditing ? projectsList?.find((p) => p.project.id === projectId) : null;

    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: '',
        clientId: '',
        code: '',
        type: 'desenvolvimento',
        status: 'no_prazo',
        startDate: '',
        endDate: '',
        managerId: '',
        budget: 0,
        contractPrice: 0,
        active: true,
      },
    });

    // Populate data in editing mode
    useEffect(() => {
      if (isEditing && currentProject?.project) {
        const proj = currentProject.project;
        form.reset({
          name: proj.name,
          clientId: proj.clientId,
          code: proj.code || '',
          type: (proj.type as 'desenvolvimento' | 'sustentação' | 'implantação' | 'consultoria') || 'desenvolvimento',
          status: proj.status || 'no_prazo',
          startDate: proj.startDate ? new Date(proj.startDate).toISOString().split('T')[0] : '',
          endDate: proj.endDate ? new Date(proj.endDate).toISOString().split('T')[0] : '',
          managerId: proj.managerId || '',
          budget: proj.budget ? Number(proj.budget) : 0,
          contractPrice: proj.contractPrice ? Number(proj.contractPrice) : 0,
          active: proj.active,
        });
      }
    }, [isEditing, currentProject, form]);

    const onSubmit = async (values: FormValues) => {
      try {
        const payload = {
          name: values.name,
          clientId: values.clientId,
          code: values.code || null,
          type: values.type,
          status: values.status,
          startDate: values.startDate || null,
          endDate: values.endDate || null,
          managerId: values.managerId || null,
          budget: values.budget || 0,
          contractPrice: values.contractPrice || 0,
          active: values.active,
        };

        if (isEditing && projectId) {
          await updateMutation.mutateAsync({
            id: projectId,
            data: payload,
          });
          toast.success('Projeto atualizado com sucesso');
          navigate({ to: `/app/projetos/${projectId}` });
        } else {
          const created = await createMutation.mutateAsync(payload);
          toast.success('Projeto criado com sucesso');
          navigate({ to: '/app/projetos' });
        }
      } catch (error) {
        toast.error('Erro ao salvar projeto');
        console.error(error);
      }
    };

    // Watchers for dynamic preview calculation
    const watchName = form.watch('name');
    const watchCode = form.watch('code');
    const watchClientId = form.watch('clientId');
    const watchManagerId = form.watch('managerId');
    const watchStatus = form.watch('status');
    const watchBudget = form.watch('budget') || 0;
    const watchContractPrice = form.watch('contractPrice') || 0;

    const selectedClientName = clientsList?.find((c) => c.id === watchClientId)?.name || 'Nenhum selecionado';
    const selectedManagerName = usersList?.find((u) => u.id === watchManagerId)?.name || 'Nenhum selecionado';

    // Margin calculations
    const budgetVal = Number(watchBudget);
    const priceVal = Number(watchContractPrice);
    const marginBRL = priceVal - budgetVal;
    const marginPct = priceVal > 0 ? (marginBRL / priceVal) * 100 : 0;

    // Loading State
    if (isEditing && isProjectsLoading) {
      return (
        <div className="p-8">
          <LoadingState />
        </div>
      );
    }

    // Error State
    if (isEditing && (isProjectsError || !currentProject)) {
      return (
        <div className="p-8">
          <ErrorState
            title="Projeto não encontrado"
            description="Não foi possível carregar os dados do projeto a ser editado."
            onRetry={() => refetch()}
          />
        </div>
      );
    }

    return (
      <div className="pb-24">
        <PageHeader
          eyebrow="Central de Projetos"
          title={isEditing ? 'Editar Projeto' : 'Novo Projeto'}
          description={isEditing ? 'Altere as informações essenciais e gerencie seu budget.' : 'Cadastre um novo projeto com as melhores práticas de planejamento.'}
          backButton={
            <Link
              to={isEditing ? `/app/projetos/${projectId}` : '/app/projetos'}
              className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
            </Link>
          }
        />

        <main className="p-5 max-w-7xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Forms */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Section 1: Identification */}
                <Card className="border bg-card/60 backdrop-blur-sm shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building className="size-4 text-primary" /> Identificação e Cliente
                    </CardTitle>
                    <CardDescription>Insira o nome, identificadores e associe o projeto a um cliente cadastrado.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Projeto</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Refatoração do Portal do Cliente" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código do Projeto</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: PRJ-010" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Projeto</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                                <SelectItem value="sustentação">Sustentação</SelectItem>
                                <SelectItem value="implantação">Implantação</SelectItem>
                                <SelectItem value="consultoria">Consultoria</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente Associado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha um cliente..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clientsList?.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Section 2: Planning & Manager */}
                <Card className="border bg-card/60 backdrop-blur-sm shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="size-4 text-primary" /> Liderança e Cronograma
                    </CardTitle>
                    <CardDescription>Defina o gerente principal do projeto, status inicial e as datas de vigência.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="managerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gerente / Responsável</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Responsável pelo projeto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {usersList?.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name || user.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status de Saúde</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Status de saúde" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="no_prazo">No Prazo</SelectItem>
                                <SelectItem value="alerta">Alerta</SelectItem>
                                <SelectItem value="critico">Crítico</SelectItem>
                                <SelectItem value="concluido">Concluído</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Início</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Término</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3: Financial */}
                <Card className="border bg-card/60 backdrop-blur-sm shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="size-4 text-primary" /> Dados Financeiros e Ativação
                    </CardTitle>
                    <CardDescription>Configure o orçamento de custos limite e o preço de venda para cálculo de margem.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Orçamento Limite de Custo (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contractPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Bruto do Contrato (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-background/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-semibold">Projeto Ativo</FormLabel>
                            <CardDescription className="text-xs">
                              Projetos inativos não ficam elegíveis para novas alocações de recursos.
                            </CardDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Dynamic Live Preview Card */}
              <div className="space-y-6">
                <Card className="border bg-card/45 backdrop-blur-md shadow-lg sticky top-6 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary/80 to-purple-600/80" />
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pré-visualização Dinâmica</CardTitle>
                    <div className="mt-3 space-y-2">
                      <h2 className="text-xl font-bold tracking-tight text-foreground line-clamp-2">
                        {watchName || 'Novo Projeto'}
                      </h2>
                      {watchCode && (
                        <span className="inline-block text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded border">
                          {watchCode}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 border-t pt-5">
                    {/* Status badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Status Atual:</span>
                      <Badge variant="outline" className={cn('px-2.5 py-0.5 font-semibold text-xs', getStatusStyles(watchStatus))}>
                        {PROJECT_STATUS_LABELS[watchStatus] || watchStatus}
                      </Badge>
                    </div>

                    {/* Metadata Items */}
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3">
                        <Building className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium leading-none">Cliente</p>
                          <p className="text-sm font-medium text-foreground mt-1">{selectedClientName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium leading-none">Gerente Responsável</p>
                          <p className="text-sm font-medium text-foreground mt-1">{selectedManagerName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Financial Margin section */}
                    <div className="border-t pt-5 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Calculator className="size-3.5" /> Financeiro Estimado
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Lucro Bruto</p>
                          <p className={cn('text-base font-bold mt-1', marginBRL >= 0 ? 'text-emerald-500' : 'text-destructive')}>
                            {BRL.format(marginBRL)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Margem do Projeto</p>
                          <p className={cn('text-base font-bold mt-1', marginPct >= 20 ? 'text-emerald-500' : marginPct >= 0 ? 'text-amber-500' : 'text-destructive')}>
                            {marginPct.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Dynamic margin bar */}
                      <div className="space-y-1">
                        <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'absolute inset-y-0 left-0 rounded-full transition-all duration-300',
                              marginPct >= 20 ? 'bg-emerald-500' : marginPct >= 0 ? 'bg-amber-500' : 'bg-destructive'
                            )}
                            style={{ width: `${Math.max(0, Math.min(100, marginPct))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                          <span>0%</span>
                          <span>Alvo: 20%+</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fixed Sticky Footer Actions */}
              <div className="fixed bottom-0 inset-x-0 z-40 bg-background/85 backdrop-blur-md border-t px-6 py-4 flex items-center justify-end gap-3 max-w-7xl mx-auto w-full md:rounded-t-lg shadow-lg">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Link to={isEditing ? `/app/projetos/${projectId}` : '/app/projetos'}>
                    Cancelar
                  </Link>
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="min-w-[120px]">
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Gravando...
                    </>
                  ) : isEditing ? (
                    'Salvar Alterações'
                  ) : (
                    'Criar Projeto'
                  )}
                </Button>
              </div>

            </form>
          </Form>
        </main>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit creation page**
  ```bash
  git add apps/web/src/pages/projects/ProjectCreateEditPage.tsx
  git commit -m "feat(projects): cria nova tela dedicada de criação e edição com layout duas colunas e preview de margem"
  ```

---

### Task 2: Configure Page Routes in the Router

**Files:**
- Modify: [router.tsx](file:///c:/Users/mgalv/Projetos-Programacao/Projetos-Optsolv/Opt-PMS/apps/web/src/app/router.tsx)

- [ ] **Step 1: Write changes to load `ProjectCreateEditPage` and append routes**
  Lazy import `ProjectCreateEditPage`, define `projectCreateRoute` and `projectEditRoute` pointing to `/projetos/novo` and `/projetos/$projectId/editar` respectively, and add them under `appRoute`.

  Target change in `router.tsx`:
  Around line 67, insert the lazy loading block:
  ```typescript
  const ProjectCreateEditPage = lazy(() =>
    import('@/pages/projects/ProjectCreateEditPage').then((m) => ({ default: m.ProjectCreateEditPage })),
  );
  ```

  Around line 135, insert the route declarations:
  ```typescript
  const projectCreateRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/projetos/novo',
    component: withSuspense(ProjectCreateEditPage),
  });

  const projectEditRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/projetos/$projectId/editar',
    component: withSuspense(ProjectCreateEditPage),
  });
  ```

  Around line 168 (where child routes are declared), register the new routes:
  ```typescript
      projectsRoute,
      projectCreateRoute,
      projectEditRoute,
      projectDetailRoute,
  ```

- [ ] **Step 2: Commit routing configuration**
  ```bash
  git add apps/web/src/app/router.tsx
  git commit -m "feat(projects): registra novas rotas de criação e edição de projetos no tanstack router"
  ```

---

### Task 3: Integrate Entry Points (Creation Button in Projects List)

**Files:**
- Modify: [ProjectsPage.tsx](file:///c:/Users/mgalv/Projetos-Programacao/Projetos-Optsolv/Opt-PMS/apps/web/src/pages/projects/ProjectsPage.tsx)

- [ ] **Step 1: Add Link import and the "Novo Projeto" action button in ProjectsPage**
  Modify the `PageHeader` inside `ProjectsPage.tsx` to include an action button linking to `/app/projetos/novo`.

  Target change in `ProjectsPage.tsx`:
  Add Link import to TanStack Router:
  ```typescript
  import { Link } from '@tanstack/react-router';
  ```

  Replace the `PageHeader` component (around line 72-76):
  ```tsx
        <PageHeader
          eyebrow="Project Center"
          title="Projetos"
          description="Portfólio agrupado por gerente responsável."
          actions={
            <Button asChild>
              <Link to="/app/projetos/novo">Novo Projeto</Link>
            </Button>
          }
        />
  ```

  Ensure you import `Button` from `@/shared/components/ui/button`.

- [ ] **Step 2: Commit Projects list integration**
  ```bash
  git add apps/web/src/pages/projects/ProjectsPage.tsx
  git commit -m "feat(projects): adiciona botão Novo Projeto no cabeçalho do Project Center"
  ```

---

### Task 4: Integrate Entry Points (Edition Button in Project Detail)

**Files:**
- Modify: [ProjectDetailPage.tsx](file:///c:/Users/mgalv/Projetos-Programacao/Projetos-Optsolv/Opt-PMS/apps/web/src/pages/project-detail/ProjectDetailPage.tsx)

- [ ] **Step 1: Add "Editar" button inside ProjectDetailPage**
  Update the actions slot in `PageHeader` on `ProjectDetailPage.tsx` to show both the status badge and an "Editar" button linking to `/app/projetos/$projectId/editar`.

  Target change in `ProjectDetailPage.tsx`:
  Replace the `actions` prop in `PageHeader` (around line 63):
  ```tsx
          actions={
            <div className="flex items-center gap-2">
              <ProjectStatusBadge status={detail.status} size="md" />
              <Button variant="outline" asChild>
                <Link to="/app/projetos/$projectId/editar" params={{ projectId: detail.id }}>
                  Editar
                </Link>
              </Button>
            </div>
          }
  ```

  Make sure to import `Button` from `@/shared/components/ui/button`.

- [ ] **Step 2: Commit Project details integration**
  ```bash
  git add apps/web/src/pages/project-detail/ProjectDetailPage.tsx
  git commit -m "feat(projects): adiciona botão de Editar nas ações do cabeçalho de detalhe do projeto"
  ```

---

### Task 5: Verification & Quality Assurance

- [ ] **Step 1: Run typechecks and lint checking**
  Verify the entire workspace compilation succeeds without any TS or linter issues.
  Run command in workspace root:
  `pnpm typecheck`
  `pnpm lint`

- [ ] **Step 2: Verify in Browser & DB Persistence**
  Run visual validation. Verify navigation, dynamic BRL calculations, colors, and correct save flows to client/manager.
