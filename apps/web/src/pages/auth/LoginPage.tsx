import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthLayout } from '@/features/auth/components/AuthLayout';

export function LoginPage() {
  return (
    <AuthLayout mode="login">
      <AuthCard mode="login" />
    </AuthLayout>
  );
}
