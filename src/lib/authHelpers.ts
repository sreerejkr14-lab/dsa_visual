/** Small pure helpers for the login flow (no React, no Supabase, easy to test). */

/** Turn Supabase's error text into something a learner can act on. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Wrong email or password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for the link.';
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('network request failed')) {
    return "Couldn't reach the server. Check your internet connection and try again.";
  }
  if (m.includes('provider is not enabled') || m.includes('unsupported provider')) {
    return 'This sign-in method is not turned on for the project yet.';
  }
  if (m.includes('different from the old password') || m.includes('same_password')) {
    return 'Choose a password that is different from your current one.';
  }
  if (m.includes('auth session missing') || m.includes('session_not_found')) {
    return 'Your reset link has expired. Request a new one.';
  }
  return message;
}

export const MIN_PASSWORD_LENGTH = 6;

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** Returns an error message, or null when the form is fine. */
export function validateCredentials(email: string, password: string): string | null {
  if (!isValidEmail(email)) return 'Enter a valid email address.';
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

/** For the "set a new password" form: checks length and that both fields match. */
export function validateNewPassword(password: string, confirmPassword: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
}

/**
 * The secret ("service_role") key bypasses all security and must never ship in browser code.
 * If someone pastes it into .env by mistake, refuse to use it.
 */
export function looksLikeSecretKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload?.role === 'service_role';
  } catch {
    return false;
  }
}