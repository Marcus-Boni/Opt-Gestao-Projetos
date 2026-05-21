import { AlertCircle, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ResourceCard } from '@/features/resources';
import type { ResourceDto } from '@/features/resources/api/resourcesApi';
import { ResourceFormDialog } from '@/features/resources/components/ResourceFormDialog';
import { useResources, useUnlinkResource } from '@/features/resources/hooks/useResources';
import { KpiCard } from '@/shared/components/KpiCard';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import type { ProjectDetailTabDto } from '../../api/projectsApi';
import { AllocateResourceDialog } from './AllocateResourceDialog';

type Props = { detail: ProjectDetailTabDto };

export function ResourcesTab({ detail }: Props) {
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceDto | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<ResourceDto | null>(null);

  const projectId = detail.id;
  const isRealUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    projectId,
  );

  const query = useResources(isRealUuid ? { projectId } : undefined);
  const unlinkMutation = useUnlinkResource(projectId);

  const allocatedIds = query.data?.resources.map((r) => r.id) ?? [];

  function handleEdit(resource: ResourceDto) {
    setEditingResource(resource);
    setIsEditOpen(true);
  }

  function handleUnlinkClick(resource: ResourceDto) {
    setUnlinkTarget(resource);
  }

  async function confirmUnlink() {
    if (!unlinkTarget) return;
    try {
      await unlinkMutation.mutateAsync(unlinkTarget.id);
      toast.success(`${unlinkTarget.name} removido do projeto.`);
      setUnlinkTarget(null);
    } catch {
      toast.error('Erro ao remover recurso. Tente novamente.');
    }
  }

  if (query.isLoading && !query.data) {
    return (
      <div className="py-8">
        <LoadingState />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="py-4">
        <ErrorState
          title="Não foi possível carregar os recursos"
          description="Verifique a API e tente novamente."
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  const { resources, avgUtilization, overloadedCount } = query.data;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Equipe do Projeto</h2>
        <Button onClick={() => setIsAllocateOpen(true)} size="sm">
          <UserPlus className="mr-2 size-4" />
          Alocar Recurso
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-3">
        <KpiCard title="Time Alocado" value={String(resources.length)} icon={Users} />
        <KpiCard
          title="Sobrecarregados"
          value={String(overloadedCount)}
          icon={AlertCircle}
          tone={overloadedCount > 0 ? 'negative' : 'positive'}
        />
        <KpiCard
          title="Utilização Média"
          value={`${avgUtilization.toFixed(0)}%`}
          icon={Users}
          tone={avgUtilization > 100 ? 'negative' : avgUtilization > 85 ? 'warning' : 'positive'}
        />
      </div>

      {/* Resource grid */}
      {!isRealUuid && (
        <p className="text-center text-sm text-muted-foreground py-2">
          IDs de mock detectados. Dados de vínculos reais disponíveis somente em ambiente com banco
          de dados.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onEdit={handleEdit}
            onRemoveFromProject={() => handleUnlinkClick(resource)}
          />
        ))}

        {resources.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed py-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-2 size-8 opacity-30" />
            <p className="text-sm">Nenhum recurso alocado para este projeto.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setIsAllocateOpen(true)}
            >
              <UserPlus className="mr-2 size-4" />
              Alocar primeiro recurso
            </Button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AllocateResourceDialog
        open={isAllocateOpen}
        onOpenChange={setIsAllocateOpen}
        projectId={projectId}
        allocatedIds={allocatedIds}
      />

      <ResourceFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        resource={editingResource}
      />

      <AlertDialog open={!!unlinkTarget} onOpenChange={(v) => !v && setUnlinkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover recurso do projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover <strong className="text-foreground">{unlinkTarget?.name}</strong> da
              equipe deste projeto? O recurso continuará cadastrado no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUnlinkTarget(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnlink}
              className="bg-health-critical hover:bg-health-critical/90"
              disabled={unlinkMutation.isPending}
            >
              {unlinkMutation.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
