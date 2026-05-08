type ProjectStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export type ProjectFixture = {
  id: string;
  clientId: string;
  clientName: string;
  clientTaxId: string | null;
  name: string;
  code: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus;
};

export type FinanceMonthFixture = {
  id: string;
  projectId: string;
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  commissions: number;
  taxes: number;
  harvestCost: number;
  budget: number;
  hours: number;
};

export type CollaboratorFixture = {
  id: string;
  projectId: string;
  name: string;
  role: string;
  hours: number;
  cost: number;
};

export type TimeEntryFixture = {
  id: string;
  projectId: string;
  date: string;
  collaborator: string;
  task: string;
  hours: number;
  billable: boolean;
};

const projectIds = [
  'prj-ab-bi',
  'prj-acotel-opt',
  'prj-arcelor-governanca',
  'prj-wedo-comunify',
] as const;

type ProjectId = (typeof projectIds)[number];

export const projectFixtures: Array<ProjectFixture & { id: ProjectId }> = [
  {
    id: 'prj-ab-bi',
    clientId: 'cli-ab-cientifica',
    clientName: 'AB Cientifica',
    clientTaxId: '12.345.678/0001-90',
    name: 'Power BI Financeiro',
    code: 'AB-BI-2025',
    startDate: '2025-01-06',
    endDate: '2025-12-19',
    status: 'active',
  },
  {
    id: 'prj-acotel-opt',
    clientId: 'cli-acotel',
    clientName: 'Acotel',
    clientTaxId: '23.456.789/0001-10',
    name: 'OptTime Integracao',
    code: 'ACOTEL-OPTTIME',
    startDate: '2025-02-03',
    endDate: '2025-11-28',
    status: 'active',
  },
  {
    id: 'prj-arcelor-governanca',
    clientId: 'cli-arcelor',
    clientName: 'Arcelor Mittal',
    clientTaxId: '34.567.890/0001-22',
    name: 'Governanca de Projetos',
    code: 'ARC-PMO-2025',
    startDate: '2025-01-20',
    endDate: '2025-10-31',
    status: 'paused',
  },
  {
    id: 'prj-wedo-comunify',
    clientId: 'cli-wedo',
    clientName: 'Wedo / Comunify',
    clientTaxId: null,
    name: 'Comunify Sustentacao',
    code: 'COMUNIFY-2025',
    startDate: '2025-03-10',
    endDate: '2025-12-12',
    status: 'active',
  },
];

const monthlyBase = [
  { year: 2025, month: 1, factor: 0.82 },
  { year: 2025, month: 2, factor: 0.9 },
  { year: 2025, month: 3, factor: 1 },
  { year: 2025, month: 4, factor: 1.08 },
  { year: 2025, month: 5, factor: 1.14 },
  { year: 2025, month: 6, factor: 0.96 },
  { year: 2024, month: 11, factor: 0.74 },
  { year: 2024, month: 12, factor: 0.79 },
] as const;

const projectBase = {
  'prj-ab-bi': {
    revenue: 34_800,
    expenses: 2_200,
    commissions: 1_100,
    taxes: 3_400,
    harvestCost: 24_650,
    budget: 30_000,
    hours: 320.5,
  },
  'prj-acotel-opt': {
    revenue: 48_500,
    expenses: 4_800,
    commissions: 1_940,
    taxes: 4_950,
    harvestCost: 39_200,
    budget: 42_000,
    hours: 502,
  },
  'prj-arcelor-governanca': {
    revenue: 61_200,
    expenses: 7_500,
    commissions: 2_448,
    taxes: 6_120,
    harvestCost: 43_700,
    budget: 46_000,
    hours: 611.25,
  },
  'prj-wedo-comunify': {
    revenue: 27_900,
    expenses: 1_150,
    commissions: 930,
    taxes: 2_790,
    harvestCost: 25_400,
    budget: 26_500,
    hours: 284.75,
  },
} satisfies Record<ProjectId, Omit<FinanceMonthFixture, 'id' | 'projectId' | 'year' | 'month'>>;

export const financeMonthFixtures: FinanceMonthFixture[] = projectFixtures.flatMap((project) =>
  monthlyBase.map((item) => {
    const base = projectBase[project.id];
    return {
      id: `${project.id}-${item.year}-${item.month}`,
      projectId: project.id,
      year: item.year,
      month: item.month,
      revenue: Math.round(base.revenue * item.factor),
      expenses: Math.round(base.expenses * item.factor),
      commissions: Math.round(base.commissions * item.factor),
      taxes: Math.round(base.taxes * item.factor),
      harvestCost: Math.round(base.harvestCost * item.factor),
      budget: Math.round(base.budget * item.factor),
      hours: Number((base.hours * item.factor).toFixed(2)),
    };
  }),
);

export const collaboratorFixtures: CollaboratorFixture[] = [
  {
    id: 'col-ana',
    projectId: 'prj-ab-bi',
    name: 'Ana Ribeiro',
    role: 'Gestao de Projetos',
    hours: 92,
    cost: 11_960,
  },
  {
    id: 'col-bruno',
    projectId: 'prj-ab-bi',
    name: 'Bruno Silva',
    role: 'BI Specialist',
    hours: 148,
    cost: 14_060,
  },
  {
    id: 'col-camila',
    projectId: 'prj-wedo-comunify',
    name: 'Camila Torres',
    role: 'Full-stack',
    hours: 176,
    cost: 16_720,
  },
  {
    id: 'col-diego',
    projectId: 'prj-acotel-opt',
    name: 'Diego Martins',
    role: 'Integracoes',
    hours: 204,
    cost: 20_400,
  },
];

export const timeEntryFixtures: TimeEntryFixture[] = [
  {
    id: 'te-1',
    projectId: 'prj-ab-bi',
    date: '2025-05-05',
    collaborator: 'Ana Ribeiro',
    task: 'Ritual executivo e riscos',
    hours: 3.5,
    billable: true,
  },
  {
    id: 'te-2',
    projectId: 'prj-ab-bi',
    date: '2025-05-06',
    collaborator: 'Bruno Silva',
    task: 'Modelo financeiro Power BI',
    hours: 6,
    billable: true,
  },
  {
    id: 'te-3',
    projectId: 'prj-wedo-comunify',
    date: '2025-05-07',
    collaborator: 'Camila Torres',
    task: 'Ajuste fluxo de suporte',
    hours: 7.25,
    billable: true,
  },
  {
    id: 'te-4',
    projectId: 'prj-acotel-opt',
    date: '2025-05-07',
    collaborator: 'Diego Martins',
    task: 'Adapter OptTime',
    hours: 5.75,
    billable: false,
  },
];
