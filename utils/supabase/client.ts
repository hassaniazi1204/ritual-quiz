// utils/supabase/client.ts
// ✅ SINGLE SOURCE OF TRUTH for browser-side Supabase client.
// DELETE app/lib/supabase.ts and app/lib/supabase-server.ts after copying this.

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
