import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type Role = 'coach' | 'member' | null;

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

    const fetchRole = async (userId: string) => {
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
          .single();

        if (generation !== roleFetchGeneration.current) return;

        if (error) {
          console.error('Error fetching role:', error);
        } else if (data) {
          setRole(data.role as Role);
        }
      } catch (err) {
        console.error('Error in fetchRole:', err);
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
          fetchRole(session.user.id);
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
          await fetchRole(nextUser.id);
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
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
