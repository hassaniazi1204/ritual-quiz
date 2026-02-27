import { createClient } from '@supabase/supabase-js';

// Define your database schema
type Database = {
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
          username: string;
          score: number;
        };
        Update: {
          username?: string;
          score?: number;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};

// Singleton client for concurrent requests
let client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }

  client = createClient<Database>(url, key, {
    auth: { persistSession: false },
  });

  return client;
}
