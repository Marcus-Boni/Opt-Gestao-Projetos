import crypto from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { requireSession } from '../../plugins/auth';
import { ProjectRepository } from '../projects/project.repository';

type TaskStatus = 'todo' | 'doing' | 'done';
type TaskPriority = 'alta' | 'media' | 'baixa';

const taskStore: {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  clientName: string;
  assigneeName: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  adoWorkItemId: string | null;
  isOverdue: boolean;
}[] = [
  {
    id: 't-1',
    title: 'Configurar pipeline de dados financeiros',
    projectId: '11c7da25-91db-4bc5-9c98-4c9f13c66f41',
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
    projectId: '2a9ed240-a193-4a11-b12e-a2fe4c3d3a42',
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
    projectId: '3f39edbb-37a5-48fa-bb4e-76c2eb4c9f13',
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
    projectId: '4d4de4bb-b1be-40fb-a9f2-be9de3a48bf5',
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
    projectId: '11c7da25-91db-4bc5-9c98-4c9f13c66f41',
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
  const repo = new ProjectRepository();

  app.get('/api/tasks', { preHandler: requireSession }, async (req, reply) => {
    const { projectId, clientName, status, search } = req.query as {
      projectId?: string;
      clientName?: string;
      status?: string;
      search?: string;
    };

    let tasks = [...taskStore];

    if (projectId) {
      tasks = tasks.filter((t) => t.projectId === projectId);
    }

    if (clientName) {
      tasks = tasks.filter((t) => t.clientName === clientName);
    }

    if (status) {
      tasks = tasks.filter((t) => t.status === status);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(lowerSearch));
    }

    return reply.send({ tasks });
  });

  app.post('/api/tasks', { preHandler: requireSession }, async (req, reply) => {
    const body = req.body as {
      title: string;
      projectId: string;
      priority: TaskPriority;
      status?: TaskStatus;
    };
    const project = await repo.findProject(body.projectId);

    if (!project) return reply.status(400).send({ error: 'Project not found' });

    const newTask = {
      id: crypto.randomUUID(),
      title: body.title,
      projectId: body.projectId,
      projectName: project.name,
      clientName: project.clientName,
      assigneeName: null,
      status: body.status || 'todo',
      priority: body.priority,
      dueDate: null,
      adoWorkItemId: null,
      isOverdue: false,
    };

    taskStore.push(newTask);
    return reply.status(201).send(newTask);
  });

  app.put('/api/tasks/:taskId', { preHandler: requireSession }, async (req, reply) => {
    const { taskId } = req.params as { taskId: string };
    const body = req.body as {
      title?: string;
      projectId?: string;
      priority?: TaskPriority;
      status?: TaskStatus;
    };

    const taskIndex = taskStore.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return reply.status(404).send({ error: 'Task not found' });

    const task = taskStore[taskIndex];
    if (!task) return reply.status(404).send({ error: 'Task not found' });

    if (body.projectId && body.projectId !== task.projectId) {
      const project = await repo.findProject(body.projectId);
      if (!project) return reply.status(400).send({ error: 'Project not found' });
      task.projectId = project.id;
      task.projectName = project.name;
      task.clientName = project.clientName;
    }

    if (body.title) task.title = body.title;
    if (body.priority) task.priority = body.priority;
    if (body.status) task.status = body.status;

    taskStore[taskIndex] = task;
    return reply.send(task);
  });

  app.delete('/api/tasks/:taskId', { preHandler: requireSession }, async (req, reply) => {
    const { taskId } = req.params as { taskId: string };
    const taskIndex = taskStore.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return reply.status(404).send({ error: 'Task not found' });

    taskStore.splice(taskIndex, 1);
    return reply.send({ success: true });
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
