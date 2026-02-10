import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from './logger';

const log = createLogger('Supabase');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  log.warn('Environment variables SUPABASE_URL and/or SUPABASE_ANON_KEY are missing. Falling back to LocalStorage.');
} else {
  log.info('Supabase credentials detected.', { url: supabaseUrl });
}

// Only initialize if we have the credentials.
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export let isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Verifies that the `ideas` table exists in the connected Supabase instance.
 * If the table is missing (404), disables Supabase and falls back to LocalStorage.
 * Returns `true` if the table is reachable, `false` otherwise.
 */
export async function verifySupabaseTable(): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  try {
    log.info('Verifying "ideas" table exists...');
    const { error } = await supabase
      .from('ideas')
      .select('id')
      .limit(1);

    if (error) {
      // PostgREST returns code "PGRST204" or HTTP 404 when the table doesn't exist
      log.error(`Table "ideas" is not reachable: ${error.message}`, {
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      log.warn(
        'Disabling Supabase — falling back to LocalStorage. ' +
        'Please create the "ideas" table using the SQL in the README.'
      );
      isSupabaseConfigured = false;
      return false;
    }

    log.info('Table "ideas" verified successfully.');
    return true;
  } catch (err) {
    log.error('Unexpected error verifying Supabase table.', err);
    isSupabaseConfigured = false;
    return false;
  }
}
