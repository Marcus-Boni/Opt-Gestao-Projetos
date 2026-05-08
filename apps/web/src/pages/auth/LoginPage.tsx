import { AuthCard } from '@/features/auth/components/AuthCard';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-5">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <AuthCard mode="login" />
    </main>
  );
}
