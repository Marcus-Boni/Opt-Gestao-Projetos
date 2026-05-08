import { useNavigate } from '@tanstack/react-router';
import { LogOut, Mail, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { authClient } from '@/shared/lib/auth-client';
import { getUserInitials, normalizeUserImage } from '@/shared/lib/user-profile';

export function UserMenu() {
  const session = authClient.useSession();
  const navigate = useNavigate();
  const user = session.data?.user;
  const initials = getUserInitials(user?.name, user?.email);
  const image = normalizeUserImage(user?.image);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Abrir menu do usuario"
        >
          <Avatar className="size-9 border">
            <AvatarImage src={image} alt={user?.name ?? 'Usuario'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={image} alt={user?.name ?? 'Usuario'} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {user?.name ?? 'Usuario logado'}
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {user?.email ?? 'Sessao ativa'}
              </span>
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <User aria-hidden="true" />
            Perfil Microsoft
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Mail aria-hidden="true" />
            {user?.email ?? 'E-mail indisponivel'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={async () => {
            await authClient.signOut();
            navigate({ to: '/login' });
          }}
        >
          <LogOut aria-hidden="true" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
