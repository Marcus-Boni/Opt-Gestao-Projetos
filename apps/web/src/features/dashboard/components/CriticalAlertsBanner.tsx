import { AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { CriticalAlertDto } from '../api/dashboardApi';

type Props = { alerts: CriticalAlertDto[] };

export function CriticalAlertsBanner({ alerts }: Props) {
  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => {
        const isCritical = alert.severity === 'critical';
        return (
          <div
            key={alert.projectId}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3',
              isCritical
                ? 'border-health-critical/30 bg-health-critical/10'
                : 'border-health-alert/30 bg-health-alert/10',
            )}
          >
            {isCritical ? (
              <XCircle className="mt-0.5 size-4 shrink-0 text-health-critical" aria-hidden="true" />
            ) : (
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0 text-health-alert"
                aria-hidden="true"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">
                {alert.clientName} — {alert.projectName}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{alert.reason}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
