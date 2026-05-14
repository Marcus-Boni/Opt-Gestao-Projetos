type SessionLike =
  | {
      user?: unknown;
    }
  | null
  | undefined;

export function userCanAccessApp(session: SessionLike) {
  return Boolean(session?.user);
}

export function getAuthRedirectTarget(pathnameWithSearch: string) {
  return `/login?redirect=${encodeURIComponent(pathnameWithSearch)}`;
}

export function getPostLoginRedirect(search: string) {
  const params = new URLSearchParams(search);
  const redirect = params.get('redirect');
  return redirect?.startsWith('/app') ? redirect : '/app/dashboard';
}
