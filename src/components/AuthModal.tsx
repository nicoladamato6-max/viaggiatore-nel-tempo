import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { type Locale } from '../types';

interface Props {
  onClose: () => void;
  locale:  Locale;
}

type Tab = 'login' | 'register' | 'reset';

export function AuthModal({ onClose, locale }: Props) {
  const { login, register, resetPassword, loading } = useAuth();
  const [tab,          setTab]         = useState<Tab>('login');
  const [email,        setEmail]       = useState('');
  const [password,     setPassword]    = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gdprConsent,  setGdprConsent] = useState(false);
  const [error,        setError]       = useState<string | null>(null);
  const [done,         setDone]        = useState(false);
  const [doneMsg,      setDoneMsg]     = useState('');

  const it = locale === 'it';

  function switchTab(t: Tab) { setTab(t); setError(null); setDone(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (tab === 'reset') {
      const err = await resetPassword(email);
      if (err) { setError(err); return; }
      setDone(true);
      setDoneMsg(it
        ? '⚡ Email inviata — controlla la tua casella di posta'
        : '⚡ Email sent — check your inbox');
      return;
    }

    if (tab === 'login') {
      const err = await login(email, password);
      if (err) { setError(err); return; }
      setDone(true);
      setDoneMsg(it ? '⚡ Accesso confermato' : '⚡ Access granted');
      setTimeout(onClose, 900);
      return;
    }

    // register
    const err = await register(email, password, gdprConsent);
    if (err) { setError(err); return; }
    setDone(true);
    setDoneMsg(it
      ? '⚡ Registrazione completata — controlla la tua email per confermare'
      : '⚡ Registered — check your email to confirm');
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
        <div className="auth-subtitle">— VIAGGIATORE NEL TEMPO —</div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login'    ? ' auth-tab--active' : ''}`} onClick={() => switchTab('login')}>
            {it ? 'Accedi' : 'Login'}
          </button>
          <button className={`auth-tab${tab === 'register' ? ' auth-tab--active' : ''}`} onClick={() => switchTab('register')}>
            {it ? 'Registrati' : 'Register'}
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">▸ EMAIL</label>
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

          {tab !== 'reset' && (
            <div className="auth-field">
              <label className="auth-label">▸ PASSWORD</label>
              <div className="auth-password-wrap">
                <input
                  className="auth-input auth-input--password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={tab === 'register' ? (it ? 'Minimo 6 caratteri' : 'Min. 6 characters') : '••••••••'}
                  required
                  minLength={tab === 'register' ? 6 : undefined}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          )}

          {tab === 'register' && (
            <label className="auth-gdpr-label">
              <input
                type="checkbox"
                className="auth-gdpr-checkbox"
                checked={gdprConsent}
                onChange={e => setGdprConsent(e.target.checked)}
                required
              />
              <span className="auth-gdpr-text">
                {it
                  ? <>Ho letto e accetto la <a className="auth-link" href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> (GDPR Art. 6)</>
                  : <>I have read and accept the <a className="auth-link" href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> (GDPR Art. 6)</>}
              </span>
            </label>
          )}

          {tab === 'login' && (
            <button type="button" className="auth-forgot" onClick={() => switchTab('reset')}>
              {it ? '▸ Password dimenticata?' : '▸ Forgot password?'}
            </button>
          )}

          {tab === 'reset' && (
            <div className="auth-reset-note">
              {it
                ? 'Inserisci la tua email — riceverai un link per reimpostare la password.'
                : 'Enter your email — you\'ll receive a link to reset your password.'}
            </div>
          )}

          {error && <div className="auth-error">✗ {error}</div>}
          {done  && <div className="auth-ok">{doneMsg}</div>}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading || (done && tab !== 'reset') || (tab === 'register' && !gdprConsent)}
          >
            {loading
              ? (it ? '◌ VERIFICA…' : '◌ VERIFYING…')
              : done
                ? doneMsg
                : tab === 'login'
                  ? (it ? '⚡ ACCEDI' : '⚡ LOGIN')
                  : tab === 'register'
                    ? (it ? '⚡ REGISTRATI' : '⚡ REGISTER')
                    : (it ? '⚡ INVIA LINK RESET' : '⚡ SEND RESET LINK')}
          </button>
        </form>

        {tab === 'register' && !done && (
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
