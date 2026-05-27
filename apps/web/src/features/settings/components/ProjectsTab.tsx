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
import type { ProjectAdminDto, ProjectFilters } from '../api/projectsAdminApi';
import { useClients } from '../hooks/useClients';
import { useProjectsAdmin, useUpdateProjectAdmin } from '../hooks/useProjectsAdmin';
import { ProjectFormDialog } from './ProjectFormDialog';

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

export function ProjectsTab() {
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectAdminDto | null>(null);

  const activeParam =
    activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
  const clientParam = clientFilter !== 'todos' ? clientFilter : undefined;
  const statusParam = statusFilter !== 'todos' ? statusFilter : undefined;

  const filters: ProjectFilters = {};
  if (search) filters.search = search;
  if (clientParam) filters.clientId = clientParam;
  if (statusParam) filters.status = statusParam;
  if (activeParam !== undefined) filters.active = activeParam;

  const { data: projectsList, isLoading } = useProjectsAdmin(filters);

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
    } catch {
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
        <Button onClick={handleNew}>Novo Projeto</Button>
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
                    <Badge variant="outline" className={getStatusStyles(item.project.status)}>
                      {PROJECT_STATUS_LABELS[item.project.status] || item.project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        item.project.active
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-400 dark:border-emerald-500/30'
                          : 'bg-destructive/10 text-destructive border-destructive/25'
                      }
                    >
                      {item.project.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      Editar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => toggleStatus(item)}>
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
