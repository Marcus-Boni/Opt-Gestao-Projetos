import { Link } from '@tanstack/react-router';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const footerLinks = [
  { href: '#plataforma', label: 'Plataforma' },
  { href: '#fluxo', label: 'Fluxo' },
  { href: '#seguranca', label: 'Seguranca' },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t bg-background px-5">
      <div className="mx-auto grid max-w-7xl gap-8 py-10 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div className="flex max-w-xl flex-col gap-4">
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
          <p className="text-sm leading-6 text-muted-foreground">
            Plataforma para visibilidade financeira de projetos, controle de margem e rotina
            executiva com foco em seguranca e usabilidade.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck aria-hidden="true" />
            <span>Sessao protegida, dados server-side e acesso autenticado.</span>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Produto</p>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            {footerLinks.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Acesso</p>
          <Button asChild className="w-fit">
            <Link to="/login">
              Entrar no PMS
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t py-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>© 2026 Optsolv. Todos os direitos reservados.</span>
        <span>Project Management System</span>
      </div>
    </footer>
  );
}
