import { createClient } from '@supabase/supabase-js';

// Singleton Supabase client for server-side API routes
// Reuses connection across requests for better performance and lower connection usage
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  // Check for environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // Create new instance
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Important: server-side should not persist sessions
    },
    db: {
      schema: 'public',
    },
  });
  
  console.log('✅ Supabase singleton client created');
  
  return supabaseInstance;
}

// Export for backward compatibility
export const supabase = getSupabaseClient();
