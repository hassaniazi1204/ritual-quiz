import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define database types
export interface Database {
  public: {
    Tables: {
      leaderboard: {
        Row: {
          id: number;
          username: string;
          score: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          username: string;
          score: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          username?: string;
          score?: number;
          created_at?: string;
        };
      };
    };
  };
}

// Singleton Supabase client for server-side API routes
// Reuses connection across requests for better performance and lower connection usage
let supabaseInstance: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
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
  
  // Create new instance with proper typing
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
