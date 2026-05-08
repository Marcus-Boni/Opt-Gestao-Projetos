import { Link } from '@tanstack/react-router';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

export function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/35 p-5">
      <Card className="w-full max-w-2xl">
        <CardContent className="flex flex-col items-center gap-5 p-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
            <LockKeyhole aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase text-destructive">Sem permissao</p>
            <h1 className="mt-2 font-display text-3xl font-bold">Acesso nao autorizado</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sua conta nao possui permissao para acessar este recurso. Entre com uma conta
              autorizada ou solicite liberacao ao administrador.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/login">Trocar conta</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Voltar ao inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
