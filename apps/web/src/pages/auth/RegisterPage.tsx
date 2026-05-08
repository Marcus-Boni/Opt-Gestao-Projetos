import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthLayout } from '@/features/auth/components/AuthLayout';

export function RegisterPage() {
  return (
    <AuthLayout mode="register">
      <AuthCard mode="register" />
    </AuthLayout>
  );
}
