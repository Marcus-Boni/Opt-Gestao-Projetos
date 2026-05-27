# Settings Page Integration and Registrations Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully integrate the Settings Page, adding a "Cadastros" (Registrations) tab that includes modular sub-tabs to search, filter, create, edit, and toggle active status for Clientes, Projetos, and Recursos, backed by real PostgreSQL data via Fastify & Drizzle ORM.

**Architecture:** 
- **Backend**: Implement robust modular CRUD endpoints in Fastify (`apps/api/src/modules`) using Drizzle ORM to perform select, insert, and update operations directly on the PostgreSQL database.
- **Frontend**: Introduce a modular set of pages and dialog forms under `apps/web/src/features/settings` styled elegantly using Tailwind CSS 4 and shadcn/ui.
- **State Management**: Utilize TanStack Query for highly efficient server-state caching, invalidation, and seamless updates.

---

### Task 1: Backend - Clients API Module
Implement Fastify routes, a business service, and a database repository to support CRUD operations for Clients.

**Files:**
- Create: `apps/api/src/modules/clients/clients.repository.ts`
- Create: `apps/api/src/modules/clients/clients.service.ts`
- Create: `apps/api/src/modules/clients/clients.routes.ts`
- Modify: `apps/api/src/server.ts`

- [ ] **Step 1.1: Create Clients Repository**
  Write a database repository containing Drizzle queries to select, insert, and update rows in the `clients` table.
  ```typescript
  // apps/api/src/modules/clients/clients.repository.ts
  import { db, clients } from '@optsolv/db';
  import { eq, ilike, and } from 'drizzle-orm';

  export type ClientFilters = {
    search?: string;
    active?: boolean;
  };

  export class ClientsRepository {
    async findMany(filters: ClientFilters = {}) {
      const conditions = [];
      if (filters.search) {
        conditions.push(ilike(clients.name, `%${filters.search}%`));
      }
      if (filters.active !== undefined) {
        conditions.push(eq(clients.active, filters.active));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      return db.select().from(clients).where(whereClause).orderBy(clients.name);
    }

    async findById(id: string) {
      const [client] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
      return client ?? null;
    }

    async create(data: typeof clients.$inferInsert) {
      const [newClient] = await db.insert(clients).values(data).returning();
      return newClient;
    }

    async update(id: string, data: Partial<typeof clients.$inferInsert>) {
      const [updated] = await db
        .update(clients)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(clients.id, id))
        .returning();
      return updated;
    }
  }
  ```

- [ ] **Step 1.2: Create Clients Service**
  Create a service layer handling core logic for clients.
  ```typescript
  // apps/api/src/modules/clients/clients.service.ts
  import { ClientsRepository, type ClientFilters } from './clients.repository';
  import { clients } from '@optsolv/db';

  export class ClientsService {
    private readonly repository = new ClientsRepository();

    async listClients(filters: ClientFilters = {}) {
      return this.repository.findMany(filters);
    }

    async createClient(data: Omit<typeof clients.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
      return this.repository.create({
        ...data,
        active: data.active ?? true,
      });
    }

    async updateClient(id: string, data: Partial<typeof clients.$inferInsert>) {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error('Cliente não encontrado');
      }
      return this.repository.update(id, data);
    }
  }
  ```

- [ ] **Step 1.3: Create Clients Routes**
  Expose REST endpoints using Fastify and validate inputs with Zod.
  ```typescript
  // apps/api/src/modules/clients/clients.routes.ts
  import type { FastifyInstance } from 'fastify';
  import { requireSession } from '../../plugins/auth';
  import { ClientsService } from './clients.service';
  import { z } from 'zod';

  const createClientSchema = z.object({
    name: z.string().min(2),
    taxId: z.string().optional().nullable(),
    contactName: z.string().optional().nullable(),
    contactEmail: z.string().email().optional().nullable().or(z.literal('')),
    externalId: z.string().optional().nullable(),
    active: z.boolean().optional(),
  });

  const updateClientSchema = createClientSchema.partial();

  export async function clientsRoutes(app: FastifyInstance) {
    const service = new ClientsService();

    app.get(
      '/api/clients',
      { preHandler: requireSession },
      async (req, reply) => {
        const { search, active } = req.query as { search?: string; active?: string };
        const activeFilter = active === 'true' ? true : active === 'false' ? false : undefined;
        const result = await service.listClients({ search, active: activeFilter });
        return reply.send(result);
      }
    );

    app.post(
      '/api/clients',
      { preHandler: requireSession },
      async (req, reply) => {
        const body = createClientSchema.parse(req.body);
        const newClient = await service.createClient(body);
        return reply.status(201).send(newClient);
      }
    );

    app.put(
      '/api/clients/:id',
      { preHandler: requireSession },
      async (req, reply) => {
        const { id } = req.params as { id: string };
        const body = updateClientSchema.parse(req.body);
        const updated = await service.updateClient(id, body);
        return reply.send(updated);
      }
    );
  }
  ```

- [ ] **Step 1.4: Register Clients Routes in Server**
  Import and register `clientsRoutes` in Fastify server.
  ```typescript
  // apps/api/src/server.ts
  // Add import:
  import { clientsRoutes } from './modules/clients/clients.routes';

  // Inside buildServer(), after app.register(tasksRoutes):
  await app.register(clientsRoutes);
  ```

---

### Task 2: Backend - Users API Route
Expose a route `/api/users` to fetch all users from the database, which is required for populating the project managers dropdown selection list in the frontend.

**Files:**
- Create: `apps/api/src/modules/users/users.routes.ts`
- Modify: `apps/api/src/server.ts`

- [ ] **Step 2.1: Create Users Routes**
  Query all users in the system and expose a simple endpoint.
  ```typescript
  // apps/api/src/modules/users/users.routes.ts
  import type { FastifyInstance } from 'fastify';
  import { requireSession } from '../../plugins/auth';
  import { db, user } from '@optsolv/db';

  export async function usersRoutes(app: FastifyInstance) {
    app.get(
      '/api/users',
      { preHandler: requireSession },
      async (req, reply) => {
        const list = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
          })
          .from(user)
          .orderBy(user.name);
        return reply.send(list);
      }
    );
  }
  ```

- [ ] **Step 2.2: Register Users Routes in Server**
  Register `usersRoutes` in `apps/api/src/server.ts`.
  ```typescript
  // apps/api/src/server.ts
  // Add import:
  import { usersRoutes } from './modules/users/users.routes';

  // Inside buildServer(), after app.register(clientsRoutes):
  await app.register(usersRoutes);
  ```

---

### Task 3: Backend - Projects Admin CRUD Endpoints
Add support for querying, creating, and updating projects in the database.

**Files:**
- Modify: `apps/api/src/modules/projects/project.repository.ts`
- Modify: `apps/api/src/modules/projects/project.service.ts`
- Modify: `apps/api/src/modules/projects/project.routes.ts`

- [ ] **Step 3.1: Add Database CRUD Methods to Project Repository**
  Extend `ProjectRepository` with Drizzle DB select, insert, and update operations for Projects.
  ```typescript
  // apps/api/src/modules/projects/project.repository.ts
  // Add imports:
  import { db, projects, clients, user } from '@optsolv/db';
  import { eq, ilike, and } from 'drizzle-orm';

  // Add these methods inside the ProjectRepository class:
  async findManyDb(filters: { search?: string; clientId?: string; status?: string; active?: boolean } = {}) {
    const conditions = [];
    if (filters.search) {
      conditions.push(ilike(projects.name, `%${filters.search}%`));
    }
    if (filters.clientId) {
      conditions.push(eq(projects.clientId, filters.clientId));
    }
    if (filters.status) {
      conditions.push(eq(projects.status, filters.status as any));
    }
    if (filters.active !== undefined) {
      conditions.push(eq(projects.active, filters.active));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return db
      .select({
        project: projects,
        clientName: clients.name,
        managerName: user.name,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .leftJoin(user, eq(projects.managerId, user.id))
      .where(whereClause)
      .orderBy(projects.name);
  }

  async findByIdDb(id: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return project ?? null;
  }

  async createDb(data: typeof projects.$inferInsert) {
    const [newProject] = await db.insert(projects).values(data).returning();
    return newProject;
  }

  async updateDb(id: string, data: Partial<typeof projects.$inferInsert>) {
    const [updated] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }
  ```

- [ ] **Step 3.2: Extend Project Service**
  Expose the CRUD methods in `ProjectService`.
  ```typescript
  // apps/api/src/modules/projects/project.service.ts
  // Add methods inside ProjectService class:
  async listProjectsAdmin(filters: { search?: string; clientId?: string; status?: string; active?: boolean }) {
    return this.repository.findManyDb(filters);
  }

  async createProject(data: any) {
    return this.repository.createDb({
      ...data,
      active: true,
      status: data.status ?? 'no_prazo',
    });
  }

  async updateProject(id: string, data: any) {
    const existing = await this.repository.findByIdDb(id);
    if (!existing) {
      throw new Error('Projeto não encontrado');
    }
    return this.repository.updateDb(id, data);
  }
  ```

- [ ] **Step 3.3: Add Admin Routes to project.routes.ts**
  Register admin GET, POST, and PUT operations for projects in `project.routes.ts`.
  ```typescript
  // apps/api/src/modules/projects/project.routes.ts
  // Add imports if not present:
  import { z } from 'zod';
  import { ProjectService } from './project.service';

  // Inside projectRoutes(app: FastifyInstance):
  app.get(
    '/api/projects',
    { preHandler: requireSession },
    async (req, reply) => {
      const { search, clientId, status, active } = req.query as {
        search?: string;
        clientId?: string;
        status?: string;
        active?: string;
      };
      const activeFilter = active === 'true' ? true : active === 'false' ? false : undefined;
      const result = await controller.service.listProjectsAdmin({
        search,
        clientId,
        status,
        active: activeFilter,
      });
      return reply.send(result);
    }
  );

  const projectPayloadSchema = z.object({
    name: z.string().min(2),
    clientId: z.string().uuid(),
    code: z.string().optional().nullable(),
    type: z.enum(['desenvolvimento', 'sustentação', 'implantação', 'consultoria']).optional().nullable(),
    status: z.enum(['no_prazo', 'alerta', 'critico', 'concluido', 'cancelado']).optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    managerId: z.string().optional().nullable(),
    budget: z.coerce.number().optional().nullable(),
    contractPrice: z.coerce.number().optional().nullable(),
    active: z.boolean().optional(),
  });

  app.post(
    '/api/projects',
    { preHandler: requireSession },
    async (req, reply) => {
      const body = projectPayloadSchema.parse(req.body);
      const newProj = await controller.service.createProject({
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        budget: body.budget ? body.budget.toString() : null,
        contractPrice: body.contractPrice ? body.contractPrice.toString() : null,
      });
      return reply.status(201).send(newProj);
    }
  );

  app.put(
    '/api/projects/:id',
    { preHandler: requireSession },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const body = projectPayloadSchema.partial().parse(req.body);
      const updateData: any = { ...body };
      if (body.startDate) updateData.startDate = new Date(body.startDate);
      if (body.endDate) updateData.endDate = new Date(body.endDate);
      if (body.budget !== undefined) updateData.budget = body.budget ? body.budget.toString() : null;
      if (body.contractPrice !== undefined) updateData.contractPrice = body.contractPrice ? body.contractPrice.toString() : null;

      const updated = await controller.service.updateProject(id, updateData);
      return reply.send(updated);
    }
  );
  ```

---

### Task 4: Frontend - Clients API & TanStack Query Hooks
Write standard frontend API call functions and hook wrappers using React Query.

**Files:**
- Create: `apps/web/src/features/settings/api/clientsApi.ts`
- Create: `apps/web/src/features/settings/hooks/useClients.ts`

- [ ] **Step 4.1: Create Clients API**
  ```typescript
  // apps/web/src/features/settings/api/clientsApi.ts
  import { http } from '@/shared/lib/http';

  export type ClientDto = {
    id: string;
    name: string;
    taxId: string | null;
    contactName: string | null;
    contactEmail: string | null;
    externalId: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };

  export type ClientFilters = {
    search?: string;
    active?: boolean;
  };

  export async function fetchClients(filters?: ClientFilters): Promise<ClientDto[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.active !== undefined) params.append('active', String(filters.active));

    const response = await http.get<ClientDto[]>(`/api/clients?${params.toString()}`);
    return response.data;
  }

  export async function createClient(data: Omit<ClientDto, 'id' | 'createdAt' | 'updatedAt' | 'active'> & { active?: boolean }): Promise<ClientDto> {
    const response = await http.post<ClientDto>('/api/clients', data);
    return response.data;
  }

  export async function updateClient({ id, data }: { id: string; data: Partial<ClientDto> }): Promise<ClientDto> {
    const response = await http.put<ClientDto>(`/api/clients/${id}`, data);
    return response.data;
  }
  ```

- [ ] **Step 4.2: Create Clients Hooks**
  ```typescript
  // apps/web/src/features/settings/hooks/useClients.ts
  import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
  import { fetchClients, createClient, updateClient, type ClientFilters } from '../api/clientsApi';

  export function useClients(filters?: ClientFilters) {
    return useQuery({
      queryKey: ['clients', filters],
      queryFn: () => fetchClients(filters),
      staleTime: 2 * 60 * 1000,
    });
  }

  export function useCreateClient() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: createClient,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] });
      },
    });
  }

  export function useUpdateClient() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: updateClient,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] });
      },
    });
  }
  ```

---

### Task 5: Frontend - Projects Admin API & Hooks
Write the CRUD projects integrations and list managers routes.

**Files:**
- Create: `apps/web/src/features/settings/api/projectsAdminApi.ts`
- Create: `apps/web/src/features/settings/hooks/useProjectsAdmin.ts`

- [ ] **Step 5.1: Create Projects Admin API**
  ```typescript
  // apps/web/src/features/settings/api/projectsAdminApi.ts
  import { http } from '@/shared/lib/http';

  export type ProjectAdminDto = {
    project: {
      id: string;
      clientId: string;
      name: string;
      code: string | null;
      type: 'desenvolvimento' | 'sustentação' | 'implantação' | 'consultoria' | null;
      status: 'no_prazo' | 'alerta' | 'critico' | 'concluido' | 'cancelado';
      startDate: string | null;
      endDate: string | null;
      managerId: string | null;
      budget: string | null;
      contractPrice: string | null;
      active: boolean;
    };
    clientName: string | null;
    managerName: string | null;
  };

  export type ProjectFilters = {
    search?: string;
    clientId?: string;
    status?: string;
    active?: boolean;
  };

  export type UserDto = {
    id: string;
    name: string | null;
    email: string | null;
  };

  export async function fetchProjectsAdmin(filters?: ProjectFilters): Promise<ProjectAdminDto[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.active !== undefined) params.append('active', String(filters.active));

    const response = await http.get<ProjectAdminDto[]>(`/api/projects?${params.toString()}`);
    return response.data;
  }

  export async function createProjectAdmin(data: any): Promise<any> {
    const response = await http.post('/api/projects', data);
    return response.data;
  }

  export async function updateProjectAdmin({ id, data }: { id: string; data: any }): Promise<any> {
    const response = await http.put(`/api/projects/${id}`, data);
    return response.data;
  }

  export async function fetchUsers(): Promise<UserDto[]> {
    const response = await http.get<UserDto[]>('/api/users');
    return response.data;
  }
  ```

- [ ] **Step 5.2: Create Projects Admin Hooks**
  ```typescript
  // apps/web/src/features/settings/hooks/useProjectsAdmin.ts
  import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
  import {
    fetchProjectsAdmin,
    createProjectAdmin,
    updateProjectAdmin,
    fetchUsers,
    type ProjectFilters,
  } from '../api/projectsAdminApi';

  export function useProjectsAdmin(filters?: ProjectFilters) {
    return useQuery({
      queryKey: ['projectsAdmin', filters],
      queryFn: () => fetchProjectsAdmin(filters),
      staleTime: 2 * 60 * 1000,
    });
  }

  export function useCreateProjectAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: createProjectAdmin,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projectsAdmin'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });
  }

  export function useUpdateProjectAdmin() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: updateProjectAdmin,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projectsAdmin'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });
  }

  export function useUsers() {
    return useQuery({
      queryKey: ['users'],
      queryFn: fetchUsers,
      staleTime: 5 * 60 * 1000,
    });
  }
  ```

---

### Task 6: Frontend - Client Components
Build dialog form and list component for Clientes.

**Files:**
- Create: `apps/web/src/features/settings/components/ClientFormDialog.tsx`
- Create: `apps/web/src/features/settings/components/ClientsTab.tsx`

- [ ] **Step 6.1: Create ClientFormDialog**
  Create Zod validation and a dialog form with fields matching client fields.
  ```tsx
  // apps/web/src/features/settings/components/ClientFormDialog.tsx
  import { zodResolver } from '@hookform/resolvers/zod';
  import { useEffect } from 'react';
  import { useForm } from 'react-hook-form';
  import { toast } from 'sonner';
  import { z } from 'zod';
  import { Button } from '@/shared/components/ui/button';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/shared/components/ui/form';
  import { Input } from '@/shared/components/ui/input';
  import { Switch } from '@/shared/components/ui/switch';
  import { useCreateClient, useUpdateClient } from '../hooks/useClients';
  import type { ClientDto } from '../api/clientsApi';

  const formSchema = z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
    taxId: z.string().optional().or(z.literal('')),
    contactName: z.string().optional().or(z.literal('')),
    contactEmail: z.string().email('E-mail inválido').optional().or(z.literal('')),
    externalId: z.string().optional().or(z.literal('')),
    active: z.boolean(),
  });

  type FormValues = z.infer<typeof formSchema>;

  type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client?: ClientDto | null;
  };

  export function ClientFormDialog({ open, onOpenChange, client }: Props) {
    const createMutation = useCreateClient();
    const updateMutation = useUpdateClient();
    const isEditing = !!client;

    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: '',
        taxId: '',
        contactName: '',
        contactEmail: '',
        externalId: '',
        active: true,
      },
    });

    useEffect(() => {
      if (open) {
        if (client) {
          form.reset({
            name: client.name,
            taxId: client.taxId || '',
            contactName: client.contactName || '',
            contactEmail: client.contactEmail || '',
            externalId: client.externalId || '',
            active: client.active,
          });
        } else {
          form.reset({
            name: '',
            taxId: '',
            contactName: '',
            contactEmail: '',
            externalId: '',
            active: true,
          });
        }
      }
    }, [open, client, form]);

    const onSubmit = async (values: FormValues) => {
      try {
        const payload = {
          name: values.name,
          taxId: values.taxId || null,
          contactName: values.contactName || null,
          contactEmail: values.contactEmail || null,
          externalId: values.externalId || null,
          active: values.active,
        };

        if (isEditing && client) {
          await updateMutation.mutateAsync({
            id: client.id,
            data: payload,
          });
          toast.success('Cliente atualizado com sucesso');
        } else {
          await createMutation.mutateAsync(payload);
          toast.success('Cliente criado com sucesso');
        }
        onOpenChange(false);
      } catch (error) {
        toast.error('Erro ao salvar cliente');
        console.error(error);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="max-h-[60vh] overflow-y-auto px-1 py-1 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome / Razão Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ / CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato Principal</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="contato@cliente.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="externalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Externo (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Código ERP / CRM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Ativo</FormLabel>
                        <div className="text-xs text-muted-foreground">
                          Inativar o cliente ocultará de novas seleções.
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {isEditing ? 'Salvar Alterações' : 'Criar Cliente'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
  ```

- [ ] **Step 6.2: Create ClientsTab**
  Implement filters, data tables, active toggles, and edit integration.
  ```tsx
  // apps/web/src/features/settings/components/ClientsTab.tsx
  import { useState } from 'react';
  import { Button } from '@/shared/components/ui/button';
  import { Input } from '@/shared/components/ui/input';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
  import { Badge } from '@/shared/components/ui/badge';
  import { useClients, useUpdateClient } from '../hooks/useClients';
  import { ClientFormDialog } from './ClientFormDialog';
  import type { ClientDto } from '../api/clientsApi';
  import { toast } from 'sonner';

  export function ClientsTab() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);

    const activeParam = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;
    const { data: clientsList, isLoading } = useClients({ search, active: activeParam });
    const updateMutation = useUpdateClient();

    const handleEdit = (client: ClientDto) => {
      setSelectedClient(client);
      setDialogOpen(true);
    };

    const handleNew = () => {
      setSelectedClient(null);
      setDialogOpen(true);
    };

    const toggleStatus = async (client: ClientDto) => {
      try {
        await updateMutation.mutateAsync({
          id: client.id,
          data: { active: !client.active },
        });
        toast.success(`Cliente ${!client.active ? 'ativado' : 'inativado'} com sucesso`);
      } catch (error) {
        toast.error('Erro ao alterar status do cliente');
      }
    };

    return (
      <div className="flex flex-col gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Input
              placeholder="Buscar cliente por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleNew}>
            Novo Cliente
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ / CPF</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando clientes...
                  </TableCell>
                </TableRow>
              ) : !clientsList || clientsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                clientsList.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.taxId || '-'}</TableCell>
                    <TableCell>{client.contactName || '-'}</TableCell>
                    <TableCell>{client.contactEmail || '-'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={client.active ? 'success' : 'destructive'}>
                        {client.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleStatus(client)}
                      >
                        {client.active ? 'Inativar' : 'Ativar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ClientFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          client={selectedClient}
        />
      </div>
    );
  }
  ```

---

### Task 7: Frontend - Project Components
Build dialog form and list component for Projetos.

**Files:**
- Create: `apps/web/src/features/settings/components/ProjectFormDialog.tsx`
- Create: `apps/web/src/features/settings/components/ProjectsTab.tsx`

- [ ] **Step 7.1: Create ProjectFormDialog**
  Implement form fields, calendar dates, Zod schemas, and active clients dropdown selection list.
  ```tsx
  // apps/web/src/features/settings/components/ProjectFormDialog.tsx
  import { zodResolver } from '@hookform/resolvers/zod';
  import { useEffect } from 'react';
  import { useForm } from 'react-hook-form';
  import { toast } from 'sonner';
  import { z } from 'zod';
  import { Button } from '@/shared/components/ui/button';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/shared/components/ui/form';
  import { Input } from '@/shared/components/ui/input';
  import { Switch } from '@/shared/components/ui/switch';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
  import { useCreateProjectAdmin, useUpdateProjectAdmin, useUsers } from '../hooks/useProjectsAdmin';
  import { useClients } from '../hooks/useClients';
  import type { ProjectAdminDto } from '../api/projectsAdminApi';

  const formSchema = z.object({
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
    clientId: z.string().uuid('Selecione um cliente'),
    code: z.string().optional().or(z.literal('')),
    type: z.enum(['desenvolvimento', 'sustentação', 'implantação', 'consultoria']),
    status: z.enum(['no_prazo', 'alerta', 'critico', 'concluido', 'cancelado']),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
    managerId: z.string().optional().or(z.literal('')),
    budget: z.coerce.number().optional(),
    contractPrice: z.coerce.number().optional(),
    active: z.boolean(),
  });

  type FormValues = z.infer<typeof formSchema>;

  type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectData?: ProjectAdminDto | null;
  };

  export function ProjectFormDialog({ open, onOpenChange, projectData }: Props) {
    const createMutation = useCreateProjectAdmin();
    const updateMutation = useUpdateProjectAdmin();
    const { data: clientsList } = useClients({ active: true });
    const { data: usersList } = useUsers();
    
    const isEditing = !!projectData;

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

    useEffect(() => {
      if (open) {
        if (projectData && projectData.project) {
          const proj = projectData.project;
          form.reset({
            name: proj.name,
            clientId: proj.clientId,
            code: proj.code || '',
            type: (proj.type as any) || 'desenvolvimento',
            status: proj.status || 'no_prazo',
            startDate: proj.startDate ? new Date(proj.startDate).toISOString().split('T')[0] : '',
            endDate: proj.endDate ? new Date(proj.endDate).toISOString().split('T')[0] : '',
            managerId: proj.managerId || '',
            budget: proj.budget ? Number(proj.budget) : 0,
            contractPrice: proj.contractPrice ? Number(proj.contractPrice) : 0,
            active: proj.active,
          });
        } else {
          form.reset({
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
          });
        }
      }
    }, [open, projectData, form]);

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

        if (isEditing && projectData) {
          await updateMutation.mutateAsync({
            id: projectData.project.id,
            data: payload,
          });
          toast.success('Projeto atualizado com sucesso');
        } else {
          await createMutation.mutateAsync(payload);
          toast.success('Projeto criado com sucesso');
        }
        onOpenChange(false);
      } catch (error) {
        toast.error('Erro ao salvar projeto');
        console.error(error);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="max-h-[60vh] overflow-y-auto px-1 py-1 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Projeto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Refatoração do Portal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: PRJ-001" {...field} />
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
                        <FormLabel>Tipo</FormLabel>
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
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientsList?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Status do projeto" />
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
                  <FormField
                    control={form.control}
                    name="managerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gerente / GP</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Responsável" />
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        <FormLabel>Data de Fim</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Orçamento (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
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
                        <FormLabel>Valor do Contrato (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Ativo</FormLabel>
                        <div className="text-xs text-muted-foreground">
                          Projetos inativos não serão alocados.
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {isEditing ? 'Salvar Alterações' : 'Criar Projeto'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
  ```

- [ ] **Step 7.2: Create ProjectsTab**
  Implement filters (search, client selector, status selector, active selector) and interactive lists.
  ```tsx
  // apps/web/src/features/settings/components/ProjectsTab.tsx
  import { useState } from 'react';
  import { Button } from '@/shared/components/ui/button';
  import { Input } from '@/shared/components/ui/input';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
  import { Badge } from '@/shared/components/ui/badge';
  import { useProjectsAdmin, useUpdateProjectAdmin } from '../hooks/useProjectsAdmin';
  import { useClients } from '../hooks/useClients';
  import { ProjectFormDialog } from './ProjectFormDialog';
  import type { ProjectAdminDto } from '../api/projectsAdminApi';
  import { toast } from 'sonner';

  const PROJECT_STATUS_LABELS: Record<string, string> = {
    no_prazo: 'No Prazo',
    alerta: 'Alerta',
    critico: 'Crítico',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };

  const PROJECT_STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'> = {
    no_prazo: 'success',
    alerta: 'warning',
    critico: 'destructive',
    concluido: 'outline',
    cancelado: 'secondary',
  };

  export function ProjectsTab() {
    const [search, setSearch] = useState('');
    const [clientFilter, setClientFilter] = useState('todos');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [activeFilter, setActiveFilter] = useState('todos');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectAdminDto | null>(null);

    const activeParam = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
    const clientParam = clientFilter !== 'todos' ? clientFilter : undefined;
    const statusParam = statusFilter !== 'todos' ? statusFilter : undefined;

    const { data: projectsList, isLoading } = useProjectsAdmin({
      search,
      clientId: clientParam,
      status: statusParam,
      active: activeParam,
    });

    const { data: clientsList } = useClients();
    const updateMutation = useUpdateProjectAdmin();

    const handleEdit = (project: ProjectAdminDto) => {
      setSelectedProject(project);
      setDialogOpen(true);
    };

    const handleNew = () => {
      setSelectedProject(null);
      setDialogOpen(true);
    };

    const toggleStatus = async (item: ProjectAdminDto) => {
      try {
        await updateMutation.mutateAsync({
          id: item.project.id,
          data: { active: !item.project.active },
        });
        toast.success(`Projeto ${!item.project.active ? 'ativado' : 'inativado'} com sucesso`);
      } catch (error) {
        toast.error('Erro ao alterar status do projeto');
      }
    };

    return (
      <div className="flex flex-col gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <Input
              placeholder="Buscar por código ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Clientes</SelectItem>
                {clientsList?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status do Projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="no_prazo">No Prazo</SelectItem>
                <SelectItem value="alerta">Alerta</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ativo / Inativo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleNew}>
            Novo Projeto
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Gerente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Carregando projetos...
                  </TableCell>
                </TableRow>
              ) : !projectsList || projectsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum projeto cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                projectsList.map((item) => (
                  <TableRow key={item.project.id}>
                    <TableCell className="font-semibold">{item.project.code || '-'}</TableCell>
                    <TableCell className="font-medium">{item.project.name}</TableCell>
                    <TableCell>{item.clientName || '-'}</TableCell>
                    <TableCell>{item.managerName || '-'}</TableCell>
                    <TableCell className="capitalize">{item.project.type || '-'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={PROJECT_STATUS_VARIANTS[item.project.status] || 'secondary'}>
                        {PROJECT_STATUS_LABELS[item.project.status] || item.project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={item.project.active ? 'success' : 'destructive'}>
                        {item.project.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleStatus(item)}
                      >
                        {item.project.active ? 'Inativar' : 'Ativar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ProjectFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          projectData={selectedProject}
        />
      </div>
    );
  }
  ```

---

### Task 8: Frontend - Resources List Wrapper
Build the resources list table that integrates seamlessly with the existing `ResourceFormDialog` and filters cargo dynamically.

**Files:**
- Create: `apps/web/src/features/settings/components/ResourcesTab.tsx`

- [ ] **Step 8.1: Create ResourcesTab**
  Expose filters for search, Cargo (Select dropdown listing available jobs), and Active status. Reuse existing dialog.
  ```tsx
  // apps/web/src/features/settings/components/ResourcesTab.tsx
  import { useState } from 'react';
  import { Button } from '@/shared/components/ui/button';
  import { Input } from '@/shared/components/ui/input';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
  import { Badge } from '@/shared/components/ui/badge';
  import { useResources, useUpdateResource } from '@/features/resources/hooks/useResources';
  import { ResourceFormDialog } from '@/features/resources/components/ResourceFormDialog';
  import type { ResourceDto } from '@/features/resources/api/resourcesApi';
  import { toast } from 'sonner';

  export function ResourcesTab() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('todos');
    const [activeFilter, setActiveFilter] = useState('todos');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState<ResourceDto | null>(null);

    const activeParam = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
    const roleParam = roleFilter !== 'todos' ? roleFilter : undefined;

    const { data, isLoading } = useResources({
      search,
      role: roleParam,
      active: activeParam,
    });

    const updateMutation = useUpdateResource();

    const handleEdit = (resource: ResourceDto) => {
      setSelectedResource(resource);
      setDialogOpen(true);
    };

    const handleNew = () => {
      setSelectedResource(null);
      setDialogOpen(true);
    };

    const toggleStatus = async (resource: ResourceDto) => {
      try {
        await updateMutation.mutateAsync({
          id: resource.id,
          data: { active: !resource.active },
        });
        toast.success(`Recurso ${!resource.active ? 'ativado' : 'inativado'} com sucesso`);
      } catch (error) {
        toast.error('Erro ao alterar status do recurso');
      }
    };

    // Extract unique roles for filters
    const uniqueRoles = data?.resources
      ? Array.from(new Set(data.resources.map((r) => r.role).filter(Boolean)))
      : [];

    return (
      <div className="flex flex-col gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <Input
              placeholder="Buscar recurso por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Cargos</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ativos / Inativos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleNew}>
            Novo Recurso
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Custo/Hora</TableHead>
                <TableHead className="text-center">Alocação</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando recursos...
                  </TableCell>
                </TableRow>
              ) : !data?.resources || data.resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum recurso cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    <TableCell>{resource.role}</TableCell>
                    <TableCell>{resource.email || '-'}</TableCell>
                    <TableCell>
                      {resource.costPerHour
                        ? `R$ ${Number(resource.costPerHour).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono">{resource.utilizationPercent}%</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={resource.active ? 'success' : 'destructive'}>
                        {resource.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(resource)}>
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleStatus(resource)}
                      >
                        {resource.active ? 'Inativar' : 'Ativar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ResourceFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          resource={selectedResource}
        />
      </div>
    );
  }
  ```

---

### Task 9: Frontend - Master Registrations Tab & Page Setup
Expose the main "Cadastros" wrapper tab and hook it into the Settings page.

**Files:**
- Create: `apps/web/src/features/settings/components/CadastrosTab.tsx`
- Modify: `apps/web/src/pages/settings/SettingsPage.tsx`

- [ ] **Step 9.1: Create CadastrosTab Orchestrator**
  ```tsx
  // apps/web/src/features/settings/components/CadastrosTab.tsx
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
  import { ClientsTab } from './ClientsTab';
  import { ProjectsTab } from './ProjectsTab';
  import { ResourcesTab } from './ResourcesTab';

  export function CadastrosTab() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cadastros do Sistema</CardTitle>
          <CardDescription>
            Gerencie de forma centralizada os clientes, projetos e recursos do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="clientes" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
              <TabsTrigger value="projetos">Projetos</TabsTrigger>
              <TabsTrigger value="recursos">Recursos</TabsTrigger>
            </TabsList>

            <TabsContent value="clientes" className="outline-none">
              <ClientsTab />
            </TabsContent>

            <TabsContent value="projetos" className="outline-none">
              <ProjectsTab />
            </TabsContent>

            <TabsContent value="recursos" className="outline-none">
              <ResourcesTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }
  ```

- [ ] **Step 9.2: Integrate CadastrosTab in SettingsPage.tsx**
  Edit `SettingsPage.tsx` to include the tab trigger, tabs list, and tabs content.
  ```diff
  // apps/web/src/pages/settings/SettingsPage.tsx
  + import { CadastrosTab } from '@/features/settings/components/CadastrosTab';
  
  export function SettingsPage() {
    return (
      <>
        <PageHeader
          eyebrow="Configurações"
          title="Configurações do Sistema"
          description="Perfis, integrações e parâmetros do sistema."
        />
        <main className="p-5">
  -       <Tabs defaultValue="access">
  -         <TabsList>
  +       <Tabs defaultValue="access" className="w-full">
  +         <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value="access">Acesso</TabsTrigger>
              <TabsTrigger value="integrations">Integrações</TabsTrigger>
  +           <TabsTrigger value="registrations">Cadastros</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
            </TabsList>
            <TabsContent value="access" className="mt-4">
              <AccessTab />
            </TabsContent>
            <TabsContent value="integrations" className="mt-4">
              <IntegrationsTab />
            </TabsContent>
  +         <TabsContent value="registrations" className="mt-4">
  +           <CadastrosTab />
  +         </TabsContent>
            <TabsContent value="system" className="mt-4">
              <SystemTab />
            </TabsContent>
          </Tabs>
        </main>
      </>
    );
  }
  ```

---

### Task 10: Validation and Verification
Perform tests and run validators to verify correctness.

- [ ] **Step 10.1: Run TypeScript typecheck**
  Run: `pnpm typecheck`
  Expected: Success without errors.

- [ ] **Step 10.2: Run Biome Linting**
  Run: `pnpm lint`
  Expected: Success without style/code smell warnings.
