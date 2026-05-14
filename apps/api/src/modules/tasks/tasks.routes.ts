import type { FastifyInstance } from 'fastify';
import { requireSession } from '../../plugins/auth';

type TaskStatus = 'todo' | 'doing' | 'done';

const taskStore: {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  clientName: string;
  assigneeName: string | null;
  status: TaskStatus;
  priority: 'alta' | 'media' | 'baixa';
  dueDate: string | null;
  adoWorkItemId: string | null;
  isOverdue: boolean;
}[] = [
  {
    id: 't-1',
    title: 'Configurar pipeline de dados financeiros',
    projectId: 'prj-ab-bi',
    projectName: 'Power BI Financeiro',
    clientName: 'AB Científica',
    assigneeName: 'Ana Ribeiro',
    status: 'doing',
    priority: 'alta',
    dueDate: '2025-06-15',
    adoWorkItemId: 'AB-1247',
    isOverdue: false,
  },
  {
    id: 't-2',
    title: 'Revisar integração OptTime — endpoints de sincronização',
    projectId: 'prj-acotel-opt',
    projectName: 'OptTime Integração',
    clientName: 'Acotel',
    assigneeName: 'Carlos Mendes',
    status: 'todo',
    priority: 'alta',
    dueDate: '2025-05-30',
    adoWorkItemId: null,
    isOverdue: true,
  },
  {
    id: 't-3',
    title: 'Criar relatório de governança mensal',
    projectId: 'prj-arcelor-governanca',
    projectName: 'Governança de Projetos',
    clientName: 'Arcelor Mittal',
    assigneeName: 'Mariana Costa',
    status: 'todo',
    priority: 'media',
    dueDate: '2025-06-30',
    adoWorkItemId: 'ARC-0421',
    isOverdue: false,
  },
  {
    id: 't-4',
    title: 'Validar dados de horas do Comunify no Harvest',
    projectId: 'prj-wedo-comunify',
    projectName: 'Comunify Sustentação',
    clientName: 'Wedo / Comunify',
    assigneeName: null,
    status: 'done',
    priority: 'baixa',
    dueDate: '2025-05-10',
    adoWorkItemId: null,
    isOverdue: false,
  },
  {
    id: 't-5',
    title: 'Atualizar documentação de arquitetura',
    projectId: 'prj-ab-bi',
    projectName: 'Power BI Financeiro',
    clientName: 'AB Científica',
    assigneeName: 'Ana Ribeiro',
    status: 'todo',
    priority: 'baixa',
    dueDate: '2025-07-01',
    adoWorkItemId: null,
    isOverdue: false,
  },
];

export async function tasksRoutes(app: FastifyInstance) {
  app.get('/api/tasks', { preHandler: requireSession }, async (req, reply) => {
    const { projectId } = req.query as { projectId?: string };
    const tasks = projectId ? taskStore.filter((t) => t.projectId === projectId) : taskStore;
    return reply.send({ tasks });
  });

  app.patch('/api/tasks/:taskId/status', { preHandler: requireSession }, async (req, reply) => {
    const { taskId } = req.params as { taskId: string };
    const { status } = req.body as { status: TaskStatus };
    const task = taskStore.find((t) => t.id === taskId);
    if (!task) return reply.status(404).send({ error: 'Task not found' });
    task.status = status;
    return reply.send(task);
  });
}
