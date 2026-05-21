import { FileDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import type { ProjectDetailTabDto } from '../../api/projectsApi';
import { AchievementsSection } from './report/AchievementsSection';
import { EditableSection } from './report/EditableSection';
import { KpiGrid } from './report/KpiGrid';
import { ReportHeader } from './report/ReportHeader';

type Props = { detail: ProjectDetailTabDto };

export function ReportTab({ detail }: Props) {
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [risksDecisions, setRisksDecisions] = useState('');

  function handleExportPDF() {
    window.print();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Relatório do Projeto</p>
          <p className="text-xs text-muted-foreground">
            Preencha as seções editáveis e exporte para PDF.
          </p>
        </div>
        <Button
          id="report-export-btn"
          onClick={handleExportPDF}
          className="gap-2"
          aria-label="Exportar relatório em PDF"
        >
          <FileDown className="size-4" aria-hidden="true" />
          Exportar PDF
        </Button>
      </div>

      {/* Conteúdo do relatório — alvo do @media print */}
      <div id="report-print-area" className="flex flex-col gap-5">
        {/* 1. Cabeçalho com logo */}
        <ReportHeader detail={detail} />

        {/* 2. KPIs */}
        <section aria-label="Indicadores do projeto">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Indicadores
          </p>
          <KpiGrid detail={detail} />
        </section>

        <Separator />

        {/* 3. Sumário Executivo */}
        <EditableSection
          title="Sumário Executivo"
          value={executiveSummary}
          onChange={setExecutiveSummary}
          placeholder="Descreva os principais pontos do projeto: status atual, alinhamento com objetivos estratégicos, destaques do período…"
        />

        {/* 4. Conquistas */}
        <AchievementsSection />

        {/* 5. Riscos e Decisões */}
        <EditableSection
          title="Riscos e Decisões"
          value={risksDecisions}
          onChange={setRisksDecisions}
          placeholder="Liste os riscos identificados, decisões tomadas e seus impactos no projeto…"
        />
      </div>
    </div>
  );
}
