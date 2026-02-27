import { createClient } from '@supabase/supabase-js';

let client: any = null;

export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return client;
}
