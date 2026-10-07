import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { useAuth } from '../lib/AuthContext';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Algorithms', to: '/algorithms' },
  { label: 'Visualizer', to: '/visualizer/bubble-sort' },
  { label: 'Challenges', to: '/challenges' },
  { label: 'Progress', to: '/progress' },
];

/** Avatar button + dropdown for a logged-in user. */
function UserMenu({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu"
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mono"
        style={{ background: 'var(--primary)', color: 'white' }}>
        {email.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div role="menu" className="absolute rounded-lg p-1"
          style={{ right: 0, top: 40, minWidth: 220, background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          <div className="px-3 py-2 text-xs" style={{ color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)', wordBreak: 'break-all' }}>
            Signed in as<br /><span style={{ color: 'var(--foreground)' }}>{email}</span>
          </div>
          <Link to="/progress" role="menuitem" onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-md text-sm" style={{ color: 'var(--foreground)' }}>
            My progress
          </Link>
          <Link to="/reset-password" role="menuitem" onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-md text-sm" style={{ color: 'var(--foreground)' }}>
            Change password
          </Link>
          <button role="menuitem" onClick={() => { setOpen(false); onSignOut(); }}
            className="block w-full text-left px-3 py-2 rounded-md text-sm" style={{ color: '#f87171', background: 'transparent' }}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, configured, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <nav style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="7" width="3" height="6" rx="1" fill="white" />
                <rect x="5.5" y="4" width="3" height="9" rx="1" fill="white" />
                <rect x="10" y="1" width="3" height="12" rx="1" fill="white" />
              </svg>
            </div>
            <span className="mono font-bold text-sm tracking-tight" style={{ color: 'var(--foreground)' }}>
              DSA<span style={{ color: 'var(--primary)' }}>Viz</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, to }) => {
              const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to.split('/')[1] ? `/${to.split('/')[1]}` : to);
              return (
                <Link
                  key={to}
                  to={to}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  style={{
                    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                    background: active ? 'var(--secondary)' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {configured && !loading && (user ? (
              <UserMenu email={user.email ?? 'account'} onSignOut={signOut} />
            ) : (
              <Link to="/login" className="px-3 py-1.5 rounded-md text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--primary)', color: 'white' }}>
                Log in
              </Link>
            ))}
            <button className="md:hidden w-8 h-8 flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }} onClick={() => setMenuOpen(o => !o)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t px-4 py-2 flex flex-col gap-1" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            {navLinks.map(({ label, to }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {label}
              </Link>
            ))}
            {configured && !loading && (user ? (
              <button onClick={() => { setMenuOpen(false); signOut(); }}
                className="text-left px-3 py-2 rounded-md text-sm font-medium" style={{ color: '#f87171', background: 'transparent' }}>
                Log out ({user.email})
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium" style={{ color: 'var(--primary)' }}>
                Log in
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}