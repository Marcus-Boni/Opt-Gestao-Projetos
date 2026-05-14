import { cn } from '@/shared/lib/utils';
import type { ProjectDetailTabDto } from '../../api/projectsApi';

type Props = { detail: ProjectDetailTabDto };

export function ResourcesTab({ detail }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            {['Recurso', 'Cargo', 'Horas Prev.', 'Horas Real.', 'Utilização'].map((h) => (
              <th
                key={h}
                className={cn(
                  'h-9 px-4 text-xs font-semibold text-muted-foreground',
                  h === 'Recurso' || h === 'Cargo' ? 'text-left' : 'text-right',
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {detail.team.map((member) => {
            const util =
              member.hoursPlanned > 0 ? (member.hoursActual / member.hoursPlanned) * 100 : 0;
            return (
              <tr key={member.name} className="border-b last:border-b-0">
                <td className="px-4 py-2.5 font-medium">{member.name}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{member.role}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{member.hoursPlanned}h</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{member.hoursActual}h</td>
                <td className="px-4 py-2.5 text-right">
                  <span
                    className={cn(
                      'text-xs font-semibold tabular-nums',
                      util > 100
                        ? 'text-health-critical'
                        : util > 85
                          ? 'text-health-alert'
                          : 'text-health-ok',
                    )}
                  >
                    {util.toFixed(0)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
