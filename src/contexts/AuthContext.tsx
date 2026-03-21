import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type Role = 'coach' | 'member' | null;

function normalizeRole(raw: unknown): Role {
  if (raw == null || typeof raw !== 'string') return null;
  const r = raw.trim().toLowerCase();
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const roleFetchGeneration = useRef(0);
  const lastFetchedUserIdRef = useRef<string | null>(null);
  /** Supabase may emit SIGNED_IN again for an existing session; avoid re-blocking the whole app. */
  const committedSessionUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const sessionTimeout = setTimeout(() => setLoading(false), 8000);

    const fetchRole = async (userId: string, authUser: User | null) => {
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
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (generation !== roleFetchGeneration.current) return;

        if (error) {
          console.error('Error fetching role:', error);
        }

        const resolved = resolveRoleFromUser(authUser, data?.role);
        if (resolved) {
          setRole(resolved);
        }
      } catch (err) {
        console.error('Error in fetchRole:', err);
        if (generation === roleFetchGeneration.current) {
          const fallback = resolveRoleFromUser(authUser, null);
          if (fallback) setRole(fallback);
        }
      } finally {
        clearTimeout(roleTimeout);
        if (generation === roleFetchGeneration.current) {
          setLoading(false);
        }
      }
    };

    // Check active sessions and sets the user
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) console.error(error);
        const u = session?.user ?? null;
        setUser(u);
        committedSessionUserIdRef.current = u?.id ?? null;
        if (session?.user) {
          fetchRole(session.user.id, session.user);
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

    // Listen for changes on auth state (logged in, signed out, etc.)
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
  }, []);

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

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
