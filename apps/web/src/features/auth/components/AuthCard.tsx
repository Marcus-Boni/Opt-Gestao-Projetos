import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { type HTMLMotionProps, motion, useReducedMotion } from 'framer-motion';
import { Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Separator } from '@/shared/components/ui/separator';
import { authClient } from '@/shared/lib/auth-client';
import { getPostLoginRedirect } from '@/shared/lib/auth-guards';
import { MicrosoftLogo } from './MicrosoftLogo';

const authSchema = z.object({
  email: z.email('Informe um e-mail valido'),
  password: z.string().min(8, 'Use no minimo 8 caracteres'),
});

type AuthForm = z.infer<typeof authSchema>;

type AuthCardProps = {
  mode: 'login' | 'register';
};

export function AuthCard({ mode }: AuthCardProps) {
  const navigate = useNavigate();
  const search = useRouterState({ select: (state) => state.location.searchStr });
  const postLoginRedirect = getPostLoginRedirect(search);
  const reduceMotion = useReducedMotion();
  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' },
  });

  const isRegister = mode === 'register';
  const isSubmitting = form.formState.isSubmitting;

  const submit = form.handleSubmit(async (values) => {
    const result = isRegister
      ? await authClient.signUp.email({
          email: values.email,
          password: values.password,
          name: values.email.split('@')[0] ?? values.email,
          callbackURL: postLoginRedirect,
        })
      : await authClient.signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: postLoginRedirect,
        });

    if (result.error) {
      toast.error(result.error.message ?? 'Nao foi possivel autenticar');
      return;
    }

    toast.success(isRegister ? 'Conta criada. Verifique seu e-mail.' : 'Login realizado');
    if (!isRegister) navigate({ to: postLoginRedirect, replace: true });
  });

  const cardMotion: Partial<HTMLMotionProps<'div'>> = reduceMotion
    ? {}
    : {
        initial: { y: 18, opacity: 0, scale: 0.98 },
        animate: { y: 0, opacity: 1, scale: 1 },
        transition: { duration: 0.38, ease: 'easeOut' },
      };

  return (
    <motion.div key={mode} {...cardMotion} className="w-full max-w-md">
      <Card className="w-full max-w-md border bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur">
        <CardHeader className="gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-500 shadow-lg shadow-brand-500/20">
                <img
                  src="/assets/logo.png"
                  alt="Optsolv"
                  className="h-6 w-auto brightness-0 invert"
                />
              </span>
              <div>
                <p className="font-display text-sm font-bold">Optsolv PMS</p>
                <p className="text-xs text-muted-foreground">Acesso seguro</p>
              </div>
            </div>
            <span className="flex size-9 items-center justify-center rounded-md border bg-background text-primary">
              <ShieldCheck aria-hidden="true" />
            </span>
          </div>
          <div>
            <CardTitle className="font-display text-2xl">
              {isRegister ? 'Criar acesso' : 'Entrar no PMS'}
            </CardTitle>
            <CardDescription className="mt-2 leading-6">
              {isRegister
                ? 'Cadastre uma conta para solicitar acesso ao acompanhamento financeiro dos projetos.'
                : 'Use sua conta corporativa para acessar projetos, margens, horas e custos com seguranca.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-11 justify-center bg-background"
            onClick={() =>
              authClient.signIn.social({
                provider: 'microsoft',
                callbackURL: `${window.location.origin}${postLoginRedirect}`,
              })
            }
          >
            <MicrosoftLogo />
            Entrar com sua conta Microsoft
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1" />
            ou continue com e-mail
            <Separator className="flex-1" />
          </div>
          <form className="flex flex-col gap-4" onSubmit={submit}>
            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="auth-email">
              E-mail
              <div className="relative">
                <Mail
                  className="-translate-y-1/2 absolute left-3 top-1/2 text-muted-foreground pr-1"
                  aria-hidden="true"
                />
                <Input
                  id="auth-email"
                  className="pl-9"
                  type="email"
                  autoComplete="email"
                  placeholder="nome@empresa.com"
                  aria-invalid={Boolean(form.formState.errors.email)}
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email ? (
                <span className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </span>
              ) : null}
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="auth-password">
              Senha
              <Input
                id="auth-password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder={isRegister ? 'Minimo de 8 caracteres' : 'Sua senha'}
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register('password')}
              />
              {form.formState.errors.password ? (
                <span className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </span>
              ) : null}
            </label>
            <Button type="submit" disabled={isSubmitting} className="h-11">
              {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {isRegister ? 'Criar acesso com e-mail' : 'Entrar com e-mail'}
            </Button>
          </form>
          <div className="rounded-md border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
            {isRegister
              ? 'Depois do cadastro, valide seu e-mail antes de acessar dados operacionais.'
              : 'Ao entrar, sua sessao sera validada tambem no servidor antes de carregar os projetos.'}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? 'Ja tem conta?' : 'Ainda nao tem acesso?'}{' '}
            <Link to={isRegister ? '/login' : '/register'} className="text-primary hover:underline">
              {isRegister ? 'Entrar' : 'Criar conta'}
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
