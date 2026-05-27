import 'dotenv/config';
import { eq, inArray } from 'drizzle-orm';
import { db } from './index';
import {
  clients,
  projectFinanceMonthly,
  projectResources,
  projects,
  resources,
  tasks,
  user,
} from './schema/index';

// Hardcoded static UUIDs for predictability and clean idempotency
const UUIDS = {
  clients: {
    abCientifica: '7f04dfb3-764f-40e9-9130-928d32d3eb01',
    acotel: 'c1284d72-9694-4d8e-be10-be02fe206002',
    arcelor: 'd8bb56d7-1335-430b-99f2-6cbbe15b8003',
    wedo: '5be6b7ad-452f-488f-9a10-0980ff257004',
  },
  projects: {
    abBi: '11c7da25-91db-4bc5-9c98-4c9f13c66f41',
    acotelOpt: '2a9ed240-a193-4a11-b12e-a2fe4c3d3a42',
    arcelorGovernanca: '3f39edbb-37a5-48fa-bb4e-76c2eb4c9f13',
    wedoComunify: '4d4de4bb-b1be-40fb-a9f2-be9de3a48bf5',
  },
  resources: {
    ana: '8a123f1a-b6b2-4d2d-947b-1be5e8f4ab01',
    bruno: '9b234f2b-c7c3-4e3e-a58c-2bf6f9f5bc02',
    camila: 'a3456f3c-d8d4-4f4f-b69d-3cf7f0f6cd03',
    diego: 'b4567f4d-e9e5-4f5f-c7ae-4df8f1f7de04',
  },
};

async function seed() {
  console.log('🏁 Iniciando processo de seeding...');

  try {
    // 1. Get or create a manager user
    const dbUsers = await db.select().from(user).limit(1);
    let managerId: string;

    if (dbUsers.length > 0) {
      managerId = dbUsers[0].id;
      console.log(
        `👤 Usuário existente encontrado como Gerente: ${dbUsers[0].name} (${managerId})`,
      );
    } else {
      managerId = 'usr-mock-gp';
      await db.insert(user).values({
        id: managerId,
        name: 'Maria Olivia',
        email: 'maria.olivia@optsolv.com',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`👤 Criado Gerente mock: Maria Olivia (${managerId})`);
    }

    // 2. Clear old seeded data to ensure clean idempotency (order matters due to constraints)
    console.log('🧹 Limpando dados mockados antigos...');

    await db
      .delete(projectFinanceMonthly)
      .where(inArray(projectFinanceMonthly.projectId, Object.values(UUIDS.projects)));
    await db
      .delete(projectResources)
      .where(inArray(projectResources.projectId, Object.values(UUIDS.projects)));
    await db.delete(tasks).where(inArray(tasks.projectId, Object.values(UUIDS.projects)));
    await db.delete(projects).where(inArray(projects.id, Object.values(UUIDS.projects)));
    await db.delete(resources).where(inArray(resources.id, Object.values(UUIDS.resources)));
    await db.delete(clients).where(inArray(clients.id, Object.values(UUIDS.clients)));

    console.log('✨ Base de dados limpa. Iniciando novas inserções...');

    // 3. Insert Clients
    await db.insert(clients).values([
      {
        id: UUIDS.clients.abCientifica,
        name: 'AB Cientifica',
        taxId: '12.345.678/0001-90',
        contactName: 'Contato AB',
        contactEmail: 'ab@cientifica.com',
        active: true,
      },
      {
        id: UUIDS.clients.acotel,
        name: 'Acotel',
        taxId: '23.456.789/0001-10',
        contactName: 'Contato Acotel',
        contactEmail: 'acotel@acotel.com',
        active: true,
      },
      {
        id: UUIDS.clients.arcelor,
        name: 'Arcelor Mittal',
        taxId: '34.567.890/0001-22',
        contactName: 'Contato Arcelor',
        contactEmail: 'arcelor@arcelor.com',
        active: true,
      },
      {
        id: UUIDS.clients.wedo,
        name: 'Wedo / Comunify',
        taxId: '45.678.901/0001-33',
        contactName: 'Contato Wedo',
        contactEmail: 'wedo@wedo.com',
        active: true,
      },
    ]);
    console.log('🏢 Clientes inseridos.');

    // 4. Calculate project totals (budget & contract price) based on monthly factors
    const monthlyBase = [
      { year: 2025, month: 1, factor: 0.82 },
      { year: 2025, month: 2, factor: 0.9 },
      { year: 2025, month: 3, factor: 1 },
      { year: 2025, month: 4, factor: 1.08 },
      { year: 2025, month: 5, factor: 1.14 },
      { year: 2025, month: 6, factor: 0.96 },
      { year: 2024, month: 11, factor: 0.74 },
      { year: 2024, month: 12, factor: 0.79 },
    ];

    const projectBases = {
      abBi: { revenue: 34_800, budget: 30_000 },
      acotelOpt: { revenue: 48_500, budget: 42_000 },
      arcelorGovernanca: { revenue: 61_200, budget: 46_000 },
      wedoComunify: { revenue: 27_900, budget: 26_500 },
    };

    const getTotals = (base: { revenue: number; budget: number }) => {
      const sumFactor = monthlyBase.reduce((sum, m) => sum + m.factor, 0);
      return {
        contractPrice: Math.round(base.revenue * sumFactor),
        budget: Math.round(base.budget * sumFactor),
      };
    };

    const totals = {
      abBi: getTotals(projectBases.abBi),
      acotelOpt: getTotals(projectBases.acotelOpt),
      arcelorGovernanca: getTotals(projectBases.arcelorGovernanca),
      wedoComunify: getTotals(projectBases.wedoComunify),
    };

    // 5. Insert Projects
    await db.insert(projects).values([
      {
        id: UUIDS.projects.abBi,
        clientId: UUIDS.clients.abCientifica,
        name: 'Power BI Financeiro',
        code: 'AB-BI-2025',
        type: 'implantação',
        status: 'no_prazo',
        startDate: new Date('2025-01-06'),
        endDate: new Date('2025-12-19'),
        managerId: managerId,
        budget: totals.abBi.budget.toString(),
        contractPrice: totals.abBi.contractPrice.toString(),
        progressPlanned: '65.00',
        progressActual: '70.00',
        active: true,
      },
      {
        id: UUIDS.projects.acotelOpt,
        clientId: UUIDS.clients.acotel,
        name: 'OptTime Integracao',
        code: 'ACOTEL-OPTTIME',
        type: 'desenvolvimento',
        status: 'no_prazo',
        startDate: new Date('2025-02-03'),
        endDate: new Date('2025-11-28'),
        managerId: managerId,
        budget: totals.acotelOpt.budget.toString(),
        contractPrice: totals.acotelOpt.contractPrice.toString(),
        progressPlanned: '65.00',
        progressActual: '70.00',
        active: true,
      },
      {
        id: UUIDS.projects.arcelorGovernanca,
        clientId: UUIDS.clients.arcelor,
        name: 'Governanca de Projetos',
        code: 'ARC-PMO-2025',
        type: 'consultoria',
        status: 'alerta',
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-10-31'),
        managerId: managerId,
        budget: totals.arcelorGovernanca.budget.toString(),
        contractPrice: totals.arcelorGovernanca.contractPrice.toString(),
        progressPlanned: '65.00',
        progressActual: '50.00',
        active: true,
      },
      {
        id: UUIDS.projects.wedoComunify,
        clientId: UUIDS.clients.wedo,
        name: 'Comunify Sustentacao',
        code: 'COMUNIFY-2025',
        type: 'sustentação',
        status: 'no_prazo',
        startDate: new Date('2025-03-10'),
        endDate: new Date('2025-12-12'),
        managerId: managerId,
        budget: totals.wedoComunify.budget.toString(),
        contractPrice: totals.wedoComunify.contractPrice.toString(),
        progressPlanned: '65.00',
        progressActual: '70.00',
        active: true,
      },
    ]);
    console.log('💻 Projetos inseridos com orçamentos calculados.');

    // 6. Insert Monthly Finance logs
    const projectMonthlyBases = {
      [UUIDS.projects.abBi]: {
        revenue: 34_800,
        expenses: 2_200,
        commissions: 1_100,
        taxes: 3_400,
        harvestCost: 24_650,
        budget: 30_000,
        hours: 320.5,
      },
      [UUIDS.projects.acotelOpt]: {
        revenue: 48_500,
        expenses: 4_800,
        commissions: 1_940,
        taxes: 4_950,
        harvestCost: 39_200,
        budget: 42_000,
        hours: 502,
      },
      [UUIDS.projects.arcelorGovernanca]: {
        revenue: 61_200,
        expenses: 7_500,
        commissions: 2_448,
        taxes: 6_120,
        harvestCost: 43_700,
        budget: 46_000,
        hours: 611.25,
      },
      [UUIDS.projects.wedoComunify]: {
        revenue: 27_900,
        expenses: 1_150,
        commissions: 930,
        taxes: 2_790,
        harvestCost: 25_400,
        budget: 26_500,
        hours: 284.75,
      },
    };

    const monthlyFinanceRecords = Object.entries(projectMonthlyBases).flatMap(([projId, base]) =>
      monthlyBase.map((item) => ({
        projectId: projId,
        year: item.year,
        month: item.month,
        revenue: Math.round(base.revenue * item.factor).toString(),
        expenses: Math.round(base.expenses * item.factor).toString(),
        commissions: Math.round(base.commissions * item.factor).toString(),
        taxes: Math.round(base.taxes * item.factor).toString(),
        harvestCost: Math.round(base.harvestCost * item.factor).toString(),
        budgetMonth: Math.round(base.budget * item.factor).toString(),
        hours: Number((base.hours * item.factor).toFixed(2)).toString(),
      })),
    );

    await db.insert(projectFinanceMonthly).values(monthlyFinanceRecords);
    console.log('📈 Registros financeiros mensais inseridos.');

    // 7. Insert Resources (Collaborators)
    await db.insert(resources).values([
      {
        id: UUIDS.resources.ana,
        name: 'Ana Ribeiro',
        role: 'Gestao de Projetos',
        email: 'ana.ribeiro@optsolv.com',
        costPerHour: '130.00',
        active: true,
      },
      {
        id: UUIDS.resources.bruno,
        name: 'Bruno Silva',
        role: 'BI Specialist',
        email: 'bruno.silva@optsolv.com',
        costPerHour: '95.00',
        active: true,
      },
      {
        id: UUIDS.resources.camila,
        name: 'Camila Torres',
        role: 'Full-stack',
        email: 'camila.torres@optsolv.com',
        costPerHour: '95.00',
        active: true,
      },
      {
        id: UUIDS.resources.diego,
        name: 'Diego Martins',
        role: 'Integracoes',
        email: 'diego.martins@optsolv.com',
        costPerHour: '100.00',
        active: true,
      },
    ]);
    console.log('👥 Recursos (Colaboradores) cadastrados.');

    // 8. Insert Project Resources allocations
    await db.insert(projectResources).values([
      {
        projectId: UUIDS.projects.abBi,
        resourceId: UUIDS.resources.ana,
        hoursPlanned: '105.00',
        hoursActual: '92.00',
        allocation: '50.00',
      },
      {
        projectId: UUIDS.projects.abBi,
        resourceId: UUIDS.resources.bruno,
        hoursPlanned: '170.00',
        hoursActual: '148.00',
        allocation: '80.00',
      },
      {
        projectId: UUIDS.projects.wedoComunify,
        resourceId: UUIDS.resources.camila,
        hoursPlanned: '200.00',
        hoursActual: '176.00',
        allocation: '100.00',
      },
      {
        projectId: UUIDS.projects.acotelOpt,
        resourceId: UUIDS.resources.diego,
        hoursPlanned: '235.00',
        hoursActual: '204.00',
        allocation: '100.00',
      },
    ]);
    console.log('🖇️ Alocações de recursos realizadas.');

    // 9. Insert Tasks (Backlog Items)
    const mockBacklog = [
      {
        type: 'Epic',
        title: 'Atendimento Omnichannel',
        progress: 70,
        est: 480,
        act: 360,
        status: 'doing',
      },
      {
        type: 'Feature',
        title: 'Chat em tempo real',
        progress: 90,
        est: 120,
        act: 110,
        status: 'doing',
      },
      {
        type: 'Feature',
        title: 'Integração WhatsApp Business',
        progress: 60,
        est: 80,
        act: 70,
        status: 'doing',
      },
      {
        type: 'PBI',
        title: 'Implementar histórico de conversas',
        progress: 100,
        est: 24,
        act: 22,
        status: 'done',
      },
      { type: 'PBI', title: 'Webhooks de status', progress: 40, est: 16, act: 22, status: 'doing' },
      {
        type: 'PBI',
        title: 'Painel do atendente',
        progress: 75,
        est: 32,
        act: 28,
        status: 'doing',
      },
    ] as const;

    const taskRecords = Object.values(UUIDS.projects).flatMap((projId) =>
      mockBacklog.map((item, idx) => ({
        projectId: projId,
        title: item.title,
        status: item.status,
        adoType: item.type,
        // Using priority as a way to hold metadata or standard middle priority
        priority: 'media' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    await db.insert(tasks).values(taskRecords);
    console.log('📋 Itens de backlog inseridos na tabela de tarefas.');

    console.log('✅ Seeding concluído com sucesso total!');
  } catch (error) {
    console.error('❌ Erro durante o seeding:', error);
  } finally {
    process.exit(0);
  }
}

seed();
