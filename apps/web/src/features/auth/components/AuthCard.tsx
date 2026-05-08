import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { authClient } from '@/shared/lib/auth-client';

const authSchema = z.object({
  email: z.email('Informe um e-mail valido'),
  password: z.string().min(8, 'Use no minimo 8 caracteres'),
});

type AuthForm = z.infer<typeof authSchema>;

type AuthCardProps = {
  mode: 'login' | 'register';
};

export function AuthCard({ mode }: AuthCardProps) {
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
          callbackURL: '/app/projetos',
        })
      : await authClient.signIn.email({
          email: values.email,
          password: values.password,
          callbackURL: '/app/projetos',
        });

    if (result.error) {
      toast.error(result.error.message ?? 'Nao foi possivel autenticar');
      return;
    }

    toast.success(isRegister ? 'Conta criada. Verifique seu e-mail.' : 'Login realizado');
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <img src="/assets/logo.png" alt="Optsolv" className="h-11 w-fit" />
        <CardTitle className="font-display text-2xl">
          {isRegister ? 'Criar acesso' : 'Entrar no PMS'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          size="lg"
          onClick={() =>
            authClient.signIn.social({
              provider: 'microsoft',
              callbackURL: `${window.location.origin}/app/projetos`,
            })
          }
        >
          Entrar com sua conta Microsoft
        </Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          ou
          <Separator className="flex-1" />
        </div>
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <label className="flex flex-col gap-1 text-sm font-medium">
            E-mail
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register('email')}
            />
            {form.formState.errors.email ? (
              <span className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </span>
            ) : null}
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Senha
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              aria-invalid={Boolean(form.formState.errors.password)}
              {...form.register('password')}
            />
            {form.formState.errors.password ? (
              <span className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </span>
            ) : null}
          </label>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {isRegister ? 'Registrar' : 'Entrar'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {isRegister ? 'Ja tem conta?' : 'Ainda nao tem acesso?'}{' '}
          <Link to={isRegister ? '/login' : '/register'} className="text-primary hover:underline">
            {isRegister ? 'Entrar' : 'Criar conta'}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
