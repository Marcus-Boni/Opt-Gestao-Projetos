import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import type { ClientDto, ClientFilters } from '../api/clientsApi';
import { useClients, useUpdateClient } from '../hooks/useClients';
import { ClientFormDialog } from './ClientFormDialog';

export function ClientsTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null);

  const activeParam =
    statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;

  const filters: ClientFilters = {};
  if (search) filters.search = search;
  if (activeParam !== undefined) filters.active = activeParam;

  const { data: clientsList, isLoading } = useClients(filters);
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
    } catch {
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
        <Button onClick={handleNew}>Novo Cliente</Button>
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
                    <Badge
                      variant="outline"
                      className={
                        client.active
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-400 dark:border-emerald-500/30'
                          : 'bg-destructive/10 text-destructive border-destructive/25'
                      }
                    >
                      {client.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                      Editar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => toggleStatus(client)}>
                      {client.active ? 'Inativar' : 'Ativar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} client={selectedClient} />
    </div>
  );
}
