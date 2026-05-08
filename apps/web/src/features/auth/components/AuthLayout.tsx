import { Link } from '@tanstack/react-router';
import { type HTMLMotionProps, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { Button } from '@/shared/components/ui/button';

type AuthLayoutProps = {
  mode: 'login' | 'register';
  children: ReactNode;
};

const bullets = [
  'Acesso seguro com Microsoft Entra ID',
  'Matriz financeira protegida por sessao',
  'Margem, horas e custos em um so lugar',
] as const;

export function AuthLayout({ mode, children }: AuthLayoutProps) {
  const isRegister = mode === 'register';
  const reduceMotion = useReducedMotion();
  const panelMotion: Partial<HTMLMotionProps<'section'>> = reduceMotion
    ? {}
    : {
        initial: { y: 18, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.45, ease: 'easeOut' },
      };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,hsl(var(--primary)/0.16),transparent_28%),linear-gradient(135deg,hsl(var(--accent)/0.72),transparent_44%)]" />
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Button asChild variant="ghost" className="gap-2">
            <Link to="/">
              <ArrowLeft data-icon="inline-start" />
              Voltar
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-5 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <motion.section
          key={`auth-copy-${mode}`}
          {...panelMotion}
          className="hidden lg:flex lg:flex-col lg:gap-8"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-brand-500 shadow-lg shadow-brand-500/20">
              <img
                src="/assets/logo.png"
                alt="Optsolv"
                className="h-7 w-auto brightness-0 invert"
              />
            </span>
            <div>
              <p className="font-display text-lg font-bold">Optsolv PMS</p>
              <p className="text-sm text-muted-foreground">Project Management System</p>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="mb-4 flex w-fit items-center gap-2 rounded-md border bg-card/80 px-3 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
              <Sparkles aria-hidden="true" />
              {isRegister ? 'Solicitacao de acesso' : 'Ambiente protegido'}
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight">
              {isRegister
                ? 'Crie seu acesso para operar com visibilidade.'
                : 'Entre no painel financeiro de projetos.'}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Acompanhe faturamento, margem, horas e custos de projetos com uma experiencia
              organizada para PMO, financeiro e diretoria.
            </p>
          </div>

          <div className="grid max-w-2xl gap-3">
            {bullets.map((bullet) => (
              <div
                key={bullet}
                className="flex items-center gap-3 rounded-lg border bg-card/70 p-4 backdrop-blur"
              >
                <CheckCircle2 className="text-financial-positive" aria-hidden="true" />
                <span className="font-medium">{bullet}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <section className="flex min-h-[calc(100vh-12rem)] items-start justify-center lg:justify-end">
          {children}
        </section>
      </div>
    </main>
  );
}
