import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from 'zitejs/auth';
import { getMe, GetMeOutputType } from 'zitejs/api';

type Ctx = { me: GetMeOutputType | null; loading: boolean; refresh: () => Promise<void> };
const MeContext = createContext<Ctx>({ me: null, loading: true, refresh: async () => {} });

export function MeProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [me, setMe] = useState<GetMeOutputType | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setMe(null); setLoading(false); return; }
    try { setMe(await getMe({})); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { if (!isLoading) refresh(); }, [isLoading, refresh]);

  return <MeContext.Provider value={{ me, loading: isLoading || loading, refresh }}>{children}</MeContext.Provider>;
}

export const useMe = () => useContext(MeContext);
