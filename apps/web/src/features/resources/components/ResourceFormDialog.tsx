import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '@/shared/components/ui/badge';
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
import type { CreateResourceDto, ResourceDto, UpdateResourceDto } from '../api/resourcesApi';
import { useCreateResource, useUpdateResource } from '../hooks/useResources';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  role: z.string().min(2, 'O cargo deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  skills: z.array(z.string()).default([]),
  costPerHour: z.coerce.number().optional(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: ResourceDto | null;
  defaultProjectId?: string;
};

export function ResourceFormDialog({ open, onOpenChange, resource, defaultProjectId }: Props) {
  const createMutation = useCreateResource();
  const updateMutation = useUpdateResource();

  const isEditing = !!resource;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      role: '',
      email: '',
      skills: [],
      costPerHour: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (resource) {
        form.reset({
          name: resource.name,
          role: resource.role,
          email: resource.email || '',
          skills: resource.skills || [],
          costPerHour: resource.costPerHour || 0,
          active: resource.active,
        });
      } else {
        form.reset({
          name: '',
          role: '',
          email: '',
          skills: [],
          costPerHour: 0,
          active: true,
        });
      }
    }
  }, [open, resource, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const skillsArray = values.skills.map((s) => s.trim()).filter(Boolean);

      const payload: Omit<CreateResourceDto, 'email' | 'costPerHour'> & {
        email?: string;
        costPerHour?: number;
      } = {
        name: values.name,
        role: values.role,
        skills: skillsArray,
      };

      if (values.email) payload.email = values.email;
      if (values.costPerHour) payload.costPerHour = values.costPerHour;

      if (isEditing && resource) {
        const updatePayload: UpdateResourceDto = { ...payload, active: values.active };
        await updateMutation.mutateAsync({
          id: resource.id,
          data: updatePayload,
        });
        toast.success('Recurso atualizado com sucesso!');
      } else {
        const createData = {
          ...payload,
          active: values.active,
        } as CreateResourceDto & { active?: boolean };

        if (defaultProjectId) {
          createData.projectIds = [defaultProjectId];
        }

        await createMutation.mutateAsync(createData);
        toast.success('Recurso criado com sucesso!');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Ocorreu um erro ao salvar o recurso.');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Recurso' : 'Novo Recurso'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="max-h-[60vh] overflow-y-auto px-1 py-1 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do recurso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Desenvolvedor Front-end" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@optsolv.com.br" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habilidades</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {(field.value || []).map((skill: string, index: number) => (
                            <Badge key={skill} variant="secondary" className="px-2 py-1 text-sm">
                              {skill}
                              <button
                                type="button"
                                onClick={() => {
                                  const newSkills = [...(field.value || [])];
                                  newSkills.splice(index, 1);
                                  field.onChange(newSkills);
                                }}
                                className="ml-2 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              >
                                <span className="sr-only">Remover habilidade</span>
                                <svg
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="Digite uma habilidade e pressione Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const newSkill = e.currentTarget.value.trim();
                              if (newSkill && !(field.value || []).includes(newSkill)) {
                                field.onChange([...(field.value || []), newSkill]);
                              }
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo / Hora (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        value={field.value as number | string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Ativo</FormLabel>
                        <div className="text-xs text-muted-foreground">
                          Recursos inativos não aparecem em novas alocações.
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t mt-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEditing ? 'Salvar Alterações' : 'Criar Recurso'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
