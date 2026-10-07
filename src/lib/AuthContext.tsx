import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { friendlyAuthError, isValidEmail } from './authHelpers';
import { isSupabaseConfigured, supabase, supabaseRemote } from './supabase';
import { configureSync, flushNow, startSync, stopSync } from './progressSync';

export interface AuthUser {
  id: string;
  email: string | null;
}

interface AuthValue {
  user: AuthUser | null;
  /** True until we know whether someone is already logged in. */
  loading: boolean;
  /** False when Supabase keys are missing: the site then runs as guest-only. */
  configured: boolean;
  /** Resolves to an error message, or null on success. */
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGitHub: () => Promise<string | null>;
  signOut: () => Promise<void>;
  /** True right after the person clicks a password-reset link: they have a session, but it's only valid for setting a new password. */
  recoveryMode: boolean;
  /** Sends a reset link. Always resolves to null on a well-formed email — Supabase never reveals whether the address has an account. */
  requestPasswordReset: (email: string) => Promise<string | null>;
  /** Sets a new password for the current session (used both for the recovery link and for a logged-in user changing their password). */
  updatePassword: (newPassword: string) => Promise<string | null>;
}

const NOT_CONFIGURED = 'Login is not set up on this site yet.';

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: false,
  configured: false,
  signIn: async () => NOT_CONFIGURED,
  signUp: async () => ({ error: NOT_CONFIGURED, needsConfirmation: false }),
  signInWithGitHub: async () => NOT_CONFIGURED,
  signOut: async () => {},
  recoveryMode: false,
  requestPasswordReset: async () => NOT_CONFIGURED,
  updatePassword: async () => NOT_CONFIGURED,
});

configureSync(supabaseRemote);

/** Where Supabase sends people after email confirmation or GitHub login. */
const redirectUrl = () => `${window.location.origin}${window.location.pathname}`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [recoveryMode, setRecoveryMode] = useState(false);

  // 1. Know who is logged in, and hear about logins/logouts (including from other tabs).
  useEffect(() => {
    if (!supabase) return;
    let active = true;

    const apply = (session: { user?: { id: string; email?: string | null } } | null) => {
      if (!active) return;
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session)).catch(() => apply(null));
    // Keep this callback tiny: awaiting Supabase calls inside it can deadlock.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      apply(session);
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Clicking a reset-password link can land on any page (whatever the redirect URL resolves to).
  // Once we notice the recovery session, force the hash router to the reset-password screen.
  useEffect(() => {
    if (recoveryMode && typeof window !== 'undefined' && window.location.hash !== '#/reset-password') {
      window.location.hash = '#/reset-password';
    }
  }, [recoveryMode]);

  // 2. Start syncing progress when someone logs in; stop (and clear this browser) when they log out.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (loading) return;
    if (userId) void startSync(userId);
    else void stopSync();
  }, [userId, loading]);

  const value: AuthValue = {
    user,
    loading,
    configured: isSupabaseConfigured,

    signIn: async (email, password) => {
      if (!supabase) return NOT_CONFIGURED;
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? friendlyAuthError(error.message) : null;
    },

    signUp: async (email, password) => {
      if (!supabase) return { error: NOT_CONFIGURED, needsConfirmation: false };
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: redirectUrl() },
      });
      if (error) return { error: friendlyAuthError(error.message), needsConfirmation: false };
      // With email confirmation on, an already-registered address comes back as a user with no identities.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { error: friendlyAuthError('User already registered'), needsConfirmation: false };
      }
      return { error: null, needsConfirmation: !data.session };
    },

    signInWithGitHub: async () => {
      if (!supabase) return NOT_CONFIGURED;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: redirectUrl() },
      });
      return error ? friendlyAuthError(error.message) : null;
    },

    signOut: async () => {
      if (!supabase) return;
      // Save anything pending first, and warn if that is not possible (logging out clears this browser's copy).
      const saved = await flushNow();
      if (!saved && !window.confirm("Your latest progress couldn't be saved. Log out anyway and lose those changes?")) {
        return;
      }
      await supabase.auth.signOut();
    },

    recoveryMode,

    requestPasswordReset: async (email) => {
      if (!supabase) return NOT_CONFIGURED;
      if (!isValidEmail(email)) return 'Enter a valid email address.';
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectUrl() });
      return error ? friendlyAuthError(error.message) : null;
    },

    updatePassword: async (newPassword) => {
      if (!supabase) return NOT_CONFIGURED;
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return friendlyAuthError(error.message);
      setRecoveryMode(false);
      return null;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);