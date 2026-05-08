import { Link } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Gauge,
  LockKeyhole,
  Sparkles,
  TableProperties,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { MarketingFooter } from '@/shared/components/MarketingFooter';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: 'Matriz financeira viva',
    text: 'Clientes, projetos e meses em uma leitura hierarquica para localizar margem, custo e faturamento sem planilhas paralelas.',
    icon: TableProperties,
  },
  {
    title: 'Margem com contexto',
    text: 'Indicadores visuais deixam estouros, sobras e custo Harvest claros para decisao diaria.',
    icon: Gauge,
  },
  {
    title: 'Gestao segura',
    text: 'Entrada preparada para Microsoft Entra ID, sessoes com better-auth e base pronta para trilhas de auditoria.',
    icon: LockKeyhole,
  },
  {
    title: 'Ritual executivo',
    text: 'Resumo operacional para status semanal, PMO, diretores e squads acompanharem a mesma verdade.',
    icon: BarChart3,
  },
];

const workflow = [
  'Importe custos, horas e receitas do periodo',
  'Revise clientes e projetos com drill-down',
  'Encontre desvios antes do fechamento',
  'Compartilhe status executivo com evidencias',
];

const dashboardRows = [
  ['AB Cientifica', 'Portal B2B', 'R$ 348k', '18,4%'],
  ['Acotel', 'Rollout Cloud', 'R$ 226k', '12,9%'],
  ['Arcelor Mittal', 'PMO Integrado', 'R$ 512k', '21,1%'],
  ['Wedo / Comunify', 'Squad Sustentacao', 'R$ 184k', '7,6%'],
];

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({ duration: 0.95, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const context = gsap.context(() => {
      gsap.from('[data-hero-item]', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
      });

      gsap.to('[data-forecast-card]', {
        x: 4,
        y: -6,
        rotate: 0.8,
        duration: 3.1,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      gsap.set('[data-dashboard-card]', {
        transformPerspective: 900,
        transformOrigin: 'center center',
      });

      gsap.to('[data-dashboard-card]', {
        y: -7,
        rotateX: 1.2,
        rotateY: -0.8,
        duration: 3.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      gsap.to('[data-dashboard-row]', {
        x: 4,
        duration: 2.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.18,
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 82%',
          },
        });
      });
    }, pageRef);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      for (const trigger of ScrollTrigger.getAll()) {
        trigger.kill();
      }
      context.revert();
    };
  }, [reduceMotion]);

  return (
    <main ref={pageRef} className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-500 shadow-lg shadow-brand-500/20">
              <img
                src="/assets/logo.png"
                alt="Optsolv"
                className="h-6 w-auto brightness-0 invert"
              />
            </span>
            <span className="font-display font-bold">Optsolv PMS</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#plataforma" className="hover:text-foreground">
              Plataforma
            </a>
            <a href="#fluxo" className="hover:text-foreground">
              Fluxo
            </a>
            <a href="#seguranca" className="hover:text-foreground">
              Seguranca
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link to="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative min-h-[94vh] pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,hsl(var(--primary)/0.18),transparent_28%),linear-gradient(135deg,hsl(var(--accent)/0.72),transparent_42%)]" />
        <div
          className="absolute right-[7%] top-20 z-20 hidden rounded-lg border bg-card/90 px-4 py-3 shadow-xl shadow-primary/10 backdrop-blur md:block xl:right-[9%]"
          data-forecast-card
        >
          <p className="text-xs text-muted-foreground">Margem prevista</p>
          <p className="font-display text-2xl font-bold text-financial-positive">+18,4%</p>
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <div
              data-hero-item
              className="relative w-fit overflow-hidden rounded-full border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary shadow-lg shadow-primary/10 backdrop-blur-md"
            >
              <span className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-primary/20 to-transparent" />
              <span className="relative flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                  <Sparkles aria-hidden="true" className="size-3.5" />
                </span>
                PMS para operacao financeira de projetos
              </span>
            </div>
            <h1
              data-hero-item
              className="max-w-3xl font-display text-5xl font-bold tracking-tight lg:text-7xl"
            >
              Optsolv PMS
            </h1>
            <p data-hero-item className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Um cockpit de margem, custos e horas para transformar fechamento de projetos em
              acompanhamento continuo, com velocidade de produto e precisao de PMO.
            </p>
            <div data-hero-item className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/login">
                  Entrar com Microsoft
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#plataforma">Ver plataforma</a>
              </Button>
            </div>
            <div data-hero-item className="grid max-w-xl gap-3 pt-4 sm:grid-cols-3">
              {[
                ['3 niveis', 'cliente, projeto e mes'],
                ['1 visao', 'PMO e diretoria alinhados'],
                ['0 planilha', 'menos retrabalho manual'],
              ].map(([value, label]) => (
                <div key={value} className="rounded-lg border bg-card/70 p-3 backdrop-blur">
                  <p className="font-display text-xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            {...(reduceMotion
              ? {}
              : {
                  initial: { y: 28, opacity: 0, scale: 0.98 },
                  animate: { y: 0, opacity: 1, scale: 1 },
                  transition: { duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] },
                })}
            className="relative lg:mt-6"
          >
            <div className="absolute -inset-3 rounded-xl bg-primary/10 blur-2xl" />
            <div
              data-dashboard-card
              className="relative rounded-lg border bg-card/90 p-4 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Matriz de Projetos</p>
                  <p className="text-xs text-muted-foreground">Maio 2026</p>
                </div>
                <Badge>Tempo real</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['Faturamento', 'R$ 1,27M', 'text-foreground'],
                  ['Margem', 'R$ 284k', 'text-financial-positive'],
                  ['Horas', '3.482h', 'text-foreground'],
                ].map(([label, value, className]) => (
                  <div key={label} className="rounded-md border bg-background p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`font-mono text-lg font-semibold ${className}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 overflow-hidden rounded-md border">
                {dashboardRows.map(([client, project, revenue, margin]) => (
                  <div
                    key={client}
                    data-dashboard-row
                    className="grid grid-cols-[1fr_1fr_110px_80px] items-center gap-3 border-b bg-background/80 p-3 text-sm last:border-b-0"
                  >
                    <span className="truncate font-medium">{client}</span>
                    <span className="truncate text-muted-foreground">{project}</span>
                    <span className="text-right font-mono tabular-nums">{revenue}</span>
                    <span className="text-right font-mono tabular-nums text-financial-positive">
                      {margin}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="plataforma"
        className="mx-auto grid max-w-7xl gap-4 px-5 py-16 md:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} data-reveal className="bg-card/80 backdrop-blur">
              <CardHeader className="gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icon aria-hidden="true" />
                </span>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {feature.text}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section id="fluxo" className="border-y bg-muted/35">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div data-reveal>
            <p className="mb-3 text-sm font-semibold uppercase text-primary">Fluxo operacional</p>
            <h2 className="font-display text-3xl font-bold lg:text-5xl">
              Do fechamento tardio para controle continuo.
            </h2>
            <p className="mt-4 text-muted-foreground">
              O sistema organiza os mesmos dados que lideres ja acompanham, mas transforma o
              processo em uma rotina curta, visual e auditavel.
            </p>
          </div>
          <div className="grid gap-3">
            {workflow.map((item, index) => (
              <motion.div
                key={item}
                data-reveal
                {...(reduceMotion ? {} : { whileHover: { x: 6 } })}
                className="flex items-center gap-4 rounded-lg border bg-card p-4"
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="font-medium">{item}</span>
                <CheckCircle2 className="ml-auto text-financial-positive" aria-hidden="true" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="seguranca" className="mx-auto grid max-w-7xl gap-6 px-5 py-16 lg:grid-cols-3">
        <Card data-reveal className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users aria-hidden="true" />
              Experiencia para PMO, financeiro e diretoria
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
            {['Busca global por projeto', 'Filtros por periodo', 'Drill-down por cliente'].map(
              (item) => (
                <div key={item} className="rounded-md border bg-background p-3">
                  {item}
                </div>
              ),
            )}
          </CardContent>
        </Card>
        <Card data-reveal>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp aria-hidden="true" />
              Menos atrito
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Layout responsivo, tema escuro com contraste correto, componentes shadcn e animacoes
            discretas para orientar, nao distrair.
          </CardContent>
        </Card>
      </section>

      <section className="px-5 pb-16">
        <div
          data-reveal
          className="mx-auto flex max-w-7xl flex-col gap-5 rounded-lg border bg-primary p-8 text-primary-foreground shadow-2xl shadow-primary/20 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-sm font-semibold uppercase opacity-80">Pronto para operar?</p>
            <h2 className="font-display text-3xl font-bold">
              Acesse o painel e acompanhe seus projetos.
            </h2>
          </div>
          <Button asChild variant="secondary" size="lg">
            <Link to="/login">
              Entrar agora
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
