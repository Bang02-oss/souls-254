import { useEffect, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { Loader2 } from 'lucide-react';
import { useMe } from '../lib/me';

export function Spinner() {
  return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
}

export default function RequireAuth({ children, admin }: { children: ReactNode; admin?: boolean }) {
  const { user, isLoading } = useAuth();
  const { me, loading } = useMe();
  const loc = useLocation();

  useEffect(() => { if (!isLoading && !user) loginWithRedirect(); }, [isLoading, user]);

  if (isLoading || !user || loading || !me) return <Spinner />;
  if (!me.profile && loc.pathname !== '/profile') return <Navigate to="/profile" replace />;
  if (admin && !me.isAdmin) return <Navigate to="/jobs" replace />;
  if (me.profile?.blocked && loc.pathname !== '/profile')
    return <div className="py-24 text-center text-muted-foreground">Your account has been blocked by the admin.</div>;
  return <>{children}</>;
}
