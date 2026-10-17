import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { type Locale } from '../types';

interface Props {
  onClose: () => void;
  locale:  Locale;
}

export function ProfileModal({ onClose, locale }: Props) {
  const { user, logout, deleteAccount } = useAuth();
  const [section, setSection] = useState<'main' | 'password' | 'delete'>('main');

  const [newPassword,    setNewPassword]    = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError,  setPwError]  = useState<string | null>(null);
  const [pwDone,   setPwDone]   = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [delError,  setDelError]  = useState<string | null>(null);
  const [delLoading, setDelLoading] = useState(false);

  const it = locale === 'it';

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (newPassword.length < 6) {
      setPwError(it ? 'La password deve essere di almeno 6 caratteri' : 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError(it ? 'Le password non corrispondono' : 'Passwords do not match');
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);
    if (error) { setPwError(error.message); return; }
    setPwDone(true);
    setNewPassword(''); setConfirmPassword('');
    setTimeout(() => setSection('main'), 2000);
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDelError(null);
    if (deleteConfirm !== 'ELIMINA') {
      setDelError(it ? 'Digita ELIMINA per confermare' : 'Type DELETE to confirm');
      return;
    }
    setDelLoading(true);
    const err = await deleteAccount();
    setDelLoading(false);
    if (err) { setDelError(err); return; }
    onClose();
  }

  if (!user) return null;

  return (
    <div className="auth-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="auth-console profile-console">

        <div className="auth-header">
          <div className="auth-title">
            {section === 'main'     ? (it ? 'PROFILO UTENTE' : 'USER PROFILE') : ''}
            {section === 'password' ? (it ? 'CAMBIA PASSWORD' : 'CHANGE PASSWORD') : ''}
            {section === 'delete'   ? (it ? 'ELIMINA ACCOUNT' : 'DELETE ACCOUNT') : ''}
          </div>
          <button className="auth-close" onClick={onClose}>✕</button>
        </div>
        <div className="auth-subtitle">— {user.email} —</div>

        {/* Sezione principale */}
        {section === 'main' && (
          <div className="profile-body">
            <div className="profile-info-row">
              <span className="profile-info-label">{it ? 'Email' : 'Email'}</span>
              <span className="profile-info-value">{user.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">{it ? 'Ruolo' : 'Role'}</span>
              <span className={`profile-role-badge${user.role === 'admin' ? ' profile-role-badge--admin' : ''}`}>
                {user.role === 'admin' ? '⚙ ADMIN' : '👤 UTENTE'}
              </span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">GDPR</span>
              <span className="profile-gdpr-ok">✓ {it ? 'Consenso registrato' : 'Consent recorded'}</span>
            </div>

            <div className="profile-actions">
              <button className="auth-submit profile-action-btn" onClick={() => setSection('password')}>
                {it ? '🔑 Cambia password' : '🔑 Change password'}
              </button>
              <button className="logout-btn" onClick={() => { logout(); onClose(); }}>
                {it ? '⏏ Esci dall\'account' : '⏏ Sign out'}
              </button>
              <button className="profile-delete-link" onClick={() => setSection('delete')}>
                {it ? 'Elimina account (GDPR Art. 17)' : 'Delete account (GDPR Art. 17)'}
              </button>
            </div>
          </div>
        )}

        {/* Cambio password */}
        {section === 'password' && (
          <form className="auth-form" onSubmit={handleChangePassword}>
            <div className="auth-field">
              <label className="auth-label">▸ {it ? 'NUOVA PASSWORD' : 'NEW PASSWORD'}</label>
              <input
                className="auth-input"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder={it ? 'Minimo 6 caratteri' : 'Min. 6 characters'}
                required minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="auth-field">
              <label className="auth-label">▸ {it ? 'CONFERMA PASSWORD' : 'CONFIRM PASSWORD'}</label>
              <input
                className="auth-input"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required minLength={6}
                autoComplete="new-password"
              />
            </div>
            {pwError && <div className="auth-error">✗ {pwError}</div>}
            {pwDone  && <div className="auth-ok">⚡ {it ? 'Password aggiornata!' : 'Password updated!'}</div>}
            <div className="profile-btn-row">
              <button type="button" className="profile-back-btn" onClick={() => setSection('main')}>
                ← {it ? 'Indietro' : 'Back'}
              </button>
              <button className="auth-submit" type="submit" disabled={pwLoading || pwDone}>
                {pwLoading ? '◌…' : (it ? '⚡ AGGIORNA' : '⚡ UPDATE')}
              </button>
            </div>
          </form>
        )}

        {/* Eliminazione account */}
        {section === 'delete' && (
          <form className="auth-form" onSubmit={handleDeleteAccount}>
            <div className="profile-delete-warning">
              ⚠ {it
                ? 'Questa operazione è irreversibile. Tutti i tuoi dati verranno eliminati entro 30 giorni (GDPR Art. 17).'
                : 'This is irreversible. All your data will be deleted within 30 days (GDPR Art. 17).'}
            </div>
            <div className="auth-field">
              <label className="auth-label">▸ {it ? 'Digita ELIMINA per confermare' : 'Type DELETE to confirm'}</label>
              <input
                className="auth-input auth-input--danger"
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder={it ? 'ELIMINA' : 'DELETE'}
                autoComplete="off"
              />
            </div>
            {delError && <div className="auth-error">✗ {delError}</div>}
            <div className="profile-btn-row">
              <button type="button" className="profile-back-btn" onClick={() => setSection('main')}>
                ← {it ? 'Annulla' : 'Cancel'}
              </button>
              <button className="auth-submit auth-submit--danger" type="submit" disabled={delLoading}>
                {delLoading ? '◌…' : (it ? '⚡ ELIMINA ACCOUNT' : '⚡ DELETE ACCOUNT')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
