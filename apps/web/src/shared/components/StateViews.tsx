import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function LoadingState() {
  const rows = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6', 'row-7', 'row-8'];

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <Skeleton key={row} className="h-10 w-full rounded-md" />
      ))}
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-5">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-4">
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-8 w-44" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-11 w-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-px flex-1" />
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </main>
  );
}

export function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:block">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <Skeleton className="size-9 rounded-lg" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {['nav-1', 'nav-2', 'nav-3', 'nav-4'].map((item) => (
            <Skeleton key={item} className="h-9 w-full rounded-md" />
          ))}
        </div>
      </aside>
      <div className="lg:pl-64">
        <div className="flex h-16 items-center justify-between border-b bg-background px-4">
          <Skeleton className="h-10 w-40" />
          <div className="flex gap-2">
            <Skeleton className="size-10 rounded-md" />
            <Skeleton className="size-10 rounded-full" />
          </div>
        </div>
        <ProjectsPageSkeleton />
      </div>
    </div>
  );
}

export function ProjectsPageSkeleton() {
  return (
    <>
      <header className="flex flex-col gap-4 border-b bg-background px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-28" />
      </header>
      <main className="flex flex-col gap-4 p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {['kpi-1', 'kpi-2', 'kpi-3', 'kpi-4'].map((item) => (
            <Card key={item}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="size-10 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="flex flex-col gap-3 p-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-52" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-44" />
            </div>
            <Skeleton className="h-10 w-80 max-w-full" />
          </CardContent>
        </Card>
        <ProjectsMatrixSkeleton />
      </main>
    </>
  );
}

export function ProjectsMatrixSkeleton() {
  const rows = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6'];

  return (
    <Card className="overflow-hidden">
      <div className="overflow-auto">
        <table className="w-full min-w-[1320px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-64" />
            <col className="w-32" />
            <col className="w-32" />
            {['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'].map((column) => (
              <col key={column} className="w-28" />
            ))}
          </colgroup>
          <thead className="bg-background">
            <tr>
              {['Cliente', 'Inicio', 'Fim', 'Faturamento', 'Despesas', 'Comissoes'].map(
                (header) => (
                  <th key={header} className="h-10 border-b px-3 text-left">
                    <Skeleton className="h-3 w-20" />
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="h-11 border-b">
                <td className="px-3">
                  <Skeleton className="h-4 w-48" />
                </td>
                <td className="px-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-3">
                  <Skeleton className="h-4 w-20" />
                </td>
                {['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10'].map((cell) => (
                  <td key={`${row}-${cell}`} className="px-3">
                    <Skeleton className="ml-auto h-4 w-20" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <>
      <header className="border-b bg-background px-5 py-4">
        <Skeleton className="mb-2 h-3 w-40" />
        <Skeleton className="mb-2 h-8 w-72" />
        <Skeleton className="h-4 w-48" />
      </header>
      <main className="flex flex-col gap-4 p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {['detail-kpi-1', 'detail-kpi-2', 'detail-kpi-3', 'detail-kpi-4'].map((item) => (
            <Skeleton key={item} className="h-32 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </main>
    </>
  );
}

type StateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
};

export function ErrorState({ title, description, onRetry }: StateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center">
        <AlertCircle className="text-destructive" aria-hidden="true" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, description }: StateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center">
        <Inbox className="text-muted-foreground" aria-hidden="true" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
