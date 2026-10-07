import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { looksLikeSecretKey } from './authHelpers';
import type { ProgressData } from './Progress';
import type { RemoteStore } from './progressSync';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const secretKeyUsed = !!key && looksLikeSecretKey(key);
if (secretKeyUsed) {
  console.error(
    'DSAViz: VITE_SUPABASE_ANON_KEY looks like a SECRET key. Refusing to use it in the browser. ' +
      'Use the public "anon" / "publishable" key instead, and rotate the secret key in the Supabase dashboard.'
  );
}

/** False when the .env values are missing; the site then works as a guest-only app. */
export const isSupabaseConfigured = !!url && !!key && !secretKeyUsed;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        // PKCE puts the login code in the query string, which does not clash with the #/ router.
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Reads and writes one row per user in the `user_progress` table (protected by Row Level Security). */
export const supabaseRemote: RemoteStore | null = supabase
  ? {
      async load(userId: string) {
        const { data, error } = await supabase
          .from('user_progress')
          .select('data')
          .eq('user_id', userId)
          .maybeSingle();
        if (error) throw error;
        return data?.data ?? null;
      },
      async save(userId: string, progress: ProgressData) {
        const { error } = await supabase
          .from('user_progress')
          .upsert(
            { user_id: userId, data: progress, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          );
        if (error) throw error;
      },
    }
  : null;