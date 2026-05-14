import { FileDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

const CLIENTS = [
  { id: 'cli-ab-cientifica', name: 'AB Científica' },
  { id: 'cli-acotel', name: 'Acotel' },
  { id: 'cli-arcelor', name: 'Arcelor Mittal' },
  { id: 'cli-wedo', name: 'Wedo / Comunify' },
];

const PROJECTS: Record<string, { id: string; name: string }[]> = {
  'cli-ab-cientifica': [{ id: 'prj-ab-bi', name: 'Power BI Financeiro' }],
  'cli-acotel': [{ id: 'prj-acotel-opt', name: 'OptTime Integração' }],
  'cli-arcelor': [{ id: 'prj-arcelor-governanca', name: 'Governança de Projetos' }],
  'cli-wedo': [{ id: 'prj-wedo-comunify', name: 'Comunify Sustentação' }],
};

export function ReportsPage() {
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const projects = clientId ? (PROJECTS[clientId] ?? []) : [];

  function handleExport(format: 'pdf' | 'pptx') {
    if (!projectId) {
      toast.error('Selecione um projeto antes de exportar');
      return;
    }
    toast.success(`Gerando ${format.toUpperCase()}… (integração pendente)`);
  }

  return (
    <>
      <PageHeader
        eyebrow="Relatórios"
        title="Status Report"
        description="Gere e exporte relatórios de status do projeto."
      />
      <main className="flex flex-col gap-6 p-5">
        {/* Inputs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selecionar projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select
                value={clientId}
                onValueChange={(v) => {
                  setClientId(v);
                  setProjectId('');
                }}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  {CLIENTS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={projectId} onValueChange={setProjectId} disabled={!clientId}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Report sections */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resumo Executivo</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full resize-none rounded-md border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                rows={5}
                placeholder="Descreva o status geral do projeto, principais conquistas e próximos passos…"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Riscos & Decisões</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full resize-none rounded-md border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                rows={5}
                placeholder="Liste riscos identificados, impactos, ações de mitigação e responsáveis…"
              />
            </CardContent>
          </Card>
        </div>

        {/* Export buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleExport('pdf')} className="gap-2">
            <FileDown className="size-4" aria-hidden="true" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('pptx')} className="gap-2">
            <FileDown className="size-4" aria-hidden="true" />
            Gerar PowerPoint
          </Button>
        </div>
      </main>
    </>
  );
}
