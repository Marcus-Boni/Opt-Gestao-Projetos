import { Link } from '@tanstack/react-router';
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Gauge,
  Globe,
  LockKeyhole,
  Sparkles,
  TableProperties,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MarketingFooter } from '@/shared/components/MarketingFooter';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

// ─── data ───────────────────────────────────────────────────────────────────

const features = [
  {
    title: 'Matriz financeira viva',
    text: 'Cliente → Projeto → Ano/Mês em drill-down. Margem, custo Harvest e faturamento sem uma planilha paralela.',
    icon: TableProperties,
    accent: 'from-orange-500/20 to-orange-500/5',
  },
  {
    title: 'Margem com contexto',
    text: 'Código de cores semântico (verde/âmbar/vermelho) mostra desvios antes do fechamento. Decisão em segundos.',
    icon: Gauge,
    accent: 'from-emerald-500/20 to-emerald-500/5',
  },
  {
    title: 'Segurança enterprise',
    text: 'Microsoft Entra ID como provider preferencial. Sessões gerenciadas com better-auth e auditoria completa.',
    icon: LockKeyhole,
    accent: 'from-blue-500/20 to-blue-500/5',
  },
  {
    title: 'Ritual executivo',
    text: 'PMO, diretoria e squads acompanham a mesma fonte de verdade. Status semanal sem exportar nada.',
    icon: BarChart3,
    accent: 'from-purple-500/20 to-purple-500/5',
  },
  {
    title: 'Velocidade de produto',
    text: 'Filtros de ano/mês, busca global ⌘K, atalhos de teclado e skeletons fiéis ao layout final.',
    icon: Zap,
    accent: 'from-yellow-500/20 to-yellow-500/5',
  },
  {
    title: 'Integração Harvest',
    text: 'Custo de horas apontadas no Harvest sincronizado automaticamente. Sem retrabalho de importação manual.',
    icon: Clock,
    accent: 'from-rose-500/20 to-rose-500/5',
  },
];

const workflow = [
  {
    step: '01',
    title: 'Importe os dados do período',
    text: 'Receitas, despesas, comissões, impostos e horas do Harvest entram automaticamente via integração.',
    icon: Globe,
  },
  {
    step: '02',
    title: 'Revise clientes e projetos',
    text: 'Expanda qualquer cliente na matriz e veja projeto a projeto, mês a mês, com drill-down completo.',
    icon: TableProperties,
  },
  {
    step: '03',
    title: 'Encontre desvios antes do fechamento',
    text: 'Margens negativas e sobras críticas ficam vermelhas. Você age antes, não depois do relatório.',
    icon: TrendingUp,
  },
];

const stats = [
  { end: 30, prefix: '', suffix: 'K', label: 'horas registradas' },
  { end: 47, prefix: '', suffix: '', label: 'projetos ativos' },
  { end: 18, prefix: '', suffix: '%', label: 'margem média mantida' },
  { end: 284, prefix: 'R$ ', suffix: 'K', label: 'faturamento sob controle' },
];

const dashboardRows = [
  {
    client: 'AB Científica',
    project: 'Portal B2B',
    revenue: 'R$ 348k',
    margin: '+18,4%',
    ok: true,
  },
  { client: 'Açotel', project: 'Rollout Cloud', revenue: 'R$ 226k', margin: '+12,9%', ok: true },
  {
    client: 'Arcelor Mittal',
    project: 'PMO Integrado',
    revenue: 'R$ 512k',
    margin: '+21,1%',
    ok: true,
  },
  {
    client: 'Wedo / Comunify',
    project: 'Squad Sustentação',
    revenue: 'R$ 184k',
    margin: '+7,6%',
    ok: false,
  },
];

// ─── AnimatedNumber ──────────────────────────────────────────────────────────

function AnimatedNumber({
  end,
  prefix = '',
  suffix = '',
}: {
  end: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px 0px' });
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (v) => `${prefix}${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!isInView) return;
    const ctrl = animate(motionValue, end, { duration: 1.5, ease: [0, 0, 0.2, 1] });
    return () => ctrl.stop();
  }, [isInView, end, motionValue]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

// ─── LandingPage ─────────────────────────────────────────────────────────────

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({ duration: 0.95, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const ctx = gsap.context(() => {
      // Hero stagger
      gsap.from('[data-hero]', {
        y: 28,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.09,
      });

      // Floating cards
      gsap.to('[data-float-a]', {
        y: -10,
        rotate: 1,
        duration: 3.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to('[data-float-b]', {
        y: 8,
        rotate: -0.8,
        duration: 3.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 0.6,
      });
      gsap.to('[data-float-c]', {
        y: -6,
        x: 4,
        duration: 4.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1.2,
      });

      // Dashboard card tilt
      gsap.set('[data-dashboard]', { transformPerspective: 900, transformOrigin: 'center center' });
      gsap.to('[data-dashboard]', {
        y: -8,
        rotateX: 1.5,
        rotateY: -1,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // Table rows wave
      gsap.to('[data-row]', {
        x: 5,
        duration: 2.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.2,
      });

      // Scroll reveals
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 32,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 84%' },
        });
      });

      // Feature cards stagger
      gsap.from('[data-feature-card]', {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '[data-features]', start: 'top 78%' },
      });
    }, pageRef);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      for (const t of ScrollTrigger.getAll()) t.kill();
      ctx.revert();
    };
  }, [reduceMotion]);

  return (
    <main ref={pageRef} className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-secondary/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
              <img
                src="/assets/logo.png"
                alt="Optsolv"
                className="h-6 w-auto brightness-0 invert"
              />
            </span>
            <span className="font-display font-bold text-white">Optsolv PMS</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm text-white/60 md:flex">
            {[
              ['#plataforma', 'Plataforma'],
              ['#fluxo', 'Fluxo'],
              ['#seguranca', 'Segurança'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="transition-colors hover:text-white">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" variant="secondary" className="hidden md:inline-flex">
              <Link to="/login">
                Entrar
                <ChevronRight className="size-3.5" />
              </Link>
            </Button>
            {/* Mobile hamburger */}
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-md text-white/70 hover:text-white md:hidden"
              onClick={() => setNavOpen((v) => !v)}
              aria-label="Menu"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="size-5"
                aria-hidden="true"
              >
                {navOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {navOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/10 bg-secondary/95 md:hidden"
            >
              <div className="flex flex-col gap-1 p-3">
                {[
                  ['#plataforma', 'Plataforma'],
                  ['#fluxo', 'Fluxo'],
                  ['#seguranca', 'Segurança'],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setNavOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    {label}
                  </a>
                ))}
                <Button asChild className="mt-2">
                  <Link to="/login">Entrar</Link>
                </Button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100vh] overflow-hidden bg-secondary pt-24 text-secondary-foreground">
        {/* Background mesh */}
        <div className="pointer-events-none absolute inset-0">
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          {/* Orange orb */}
          <div className="absolute -left-48 -top-48 h-[700px] w-[700px] rounded-full bg-primary/25 blur-[140px]" />
          {/* Blue orb */}
          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-info/12 blur-[120px]" />
          {/* Subtle accent top right */}
          <div className="absolute right-1/4 top-24 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
        </div>

        {/* Floating accent cards */}
        <div
          data-float-a
          className="absolute right-[5%] top-28 z-20 hidden rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-2xl backdrop-blur-md xl:block"
        >
          <p className="text-xs text-white/50">Margem prevista</p>
          <p className="font-display text-2xl font-bold text-financial-positive">+18,4%</p>
        </div>

        <div
          data-float-b
          className="absolute bottom-32 right-[3%] z-20 hidden rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-xl backdrop-blur-md xl:block"
        >
          <p className="text-xs text-white/50">Horas registradas</p>
          <p className="font-display text-xl font-bold text-white">3.482 h</p>
        </div>

        <div
          data-float-c
          className="absolute bottom-52 left-[26%] z-20 hidden rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 shadow-lg backdrop-blur-md lg:block xl:left-[38%]"
        >
          <p className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
            <span className="size-2 rounded-full bg-amber-400" />3 alertas ativos
          </p>
        </div>

        {/* Content */}
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          {/* Left: text */}
          <div className="flex flex-col gap-7">
            <div
              data-hero
              className="relative w-fit overflow-hidden rounded-full border border-primary/30 bg-primary/15 px-3.5 py-2 text-sm font-semibold text-primary backdrop-blur"
            >
              <span className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-primary/30 to-transparent" />
              <span className="relative flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  <Sparkles className="size-3" aria-hidden="true" />
                </span>
                PMO e financeiro em uma única plataforma
              </span>
            </div>

            <h1
              data-hero
              className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white lg:text-[4rem] xl:text-[4.5rem]"
            >
              Projetos com{' '}
              <span className="bg-gradient-to-r from-primary via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                clareza financeira
              </span>
              .
            </h1>

            <p data-hero className="max-w-xl text-lg leading-relaxed text-white/60">
              Um cockpit de margem, custos e horas para transformar fechamento tardio em
              acompanhamento contínuo — com velocidade de produto e precisão de PMO.
            </p>

            <div data-hero className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-lg shadow-primary/30">
                <Link to="/login">
                  Entrar com Microsoft
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <a href="#plataforma">Conhecer plataforma</a>
              </Button>
            </div>

            {/* Stat chips */}
            <div data-hero className="grid max-w-lg grid-cols-3 gap-3">
              {[
                ['3 níveis', 'cliente, projeto e mês'],
                ['1 visão', 'PMO e diretoria alinhados'],
                ['0 planilha', 'menos retrabalho manual'],
              ].map(([value, label]) => (
                <div
                  key={value}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur"
                >
                  <p className="font-display text-base font-bold text-white">{value}</p>
                  <p className="text-[11px] text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: product mockup */}
          <motion.div
            {...(reduceMotion
              ? {}
              : {
                  initial: { y: 32, opacity: 0, scale: 0.97 },
                  animate: { y: 0, opacity: 1, scale: 1 },
                  transition: { duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
                })}
            className="relative mt-4 lg:mt-0"
          >
            <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-3xl" />

            <div
              data-dashboard
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
              {/* Window chrome */}
              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    {['bg-red-400/70', 'bg-amber-400/70', 'bg-emerald-400/70'].map((c) => (
                      <span key={c} className={`size-2.5 rounded-full ${c}`} />
                    ))}
                  </div>
                  <span className="ml-2 font-display text-xs font-semibold text-white/70">
                    Matriz de Projetos — Maio 2026
                  </span>
                </div>
                <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px]">
                  Tempo real
                </Badge>
              </div>

              {/* KPI strip */}
              <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10 bg-white/3">
                {[
                  ['Faturamento', 'R$ 1,27M', 'text-white'],
                  ['Margem', 'R$ 284k', 'text-financial-positive'],
                  ['Horas', '3.482h', 'text-white'],
                ].map(([lbl, val, cls]) => (
                  <div key={lbl} className="px-4 py-3">
                    <p className="text-[10px] text-white/40">{lbl}</p>
                    <p className={`font-mono text-base font-semibold tabular-nums ${cls}`}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Table rows */}
              <div>
                <div className="grid grid-cols-[1fr_1fr_100px_72px] gap-2 border-b border-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  <span>Cliente</span>
                  <span>Projeto</span>
                  <span className="text-right">Faturamento</span>
                  <span className="text-right">Margem</span>
                </div>
                {dashboardRows.map(({ client, project, revenue, margin, ok }) => (
                  <div
                    key={client}
                    data-row
                    className="grid grid-cols-[1fr_1fr_100px_72px] items-center gap-2 border-b border-white/5 px-4 py-2.5 text-sm last:border-b-0 hover:bg-white/5"
                  >
                    <span className="truncate font-medium text-white/90">{client}</span>
                    <span className="truncate text-white/50 text-xs">{project}</span>
                    <span className="text-right font-mono tabular-nums text-white/70 text-xs">
                      {revenue}
                    </span>
                    <span
                      className={`text-right font-mono tabular-nums text-xs font-semibold ${ok ? 'text-financial-positive' : 'text-financial-warning'}`}
                    >
                      {margin}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y md:grid-cols-4 md:divide-y-0">
          {stats.map(({ end, prefix, suffix, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-8 py-10 text-center">
              <p className="font-display text-4xl font-bold tabular-nums lg:text-5xl">
                <AnimatedNumber end={end} prefix={prefix} suffix={suffix} />
              </p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="plataforma" className="py-24" data-features>
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto mb-14 max-w-2xl text-center" data-reveal>
            <Badge className="mb-4">Plataforma</Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight lg:text-5xl">
              Tudo o que uma operação de projetos precisa
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Da integração com Harvest ao drill-down financeiro — projetado para PMOs que não
              toleram lentidão.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  data-feature-card
                  {...(reduceMotion
                    ? {}
                    : { whileHover: { y: -4, transition: { duration: 0.2 } } })}
                  className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/10 hover:border-primary/30"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${feat.accent}`}
                  />
                  <div className="relative">
                    <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-5 text-foreground/70" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 font-display text-base font-semibold">{feat.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feat.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Workflow ───────────────────────────────────────────────────────── */}
      <section id="fluxo" className="bg-muted/40 py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto mb-14 max-w-2xl text-center" data-reveal>
            <Badge variant="outline" className="mb-4">
              Fluxo operacional
            </Badge>
            <h2 className="font-display text-4xl font-bold tracking-tight lg:text-5xl">
              Do fechamento tardio para controle contínuo
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Três passos que transformam o ritual de PMO em uma rotina curta e auditável.
            </p>
          </div>

          <div className="relative grid gap-8 lg:grid-cols-3">
            {/* Connection lines (desktop only) */}
            <div className="absolute left-1/3 right-1/3 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
            <div className="absolute left-2/3 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />

            {workflow.map(({ step, title, text, icon: Icon }, i) => (
              <motion.div
                key={step}
                data-reveal
                {...(reduceMotion
                  ? {}
                  : { whileHover: { scale: 1.02, transition: { duration: 0.18 } } })}
                className="relative flex flex-col gap-5 rounded-xl border bg-card p-7 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/30">
                    {i + 1}
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                    <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-financial-positive">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Auditável e rastreável
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust / Security ───────────────────────────────────────────────── */}
      <section id="seguranca" className="py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div data-reveal>
              <Badge variant="outline" className="mb-4">
                Segurança
              </Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
                Segurança enterprise, experiência de produto
              </h2>
              <p className="mt-4 text-muted-foreground">
                Autenticação via Microsoft Entra ID como padrão. Login rápido com a conta
                corporativa, sem precisar lembrar mais uma senha.
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {[
                  'Login com Microsoft Entra ID (OAuth2/OIDC)',
                  'Sessões com renovação automática (better-auth)',
                  'Trilhas de auditoria para compliance',
                  'Permissões granulares por perfil',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2
                      className="size-4 shrink-0 text-financial-positive"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2" data-reveal>
              {[
                {
                  icon: LockKeyhole,
                  title: 'Autenticação segura',
                  text: 'Microsoft Entra ID como provider principal. OIDC/OAuth2 com PKCE.',
                },
                {
                  icon: Users,
                  title: 'Controle de acesso',
                  text: 'Perfis PMO, financeiro e diretoria com visibilidades distintas.',
                },
                {
                  icon: Globe,
                  title: 'Isolamento de dados',
                  text: 'Cada organização opera em namespace isolado. LGPD by design.',
                },
                {
                  icon: Zap,
                  title: 'Performance garantida',
                  text: 'Virtual scroll para matrizes com 500+ linhas. Sem travamento.',
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="px-5 pb-24">
        <div
          data-reveal
          className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-primary p-10 text-primary-foreground shadow-2xl shadow-primary/25 md:p-14"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_-20%,hsl(var(--primary-foreground)/0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_120%,hsl(0_0%_0%/0.15),transparent_50%)]" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
                Pronto para operar?
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold lg:text-4xl">
                Acesse o painel e acompanhe seus projetos.
              </h2>
              <p className="mt-3 text-sm opacity-70">
                Microsoft Entra ID disponível. Configuração em minutos.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="secondary" size="lg" className="shadow-lg">
                <Link to="/login">
                  Entrar agora
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
