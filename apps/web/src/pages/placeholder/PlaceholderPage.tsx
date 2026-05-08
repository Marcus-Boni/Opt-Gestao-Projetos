import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/StateViews';

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} description="Tela planejada para os proximos ciclos do PMS." />
      <main className="p-5">
        <EmptyState
          title="Modulo planejado"
          description="A estrutura de navegacao ja esta preparada para esta area."
        />
      </main>
    </>
  );
}
