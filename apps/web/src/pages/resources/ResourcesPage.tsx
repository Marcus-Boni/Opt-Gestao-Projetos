import { AlertCircle, Plus, Search, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ResourceCard } from '@/features/resources';
import type { GetResourcesFilter, ResourceDto } from '@/features/resources/api/resourcesApi';
import { ResourceFormDialog } from '@/features/resources/components/ResourceFormDialog';
import { useResources, useUpdateResource } from '@/features/resources/hooks/useResources';
import { KpiCard } from '@/shared/components/KpiCard';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

export function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceDto | null>(null);

  const filters: GetResourcesFilter = {};
  if (search) filters.search = search;
  if (activeFilter !== 'all') filters.active = activeFilter === 'true';

  const query = useResources(filters);
  const updateMutation = useUpdateResource();

  const handleEdit = (resource: ResourceDto) => {
    setEditingResource(resource);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingResource(null);
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (resource: ResourceDto) => {
    try {
      await updateMutation.mutateAsync({
        id: resource.id,
        data: { active: !resource.active },
      });
      toast.success(resource.active ? 'Recurso inativado.' : 'Recurso ativado.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao alterar o status do recurso.');
    }
  };

  if (query.isLoading && !query.data) {
    return (
      <>
        <PageHeader eyebrow="Recursos" title="Gerenciamento de Recursos" />
        <main className="p-5">
          <LoadingState />
        </main>
      </>
    );
  }

  if (query.isError || !query.data) {
    return (
      <>
        <PageHeader eyebrow="Recursos" title="Gerenciamento de Recursos" />
        <main className="p-5">
          <ErrorState
            title="Não foi possível carregar os recursos"
            description="Verifique a API e tente novamente."
            onRetry={() => query.refetch()}
          />
        </main>
      </>
    );
  }

  const { resources, avgUtilization, availableCount, overloadedCount } = query.data;

  return (
    <>
      <PageHeader
        eyebrow="Recursos"
        title="Gerenciamento de Recursos"
        description="Capacidade, alocação e habilidades do time."
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            Novo Recurso
          </Button>
        }
      />
      <main className="flex flex-col gap-6 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <KpiCard
            title="Utilização Média"
            value={`${avgUtilization.toFixed(0)}%`}
            icon={Users}
            tone={avgUtilization > 100 ? 'negative' : avgUtilization > 85 ? 'warning' : 'positive'}
          />
          <KpiCard
            title="Disponíveis"
            value={String(availableCount)}
            icon={UserCheck}
            tone="positive"
          />
          <KpiCard
            title="Sobrecarregados"
            value={String(overloadedCount)}
            icon={AlertCircle}
            tone={overloadedCount > 0 ? 'negative' : 'positive'}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="true">Ativos</SelectItem>
              <SelectItem value="false">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
            />
          ))}

          {resources.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Nenhum recurso encontrado com os filtros selecionados.
            </div>
          )}
        </div>
      </main>

      <ResourceFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        resource={editingResource}
      />
    </>
  );
}
