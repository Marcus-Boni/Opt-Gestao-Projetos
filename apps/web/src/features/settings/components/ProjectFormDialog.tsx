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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import type { ProjectAdminDto } from '../api/projectsAdminApi';
import { useClients } from '../hooks/useClients';
import { useCreateProjectAdmin, useUpdateProjectAdmin, useUsers } from '../hooks/useProjectsAdmin';

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

  const form = useForm({
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
      if (projectData?.project) {
        const proj = projectData.project;
        form.reset({
          name: proj.name,
          clientId: proj.clientId,
          code: proj.code || '',
          type:
            (proj.type as 'desenvolvimento' | 'sustentação' | 'implantação' | 'consultoria') ||
            'desenvolvimento',
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
                      <Select onValueChange={field.onChange} value={field.value || ''}>
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
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          value={(field.value as number) || 0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                      <FormLabel>Valor do Contrato (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          value={(field.value as number) || 0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
