// Supabase authentication configuration
// app/lib/supabase-auth.ts

import { createClient } from '@supabase/supabase-js';
import type { User, AuthMode } from './auth-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client for auth
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Persist auth sessions in localStorage
    autoRefreshToken: true,
    detectSessionInUrl: true, // Detect OAuth redirects
  },
});

// Sign in with Google
export async function signInWithGoogle() {
  const { data, error } = await supabaseAuth.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }

  return data;
}

// Sign in with Discord
export async function signInWithDiscord() {
  const { data, error } = await supabaseAuth.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Discord sign-in error:', error);
    throw error;
  }

  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabaseAuth.auth.signOut();
  
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
  
  // Clear guest session from localStorage
  localStorage.removeItem('guest_user');
  localStorage.removeItem('guest_session');
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabaseAuth.auth.getSession();
  
  if (error) {
    console.error('Get session error:', error);
    return null;
  }
  
  return session;
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  
  if (!session?.user) {
    // Check for guest session
    const guestUser = localStorage.getItem('guest_user');
    if (guestUser) {
      return JSON.parse(guestUser);
    }
    return null;
  }

  // Map Supabase user to our User type
  const supabaseUser = session.user;
  const authMode: AuthMode = 
    supabaseUser.app_metadata.provider === 'google' ? 'google' :
    supabaseUser.app_metadata.provider === 'discord' ? 'discord' :
    'guest';

  return {
    id: supabaseUser.id,
    username: supabaseUser.user_metadata.full_name || 
              supabaseUser.user_metadata.name || 
              supabaseUser.email?.split('@')[0] || 
              'Player',
    authMode,
    email: supabaseUser.email,
    avatar: supabaseUser.user_metadata.avatar_url || 
            supabaseUser.user_metadata.picture,
    provider_id: supabaseUser.id,
    created_at: supabaseUser.created_at,
  };
}

// Create a guest user object
export function createGuestUser(username: string): User {
  return {
    id: `guest_${Date.now()}`,
    username,
    authMode: 'guest',
    email: undefined,
    avatar: undefined,
    provider_id: undefined,
    created_at: new Date().toISOString(),
  };
}

// Save guest user to localStorage
export function saveGuestUser(user: User) {
  localStorage.setItem('guest_user', JSON.stringify(user));
  localStorage.setItem('guest_session', 'true');
}

// Check if user has guest session
export function hasGuestSession(): boolean {
  return localStorage.getItem('guest_session') === 'true';
}

// Get guest user from localStorage
export function getGuestUser(): User | null {
  const guestUser = localStorage.getItem('guest_user');
  if (!guestUser) return null;
  
  try {
    return JSON.parse(guestUser);
  } catch {
    return null;
  }
}
