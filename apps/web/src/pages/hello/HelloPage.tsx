import { Moon, Sun } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { useTheme } from '@/shared/hooks/useTheme';

export function HelloPage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4 pt-8">
          <img
            src="/assets/logo.png"
            alt="Logo Optsolv"
            className="h-14 w-auto"
          />
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
            Optsolv PMS
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Sistema de Gestão de Projetos
          </p>
          <Badge className="bg-primary text-primary-foreground">
            v0.1.0 · M1 Fundação
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
