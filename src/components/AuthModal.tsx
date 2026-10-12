import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { type Locale } from '../types';

interface Props {
  onClose: () => void;
  locale:  Locale;
}

export function AuthModal({ onClose, locale }: Props) {
  const { login, register, loading } = useAuth();
  const [tab,      setTab]      = useState<'login' | 'register'>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [done,     setDone]     = useState(false);

  const it = locale === 'it';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fn  = tab === 'login' ? login : register;
    const err = await fn(email, password);
    if (err) { setError(err); return; }
    setDone(true);
    setTimeout(onClose, 900);
  }

  return (
    <div className="auth-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`auth-console${done ? ' auth-console--done' : ''}`}>

        {/* Header */}
        <div className="auth-header">
          <div className="auth-title">
            {it ? 'ACCESSO AL SISTEMA' : 'SYSTEM ACCESS'}
          </div>
          <button className="auth-close" onClick={onClose}>✕</button>
        </div>
        <div className="auth-subtitle">
          {it ? '— VIAGGIATORE NEL TEMPO —' : '— TIME TRAVELER —'}
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'login' ? ' auth-tab--active' : ''}`}
            onClick={() => { setTab('login'); setError(null); }}
          >
            {it ? 'Accedi' : 'Login'}
          </button>
          <button
            className={`auth-tab${tab === 'register' ? ' auth-tab--active' : ''}`}
            onClick={() => { setTab('register'); setError(null); }}
          >
            {it ? 'Registrati' : 'Register'}
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">▸ {it ? 'EMAIL' : 'EMAIL'}</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">▸ {it ? 'PASSWORD' : 'PASSWORD'}</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={tab === 'register' ? (it ? 'Minimo 8 caratteri' : 'Min. 8 characters') : '••••••••'}
              required
              minLength={tab === 'register' ? 8 : undefined}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <div className="auth-error">✗ {error}</div>}
          {done  && <div className="auth-ok">⚡ {it ? 'Accesso effettuato' : 'Logged in'}</div>}

          <button className="auth-submit" type="submit" disabled={loading || done}>
            {loading
              ? (it ? '◌ VERIFICA…' : '◌ VERIFYING…')
              : done
                ? (it ? '⚡ ACCESSO CONFERMATO' : '⚡ ACCESS GRANTED')
                : tab === 'login'
                  ? (it ? '⚡ ACCEDI' : '⚡ LOGIN')
                  : (it ? '⚡ REGISTRATI' : '⚡ REGISTER')}
          </button>
        </form>

        {tab === 'register' && (
          <div className="auth-note">
            {it
              ? '✦ Il primo account registrato ottiene i privilegi di amministratore'
              : '✦ The first registered account gets administrator privileges'}
          </div>
        )}
      </div>
    </div>
  );
}
