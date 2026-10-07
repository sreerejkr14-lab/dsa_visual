
import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { MIN_PASSWORD_LENGTH, isValidEmail, validateNewPassword } from '../lib/authHelpers';

const inputStyle: CSSProperties = {
  background: 'var(--secondary)',
  border: '1px solid var(--border)',
  color: 'var(--foreground)',
};

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="flex flex-col items-center gap-3 mb-6 text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
          <svg width="22" height="22" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="7" width="3" height="6" rx="1" fill="white" />
            <rect x="5.5" y="4" width="3" height="9" rx="1" fill="white" />
            <rect x="10" y="1" width="3" height="12" rx="1" fill="white" />
          </svg>
        </div>
        <span className="mono font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          DSA<span style={{ color: 'var(--primary)' }}>Viz</span>
        </span>
      </div>
      <div className="p-6 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const { user, loading, configured, requestPasswordReset, updatePassword } = useAuth();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  if (!configured) {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-2">Login isn't set up yet</h1>
        <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
          There's no account system on this site right now, so there's nothing to reset a password for.
        </p>
        <Link to="/" className="text-sm" style={{ color: 'var(--primary)' }}>← Back to the site</Link>
      </Shell>
    );
  }

  if (loading) {
    return (
      <Shell>
        <p className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>Checking your session…</p>
      </Shell>
    );
  }

  if (passwordUpdated) {
    return (
      <Shell>
        <div className="text-4xl text-center mb-3" aria-hidden="true">✓</div>
        <h1 className="text-xl font-bold text-center mb-2">Password updated</h1>
        <p className="text-sm text-center mb-5" style={{ color: 'var(--muted-foreground)' }}>
          Your password has been changed.
        </p>
        <Link to="/progress" className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--primary)', color: 'white' }}>
          Continue to your progress
        </Link>
      </Shell>
    );
  }

  // A session exists (either from clicking the reset link, or an already logged-in user
  // changing their password) — either way, Supabase lets us set a new password directly.
  if (user) {
    const submitNewPassword = async (e: FormEvent) => {
      e.preventDefault();
      if (busy) return;
      const problem = validateNewPassword(newPassword, confirmPassword);
      if (problem) {
        setError(problem);
        return;
      }
      setError(null);
      setBusy(true);
      try {
        const err = await updatePassword(newPassword);
        if (err) setError(err);
        else setPasswordUpdated(true);
      } finally {
        setBusy(false);
      }
    };

    return (
      <Shell>
        <h1 className="text-xl font-bold mb-1">Set a new password</h1>
        <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
          Choose a new password for <strong style={{ color: 'var(--foreground)' }}>{user.email}</strong>.
        </p>

        <form onSubmit={submitNewPassword} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="new-password" className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>
              New password
            </label>
            <div className="relative">
              <input id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                value={newPassword} disabled={busy} onChange={(e) => setNewPassword(e.target.value)}
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`} aria-invalid={!!error}
                className="w-full px-3 py-2 pr-16 rounded-lg text-sm outline-none" style={inputStyle} />
              <button type="button" onClick={() => setShowPassword((s) => !s)} aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute text-xs font-medium px-2 py-1 rounded"
                style={{ right: 6, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', background: 'transparent' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>
              Confirm new password
            </label>
            <input id="confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
              value={confirmPassword} disabled={busy} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Type it again" aria-invalid={!!error}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-lg text-xs"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={busy} className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity"
            style={{ background: 'var(--primary)', color: 'white', opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Please wait…' : 'Update password'}
          </button>
        </form>
      </Shell>
    );
  }

  if (linkSent) {
    return (
      <Shell>
        <div className="text-4xl text-center mb-3" aria-hidden="true">✉</div>
        <h1 className="text-xl font-bold text-center mb-2">Check your inbox</h1>
        <p className="text-sm text-center mb-5" style={{ color: 'var(--muted-foreground)' }}>
          If an account exists for <strong style={{ color: 'var(--foreground)' }}>{email.trim()}</strong>, we sent a
          link to reset the password. Click it, and you'll be brought back here to choose a new one.
        </p>
        <Link to="/login" className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--primary)', color: 'white' }}>
          Back to log in
        </Link>
      </Shell>
    );
  }

  const submitRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const err = await requestPasswordReset(email);
      if (err) setError(err);
      else setLinkSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <h1 className="text-xl font-bold mb-1">Reset your password</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
        Enter the email on your account, and we'll send you a link to set a new password.
      </p>

      <form onSubmit={submitRequest} noValidate className="flex flex-col gap-4">
        <div>
          <label htmlFor="reset-email" className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>
            Email
          </label>
          <input id="reset-email" type="email" autoComplete="email" value={email} disabled={busy}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={!!error}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-lg text-xs"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={busy} className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity"
          style={{ background: 'var(--primary)', color: 'white', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Please wait…' : 'Send reset link'}
        </button>
      </form>

      <p className="text-xs text-center mt-5" style={{ color: 'var(--muted-foreground)' }}>
        <Link to="/login" style={{ color: 'var(--primary)' }}>Back to log in</Link>
      </p>
    </Shell>
  );
}