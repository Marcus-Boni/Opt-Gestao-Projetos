import { Search, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ResourceDto } from '@/features/resources/api/resourcesApi';
import { useLinkResource, useResources } from '@/features/resources/hooks/useResources';
import { LoadingState } from '@/shared/components/StateViews';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  /** IDs dos recursos já alocados ao projeto — serão desabilitados na lista */
  allocatedIds: string[];
};

export function AllocateResourceDialog({ open, onOpenChange, projectId, allocatedIds }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const { data, isLoading } = useResources({ active: true, ...(search ? { search } : {}) });
  const linkMutation = useLinkResource(projectId);

  const allResources = data?.resources ?? [];

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function handleConfirm() {
    if (selected.length === 0) return;

    try {
      await Promise.all(selected.map((resourceId) => linkMutation.mutateAsync(resourceId)));
      toast.success(
        selected.length === 1
          ? 'Recurso alocado com sucesso!'
          : `${selected.length} recursos alocados com sucesso!`,
      );
      setSelected([]);
      onOpenChange(false);
    } catch {
      toast.error('Erro ao alocar recurso(s). Tente novamente.');
    }
  }

  function handleClose(open: boolean) {
    if (!open) setSelected([]);
    onOpenChange(open);
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  const STATUS_LABEL: Record<string, string> = {
    disponivel: 'Disponível',
    alocado: 'Alocado',
    sobrecarga: 'Sobrecarga',
    inativo: 'Inativo',
  };

  const STATUS_CLASS: Record<string, string> = {
    disponivel: 'bg-health-ok/15 text-health-ok',
    alocado: 'bg-primary/10 text-primary',
    sobrecarga: 'bg-health-critical/15 text-health-critical',
    inativo: 'bg-muted text-muted-foreground',
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Alocar Recursos ao Projeto</DialogTitle>
          <DialogDescription>
            Selecione um ou mais recursos cadastrados para alocar neste projeto.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar recurso por nome..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <ScrollArea className="h-72 rounded-md border">
          {isLoading ? (
            <div className="p-4">
              <LoadingState />
            </div>
          ) : (
            <ul className="divide-y">
              {allResources.map((resource: ResourceDto) => {
                const isAllocated = allocatedIds.includes(resource.id);
                const isSelected = selected.includes(resource.id);

                return (
                  <li
                    key={resource.id}
                    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: <li role="option">
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={isAllocated ? -1 : 0}
                    onClick={() => !isAllocated && toggleSelect(resource.id)}
                    onKeyDown={(e) => {
                      if (!isAllocated && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        toggleSelect(resource.id);
                      }
                    }}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors',
                      isAllocated
                        ? 'cursor-not-allowed opacity-50'
                        : isSelected
                          ? 'bg-primary/10'
                          : 'hover:bg-muted/50',
                    )}
                  >
                    {/* Checkbox visual */}
                    <div
                      className={cn(
                        'size-4 shrink-0 rounded border-2 transition-colors',
                        isAllocated
                          ? 'border-muted-foreground/30 bg-muted'
                          : isSelected
                            ? 'border-primary bg-primary'
                            : 'border-border',
                      )}
                    />

                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(resource.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name + role — ocupa o espaço disponível e trunca */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{resource.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{resource.role}</p>
                    </div>

                    {/* Metadados à direita — largura fixa para não estourar */}
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {isAllocated ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          Já alocado
                        </span>
                      ) : (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                            STATUS_CLASS[resource.status] ?? STATUS_CLASS.disponivel,
                          )}
                        >
                          {STATUS_LABEL[resource.status] ?? resource.status}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {resource.utilizationPercent}% util.
                      </span>
                    </div>
                  </li>
                );
              })}

              {allResources.length === 0 && (
                <li className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum recurso encontrado.
                </li>
              )}
            </ul>
          )}
        </ScrollArea>

        <p className="text-xs text-muted-foreground">
          {selected.length > 0
            ? `${selected.length} recurso(s) selecionado(s)`
            : 'Nenhum selecionado'}
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selected.length === 0 || linkMutation.isPending}
          >
            <UserPlus className="mr-2 size-4" />
            {linkMutation.isPending ? 'Alocando...' : 'Alocar Selecionados'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
