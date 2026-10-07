import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { MIN_PASSWORD_LENGTH, validateCredentials } from '../lib/authHelpers';

const GITHUB_ENABLED = import.meta.env.VITE_ENABLE_GITHUB_LOGIN === 'true';

const inputStyle: CSSProperties = {
  background: 'var(--secondary)',
  border: '1px solid var(--border)',
  color: 'var(--foreground)',
};

type Mode = 'login' | 'signup';

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

export default function Login() {
  const { user, recoveryMode, loading, configured, signIn, signUp, signInWithGitHub } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmailSentTo, setConfirmEmailSentTo] = useState<string | null>(null);

  // Already logged in (or just finished logging in): go see your progress.
  // (Not while a password-reset session is active — that's routed to /reset-password instead.)
  if (user && !recoveryMode) return <Navigate to="/progress" replace />;

  if (!configured) {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-2">Login isn't set up yet</h1>
        <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
          The site works fine without an account, and your progress is saved in this browser. To turn on accounts, add
          your Supabase keys to a <code className="mono">.env</code> file and restart the dev server:
        </p>
        <pre className="mono text-xs p-3 rounded-lg mb-4 overflow-x-auto" style={{ background: 'var(--secondary)', color: 'var(--accent)' }}>
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
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

  if (confirmEmailSentTo) {
    return (
      <Shell>
        <div className="text-4xl text-center mb-3" aria-hidden="true">✉</div>
        <h1 className="text-xl font-bold text-center mb-2">Check your inbox</h1>
        <p className="text-sm text-center mb-5" style={{ color: 'var(--muted-foreground)' }}>
          We sent a confirmation link to <strong style={{ color: 'var(--foreground)' }}>{confirmEmailSentTo}</strong>.
          Click it to activate your account, then come back and log in.
        </p>
        <button
          onClick={() => { setConfirmEmailSentTo(null); setMode('login'); setPassword(''); }}
          className="w-full py-2.5 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--primary)', color: 'white' }}>
          Back to log in
        </button>
      </Shell>
    );
  }

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const problem = validateCredentials(email, password);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        const err = await signIn(email, password);
        if (err) setError(err); // on success the auth state changes and we redirect above
      } else {
        const { error: err, needsConfirmation } = await signUp(email, password);
        if (err) setError(err);
        else if (needsConfirmation) setConfirmEmailSentTo(email.trim());
      }
    } finally {
      setBusy(false);
    }
  };

  const github = async () => {
    setError(null);
    setBusy(true);
    const err = await signInWithGitHub(); // on success the browser leaves for GitHub
    if (err) {
      setError(err);
      setBusy(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <Shell>
      <h1 className="text-xl font-bold mb-1">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
        {isLogin
          ? 'Log in to load your saved progress on any device.'
          : 'Your progress is saved to your account, and anything you have done as a guest is kept.'}
      </p>

      <div className="flex gap-1 p-1 rounded-lg mb-5" role="tablist" aria-label="Log in or sign up" style={{ background: 'var(--secondary)' }}>
        {(['login', 'signup'] as const).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => switchMode(m)} type="button"
            className="flex-1 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={{
              background: mode === m ? 'var(--card)' : 'transparent',
              color: mode === m ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}>
            {m === 'login' ? 'Log in' : 'Sign up'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div>
          <label htmlFor="auth-email" className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Email</label>
          <input id="auth-email" type="email" autoComplete="email" value={email} disabled={busy}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            aria-invalid={!!error} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="auth-password" className="text-xs font-semibold block" style={{ color: 'var(--muted-foreground)' }}>Password</label>
            {isLogin && (
              <Link to="/reset-password" className="text-xs" style={{ color: 'var(--primary)' }}>Forgot password?</Link>
            )}
          </div>
          <div className="relative">
            <input id="auth-password" type={showPassword ? 'text' : 'password'}
              autoComplete={isLogin ? 'current-password' : 'new-password'} value={password} disabled={busy}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? 'Your password' : `At least ${MIN_PASSWORD_LENGTH} characters`}
              aria-invalid={!!error} className="w-full px-3 py-2 pr-16 rounded-lg text-sm outline-none" style={inputStyle} />
            <button type="button" onClick={() => setShowPassword((s) => !s)} aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute text-xs font-medium px-2 py-1 rounded"
              style={{ right: 6, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', background: 'transparent' }}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-lg text-xs"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={busy} className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity"
          style={{ background: 'var(--primary)', color: 'white', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
        </button>
      </form>

      {GITHUB_ENABLED && (
        <>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>
          <button type="button" onClick={github} disabled={busy}
            className="w-full py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)', opacity: busy ? 0.6 : 1 }}>
            Continue with GitHub
          </button>
        </>
      )}

      <p className="text-xs text-center mt-5" style={{ color: 'var(--muted-foreground)' }}>
        <Link to="/" style={{ color: 'var(--primary)' }}>Continue as guest →</Link>
      </p>
    </Shell>
  );
}