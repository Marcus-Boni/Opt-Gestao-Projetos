import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ProjectDetailTabDto } from '../../../api/projectsApi';

/** Logo Optsolv extraída do favicon.svg oficial */
function OptsolvLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Logo Optsolv"
      >
        <rect width="32" height="32" rx="6" fill="#f97316" />
        <svg
          x="7"
          y="2.5"
          width="18"
          height="27"
          viewBox="0 0 22 33"
          fill="none"
          role="presentation"
        >
          <path
            d="M20.4456 5.94912L10.1852 0.815186V3.94402L21.1289 9.41962V7.05441C21.1289 6.58606 20.8646 6.1581 20.4456 5.94862V5.94912Z"
            fill="white"
          />
          <path
            d="M14.0962 17.213V15.7062C14.0962 14.9755 13.6647 14.3136 12.9964 14.0189L0.798737 8.63754V11.7664L11.3549 16.0683L11.3589 16.4594L11.3549 16.8504L0.798737 21.1524V24.2812L12.9964 18.8999C13.6647 18.6051 14.0962 17.9432 14.0962 17.2125V17.213Z"
            fill="white"
          />
          <path
            d="M10.1852 32.1041L20.4456 26.9701C20.8641 26.7607 21.1289 26.3327 21.1289 25.8644V23.4991L10.1852 28.9747V32.1041Z"
            fill="white"
          />
          <path
            d="M20.3538 14.368C20.3538 12.7779 19.4421 11.3284 18.0086 10.6401L0.805699 2.37985V5.5087L16.8868 13.1789C17.3322 13.3914 17.6155 13.8408 17.6155 14.3341V18.5857C17.6155 19.079 17.3317 19.5284 16.8868 19.7408L0.805699 27.4111V30.5399L18.0086 22.2796C19.4421 21.5913 20.3538 20.1419 20.3538 18.5518V14.368Z"
            fill="white"
          />
        </svg>
      </svg>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">Optsolv</span>
    </div>
  );
}

function formatDateBr(d: string | null) {
  if (!d) return '—';
  const [year, month, day] = d.split('-');
  return `${day}/${month}/${year}`;
}

type Props = { detail: ProjectDetailTabDto };

export function ReportHeader({ detail }: Props) {
  const now = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="rounded-lg border bg-card p-5">
      {/* Top bar: logo + data de geração */}
      <div className="flex items-start justify-between gap-4">
        <OptsolvLogo />
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Relatório gerado em
          </p>
          <p className="text-sm font-semibold text-foreground">{now}</p>
        </div>
      </div>

      {/* Divider + metadados do projeto */}
      <div className="mt-4 border-t pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Relatório de Projeto
        </p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">{detail.name}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {detail.clientName}
          {detail.scope ? ` · ${detail.scope}` : ''}
          {` · Gestor(a): ${detail.managerName}`}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-[11px] text-muted-foreground">Início</p>
            <p className="font-medium text-foreground">{formatDateBr(detail.startDate)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Término Previsto</p>
            <p className="font-medium text-foreground">{formatDateBr(detail.endDate)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Status</p>
            <p className="font-medium capitalize text-foreground">
              {detail.status.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
