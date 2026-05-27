import { useState } from 'react';
import { toast } from 'sonner';
import type { GetResourcesFilter, ResourceDto } from '@/features/resources/api/resourcesApi';
import { ResourceFormDialog } from '@/features/resources/components/ResourceFormDialog';
import { useResources, useUpdateResource } from '@/features/resources/hooks/useResources';
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

export function ResourcesTab() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceDto | null>(null);

  const activeParam =
    activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
  const roleParam = roleFilter !== 'todos' ? roleFilter : undefined;

  const filters: GetResourcesFilter = {};
  if (search) filters.search = search;
  if (roleParam) filters.role = roleParam;
  if (activeParam !== undefined) filters.active = activeParam;

  const { data, isLoading } = useResources(filters);

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
    } catch {
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
        <Button onClick={handleNew}>Novo Recurso</Button>
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
                    <Badge
                      variant="outline"
                      className={
                        resource.active
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-400 dark:border-emerald-500/30'
                          : 'bg-destructive/10 text-destructive border-destructive/25'
                      }
                    >
                      {resource.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(resource)}>
                      Editar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => toggleStatus(resource)}>
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
