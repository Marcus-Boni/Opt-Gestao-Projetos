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
import type { ClientDto } from '../api/clientsApi';
import { useCreateClient, useUpdateClient } from '../hooks/useClients';

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
