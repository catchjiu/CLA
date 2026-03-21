import { createClient } from '@supabase/supabase-js';
import { SUPABASE_REQUEST_TIMEOUT_MS as FETCH_TIMEOUT_MS } from './withTimeout';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing from environment variables');
}

const FETCH_MS = typeof FETCH_TIMEOUT_MS === 'number' && FETCH_TIMEOUT_MS > 0 ? FETCH_TIMEOUT_MS : 40_000;

/**
 * Abort stalled requests so the client promise rejects instead of hanging forever.
 * Promise-only timeouts do not cancel the underlying fetch.
 */
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), FETCH_MS);

  const parentSignal = init?.signal;
  let signal: AbortSignal = controller.signal;
  if (parentSignal) {
    if (parentSignal.aborted) {
      controller.abort();
    } else {
      parentSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  return fetch(input, { ...init, signal }).finally(() => window.clearTimeout(timeoutId));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithTimeout },
});
