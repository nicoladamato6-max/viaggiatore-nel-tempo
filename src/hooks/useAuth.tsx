import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface AuthUser { id: string; email: string; role: 'admin' | 'user' }

interface AuthState {
  user:     AuthUser | null;
  token:    string | null;
  loading:  boolean;
  login:    (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string) => Promise<string | null>;
  logout:   () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

const TOKEN_KEY = 'vnt_token';

function parseUser(token: string): AuthUser | null {
  try {
    const [, body] = token.split('.');
    const base64 = body.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - base64.length % 4) % 4;
    const bin = atob(base64 + '='.repeat(padding));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const json = JSON.parse(new TextDecoder().decode(bytes));
    if (!json.sub || !json.email || !json.role) return null;
    if ((json.exp as number) < Math.floor(Date.now() / 1000)) return null;
    return { id: json.sub, email: json.email, role: json.role };
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken]   = useState<string | null>(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    return t && parseUser(t) ? t : null;
  });
  const [loading, setLoading] = useState(false);

  const user = token ? parseUser(token) : null;

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { token?: string; error?: string };
      if (!res.ok || !data.token) return data.error ?? 'Errore di login';
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      return null;
    } catch { return 'Errore di rete'; }
    finally   { setLoading(false); }
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<string | null> => {
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { token?: string; error?: string };
      if (!res.ok || !data.token) return data.error ?? 'Errore di registrazione';
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      return null;
    } catch { return 'Errore di rete'; }
    finally   { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
