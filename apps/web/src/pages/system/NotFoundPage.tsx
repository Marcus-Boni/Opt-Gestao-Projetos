import { Link } from '@tanstack/react-router';
import { ArrowLeft, SearchX } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/35 p-5">
      <Card className="w-full max-w-2xl">
        <CardContent className="flex flex-col items-center gap-5 p-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SearchX aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase text-primary">404</p>
            <h1 className="mt-2 font-display text-3xl font-bold">Pagina nao encontrada</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              O endereco acessado nao existe ou foi movido. Volte para o painel ou para a pagina
              inicial.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/app/projetos">
                <ArrowLeft data-icon="inline-start" />
                Ir para projetos
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Pagina inicial</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
