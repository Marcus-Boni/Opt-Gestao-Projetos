import { Link } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import Lenis from 'lenis';
import { ArrowRight, BarChart3, Gauge, LockKeyhole, TableProperties } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const features = [
  {
    title: 'Matriz financeira',
    text: 'Clientes, projetos e meses em uma unica leitura operacional.',
    icon: TableProperties,
  },
  {
    title: 'Margens em foco',
    text: 'Alertas visuais para margem, sobras e estouro de custo Harvest.',
    icon: Gauge,
  },
  {
    title: 'Gestao segura',
    text: 'Base preparada para Microsoft Entra ID e sessoes com better-auth.',
    icon: LockKeyhole,
  },
  {
    title: 'Relato executivo',
    text: 'Indicadores prontos para status semanal e decisao de PMO.',
    icon: BarChart3,
  },
];

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({ duration: 0.9 });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const context = gsap.context(() => {
      gsap.from('[data-hero-item]', {
        y: 18,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
      });
    }, heroRef);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      context.revert();
    };
  }, [reduceMotion]);

  return (
    <main className="min-h-screen bg-background" ref={heroRef}>
      <header className="fixed inset-x-0 top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="Optsolv" className="h-9 w-auto" />
            <span className="font-display font-bold">Optsolv PMS</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link to="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(var(--accent)),transparent_35%),radial-gradient(circle_at_82%_20%,hsl(var(--primary)/0.22),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <p
              data-hero-item
              className="text-sm font-semibold uppercase tracking-wide text-primary"
            >
              Project Management System
            </p>
            <h1
              data-hero-item
              className="font-display text-5xl font-bold tracking-tight lg:text-7xl"
            >
              Optsolv PMS
            </h1>
            <p data-hero-item className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Controle financeiro de projetos com drill-down por cliente, projeto e mes, preparado
              para decisao executiva sem retrabalho de planilhas.
            </p>
            <div data-hero-item className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/login">
                  Entrar com Microsoft
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">Saber mais</a>
              </Button>
            </div>
          </div>

          <motion.div
            data-hero-item
            {...(reduceMotion
              ? {}
              : {
                  initial: { y: 24, opacity: 0 },
                  animate: { y: 0, opacity: 1 },
                  transition: { duration: 0.8, delay: 0.2 },
                })}
            className="rounded-lg border bg-card/80 p-4 shadow-2xl backdrop-blur-md"
          >
            <div className="grid gap-3">
              {['AB Cientifica', 'Acotel', 'Arcelor Mittal', 'Wedo / Comunify'].map(
                (client, index) => (
                  <div
                    key={client}
                    className="grid grid-cols-[1fr_120px_120px] items-center gap-3 rounded-md border bg-background p-3 text-sm"
                  >
                    <span className="font-medium">{client}</span>
                    <span className="text-right font-mono tabular-nums text-financial-positive">
                      R$ {(34 + index * 11).toLocaleString('pt-BR')}k
                    </span>
                    <span className="text-right font-mono tabular-nums text-muted-foreground">
                      {`${(8.4 - index * 1.2).toFixed(1).replace('.', ',')}%`}
                    </span>
                  </div>
                ),
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto grid max-w-7xl gap-4 px-5 py-16 md:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader className="gap-3">
                <Icon className="text-primary" aria-hidden="true" />
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{feature.text}</CardContent>
            </Card>
          );
        })}
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-3">
          {[
            ['30K', 'horas economizadas em controle e reporte'],
            ['3 niveis', 'de drill-down financeiro operacional'],
            ['95+', 'meta de acessibilidade nas telas criticas'],
          ].map(([value, label]) => (
            <div key={value}>
              <p className="font-display text-4xl font-bold text-primary">{value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t px-5 py-6 text-center text-sm text-muted-foreground">
        Optsolv PMS v0.1.0
      </footer>
    </main>
  );
}
