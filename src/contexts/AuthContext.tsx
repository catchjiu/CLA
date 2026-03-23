import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { roleFromAccessToken } from '../lib/jwtClaims';
import type { User } from '@supabase/supabase-js';

type Role = 'coach' | 'member' | null;

function normalizeRole(raw: unknown): Role {
  if (raw == null) return null;
  const r = String(raw).trim().toLowerCase();
  if (r === 'coach' || r === 'member') return r;
  return null;
}

/** Role from DB row, else Supabase Auth app/user metadata (e.g. dashboard claims). */
function resolveRoleFromUser(authUser: User | null, profileRole: unknown): Role {
  const fromProfile = normalizeRole(profileRole);
  if (fromProfile) return fromProfile;
  if (!authUser) return null;
  const app = authUser.app_metadata as Record<string, unknown> | undefined;
  const meta = authUser.user_metadata as Record<string, unknown> | undefined;
  return (
    normalizeRole(app?.role) ||
    normalizeRole(app?.user_role) ||
    normalizeRole(meta?.role) ||
    normalizeRole(meta?.user_role)
  );
}

interface AuthContextType {
  user: User | null;
  role: Role;
  loading: boolean;
  signOut: () => Promise<void>;
  /** Re-fetch role from JWT, get_my_role RPC, and profiles (e.g. after fixing Supabase). */
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  refreshRole: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const PROFILE_RETRIES = 3;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const roleFetchGeneration = useRef(0);
  const lastFetchedUserIdRef = useRef<string | null>(null);
  const committedSessionUserIdRef = useRef<string | null>(null);

  const fetchRole = useCallback(async (userId: string, authUser: User | null) => {
    const generation = ++roleFetchGeneration.current;
    if (lastFetchedUserIdRef.current !== userId) {
      setRole(null);
      lastFetchedUserIdRef.current = userId;
    }

    const roleTimeout = setTimeout(() => {
      if (generation === roleFetchGeneration.current) {
        setLoading(false);
      }
    }, 8000);

    try {
      await supabase.auth.refreshSession();

      let roleResolved: Role = null;

      // 1) Read role from the refreshed access token (getUser() can lag behind SQL/dashboard edits)
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (token) {
        roleResolved = roleFromAccessToken(token);
      }

      let userForMeta: User | null = authUser;
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (!userErr && userData?.user?.id === userId) {
        userForMeta = userData.user;
      }

      if (!roleResolved && generation === roleFetchGeneration.current) {
        roleResolved = resolveRoleFromUser(userForMeta, null);
      }

      // 2) RPC — works when RLS blocks REST SELECT on profiles
      if (!roleResolved && generation === roleFetchGeneration.current) {
        try {
          const { data: rpcRole, error: rpcErr } = await supabase.rpc('get_my_role', {});
          if (generation !== roleFetchGeneration.current) return;
          if (!rpcErr && rpcRole != null && String(rpcRole).trim() !== '') {
            const r = normalizeRole(
              typeof rpcRole === 'string' ? rpcRole : String(rpcRole)
            );
            if (r) roleResolved = r;
          } else if (rpcErr) {
            const msg = rpcErr.message ?? '';
            if (msg.includes('function') && msg.includes('does not exist')) {
              console.warn(
                'Run supabase_get_my_role.sql in Supabase SQL Editor (Production), then reload.'
              );
            } else {
              console.warn('get_my_role:', rpcErr);
            }
          }
        } catch (e) {
          console.warn('get_my_role RPC failed:', e);
        }
      }

      // 3) Direct profiles read (when RLS allows it)
      let profileRole: unknown = undefined;
      if (!roleResolved) {
        for (let attempt = 0; attempt < PROFILE_RETRIES; attempt++) {
          if (generation !== roleFetchGeneration.current) return;

          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle();

          if (generation !== roleFetchGeneration.current) return;

          if (error) {
            console.error('Error fetching role (attempt', attempt + 1, '):', error);
          } else if (data?.role != null && String(data.role).trim() !== '') {
            profileRole = data.role;
            break;
          }

          if (attempt < PROFILE_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
          }
        }

        roleResolved = resolveRoleFromUser(userForMeta, profileRole);
      }

      if (generation === roleFetchGeneration.current && roleResolved) {
        setRole(roleResolved);
      }
    } catch (err) {
      console.error('Error in fetchRole:', err);
      if (generation === roleFetchGeneration.current) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          const u = userData?.user?.id === userId ? userData.user : authUser;
          const fallback = resolveRoleFromUser(u ?? null, null);
          if (fallback) setRole(fallback);
        } catch {
          const fallback = resolveRoleFromUser(authUser, null);
          if (fallback) setRole(fallback);
        }
      }
    } finally {
      clearTimeout(roleTimeout);
      if (generation === roleFetchGeneration.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const sessionTimeout = setTimeout(() => setLoading(false), 8000);

    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) console.error(error);
        const u = session?.user ?? null;
        setUser(u);
        committedSessionUserIdRef.current = u?.id ?? null;
        if (session?.user) {
          void fetchRole(session.user.id, session.user);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      })
      .finally(() => {
        clearTimeout(sessionTimeout);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const nextUser = session?.user ?? null;
        const nextId = nextUser?.id ?? null;

        if (event === 'SIGNED_IN' && nextId) {
          const isNewSession =
            committedSessionUserIdRef.current === null ||
            committedSessionUserIdRef.current !== nextId;
          if (isNewSession) {
            setLoading(true);
          }
        }

        setUser(nextUser);
        committedSessionUserIdRef.current = nextId;

        if (nextUser) {
          await fetchRole(nextUser.id, nextUser);
        } else {
          roleFetchGeneration.current += 1;
          lastFetchedUserIdRef.current = null;
          committedSessionUserIdRef.current = null;
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchRole]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          void fetchRole(session.user.id, session.user);
        }
      });
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetchRole]);

  const signOut = async () => {
    roleFetchGeneration.current += 1;
    lastFetchedUserIdRef.current = null;
    committedSessionUserIdRef.current = null;
    setUser(null);
    setRole(null);
    setLoading(false);
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.error('signOut:', e);
    }
  };

  const refreshRole = useCallback(async () => {
    const u = user;
    if (!u) return;
    setLoading(true);
    await fetchRole(u.id, u);
  }, [user, fetchRole]);

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}
