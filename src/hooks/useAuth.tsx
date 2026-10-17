import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface AuthUser { id: string; email: string; role: 'admin' | 'user' }

interface AuthState {
  user:          AuthUser | null;
  token:         string | null;
  loading:       boolean;
  login:         (email: string, password: string) => Promise<string | null>;
  register:      (email: string, password: string, gdprConsent: boolean) => Promise<string | null>;
  logout:        () => void;
  resetPassword: (email: string) => Promise<string | null>;
  deleteAccount: () => Promise<string | null>;
}

const AuthCtx = createContext<AuthState | null>(null);

async function fetchRole(userId: string): Promise<'admin' | 'user'> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  return (data as { role?: string } | null)?.role === 'admin' ? 'admin' : 'user';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ripristina sessione esistente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await fetchRole(session.user.id);
        setUser({ id: session.user.id, email: session.user.email ?? '', role });
        setToken(session.access_token);
      }
      setLoading(false);
    });

    // Aggiorna stato ad ogni cambio auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        setUser(null); setToken(null);
      } else {
        const role = await fetchRole(session.user.id);
        setUser({ id: session.user.id, email: session.user.email ?? '', role });
        setToken(session.access_token);
      }
      if (event === 'INITIAL_SESSION') setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return localizeError(error.message);
    // Log accesso in background (non bloccante)
    if (data.session) {
      supabase.from('access_logs').insert({
        user_id:    data.session.user.id,
        user_agent: navigator.userAgent.slice(0, 200),
      }).then(() => {});
    }
    return null;
  }, []);

  const register = useCallback(async (
    email: string, password: string, gdprConsent: boolean
  ): Promise<string | null> => {
    if (!gdprConsent) return 'Devi accettare la privacy policy per registrarti';
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { gdpr_consent_at: new Date().toISOString() },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) return localizeError(error.message);
    return null;
  }, []);

  const logout = useCallback(() => {
    supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?reset=1`,
    });
    if (error) return localizeError(error.message);
    return null;
  }, []);

  const deleteAccount = useCallback(async (): Promise<string | null> => {
    if (!user || !token) return 'Non sei autenticato';
    // Soft-delete del profilo
    await supabase.from('profiles').update({ deleted_at: new Date().toISOString() }).eq('id', user.id);
    // Hard-delete via CF Function (usa service role)
    try {
      const res = await fetch('/api/auth/delete-account', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // Ripristina soft-delete se hard-delete fallisce
        await supabase.from('profiles').update({ deleted_at: null }).eq('id', user.id);
        return 'Errore durante la cancellazione — riprova';
      }
    } catch {
      await supabase.from('profiles').update({ deleted_at: null }).eq('id', user.id);
      return 'Errore di rete — riprova';
    }
    supabase.auth.signOut();
    return null;
  }, [user, token]);

  return (
    <AuthCtx.Provider value={{ user, token, loading, login, register, logout, resetPassword, deleteAccount }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

function localizeError(msg: string): string {
  if (msg.includes('Invalid login credentials'))  return 'Email o password non corretti';
  if (msg.includes('Email not confirmed'))         return 'Controlla la tua email e conferma l\'account';
  if (msg.includes('User already registered'))     return 'Email già registrata';
  if (msg.includes('Password should be'))          return 'La password deve essere di almeno 6 caratteri';
  if (msg.includes('Unable to validate email'))    return 'Email non valida';
  if (msg.includes('over_email_send_rate_limit'))  return 'Troppi tentativi — riprova tra qualche minuto';
  if (msg.includes('Email rate limit exceeded'))   return 'Troppi tentativi — riprova tra qualche minuto';
  return msg;
}
