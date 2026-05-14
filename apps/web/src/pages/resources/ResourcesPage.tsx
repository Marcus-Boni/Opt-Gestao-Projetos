import { AlertCircle, UserCheck, Users } from 'lucide-react';
import { ResourceCard, useResources } from '@/features/resources';
import { KpiCard } from '@/shared/components/KpiCard';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState, LoadingState } from '@/shared/components/StateViews';

export function ResourcesPage() {
  const query = useResources();

  if (query.isLoading) {
    return (
      <>
        <PageHeader eyebrow="Recursos" title="Gerenciamento de Recursos" />
        <main className="p-5">
          <LoadingState />
        </main>
      </>
    );
  }

  if (query.isError || !query.data) {
    return (
      <>
        <PageHeader eyebrow="Recursos" title="Gerenciamento de Recursos" />
        <main className="p-5">
          <ErrorState
            title="Não foi possível carregar os recursos"
            description="Verifique a API e tente novamente."
            onRetry={() => query.refetch()}
          />
        </main>
      </>
    );
  }

  const { resources, avgUtilization, availableCount, overloadedCount } = query.data;

  return (
    <>
      <PageHeader
        eyebrow="Recursos"
        title="Gerenciamento de Recursos"
        description="Capacidade, alocação e habilidades do time."
      />
      <main className="flex flex-col gap-6 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <KpiCard
            title="Utilização Média"
            value={`${avgUtilization.toFixed(0)}%`}
            icon={Users}
            tone={avgUtilization > 100 ? 'negative' : avgUtilization > 85 ? 'warning' : 'positive'}
          />
          <KpiCard
            title="Disponíveis"
            value={String(availableCount)}
            icon={UserCheck}
            tone="positive"
          />
          <KpiCard
            title="Sobrecarregados"
            value={String(overloadedCount)}
            icon={AlertCircle}
            tone={overloadedCount > 0 ? 'negative' : 'positive'}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </main>
    </>
  );
}
