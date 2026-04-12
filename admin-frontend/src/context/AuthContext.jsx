import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Returns true/false on definitive DB result, null on timeout or error (inconclusive)
async function checkAdmin(uid) {
  try {
    const result = await Promise.race([
      supabase.from('profiles').select('is_admin').eq('id', uid).single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
    ]);
    return result.data?.is_admin === true;
  } catch (e) {
    console.warn('checkAdmin inconclusive:', e.message);
    return null; // null = we don't know, don't override cached state
  }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // ── Bootstrap: resolve loading once via getSession().
    // Finally block ALWAYS fires so loading can never stay true forever.
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!active) return;
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          const cached = localStorage.getItem('admin_uid') === u.id;
          if (cached) {
            // Cache hit: restore isAdmin immediately and unblock the UI right away.
            // No need to wait for a DB round-trip on every page load.
            setIsAdmin(true);
            if (active) setLoading(false);
          }
          // Verify in background — only act on a definitive answer (not null)
          const admin = await checkAdmin(u.id);
          if (active && admin !== null) {
            setIsAdmin(admin);
            if (admin) localStorage.setItem('admin_uid', u.id);
            else localStorage.removeItem('admin_uid');
          }
        } else {
          localStorage.removeItem('admin_uid');
        }
      })
      .catch(e => console.error('getSession error:', e))
      .finally(() => {
        // Covers: no session, no cache, or any error path not already resolved
        if (active) setLoading(false);
      });

    // ── Listener: handle changes AFTER initial load only
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;

      // Skip — already handled by getSession() bootstrap above
      if (event === 'INITIAL_SESSION') return;

      // Token silently refreshed — just sync the user object
      if (event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        return;
      }

      // Signed out
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('admin_uid');
        setUser(null);
        setIsAdmin(false);
        return;
      }

      // SIGNED_IN (fresh login from the login form)
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const admin = await checkAdmin(u.id);
        if (active) setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn  = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
