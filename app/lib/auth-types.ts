// Authentication types and utilities
// app/lib/auth-types.ts

export type AuthMode = 'guest' | 'google' | 'discord';

export interface User {
  id: string;
  username: string;
  authMode: AuthMode;
  email?: string;
  avatar?: string;
  provider_id?: string; // Google/Discord user ID
  created_at?: string;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
}

// Helper to determine if user is authenticated
export function isAuthenticated(session: AuthSession): boolean {
  return session.isAuthenticated && session.user !== null;
}

// Helper to get display name
export function getDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return user.username || 'Player';
}

// Helper to generate guest user
export function createGuestUser(username: string): User {
  return {
    id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username: username.trim(),
    authMode: 'guest',
  };
}
