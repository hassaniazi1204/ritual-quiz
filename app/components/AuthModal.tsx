// Authentication Modal Component
// app/components/AuthModal.tsx

'use client';

import React, { useState } from 'react';
import { signInWithGoogle, signInWithDiscord } from '../lib/supabase-auth';

interface AuthModalProps {
  onGuestLogin: (username: string) => void;
  onClose?: () => void;
}

export default function AuthModal({ onGuestLogin, onClose }: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState<'google' | 'discord' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGuestLogin = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    setError(null);
    onGuestLogin(username.trim());
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading('google');
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      setLoading(null);
    }
  };

  const handleDiscordLogin = async () => {
    try {
      setLoading('discord');
      setError(null);
      await signInWithDiscord();
    } catch (err) {
      setError('Failed to sign in with Discord. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.95), rgba(0, 0, 0, 0.95))',
          border: '2px solid rgba(64, 255, 175, 0.3)',
          borderRadius: '24px',
          padding: '2.5rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 0 60px rgba(64, 255, 175, 0.3), inset 0 0 40px rgba(64, 255, 175, 0.05)',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/brand-assets/Lockup/Translucent.png"
            alt="Ritual"
            style={{
              width: 'clamp(150px, 60%, 280px)',
              height: 'auto',
              display: 'inline-block',
              filter: 'drop-shadow(0 0 20px rgba(64,255,175,0.4))',
            }}
          />
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 800,
            fontFamily: "'Barlow-ExtraBold', 'Barlow', sans-serif",
            color: '#40FFAF',
            textAlign: 'center',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Welcome to SiggyDrop!
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '0.95rem',
            fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
            color: '#E7E7E7',
            textAlign: 'center',
            marginBottom: '2rem',
            lineHeight: 1.5,
          }}
        >
          Sign in to save your progress and compete
        </p>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: 'rgba(255, 87, 87, 0.15)',
              border: '1px solid rgba(255, 87, 87, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem',
              color: '#FF5757',
              fontSize: '0.9rem',
              fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Social Login Buttons */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleGoogleLogin}
            disabled={loading !== null}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
              background: '#FFFFFF',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              cursor: loading !== null ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              opacity: loading !== null ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (loading === null) {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
          </button>

          <button
            onClick={handleDiscordLogin}
            disabled={loading !== null}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
              background: '#5865F2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              cursor: loading !== null ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              opacity: loading !== null ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (loading === null) {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            {loading === 'discord' ? 'Signing in...' : 'Continue with Discord'}
          </button>
        </div>

        {/* Divider */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.95)',
              padding: '0 1rem',
              fontSize: '0.85rem',
              fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            OR
          </span>
        </div>

        {/* Guest Mode */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.9rem',
              fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
              color: '#40FFAF',
              marginBottom: '0.5rem',
            }}
          >
            Play as Guest
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && username.trim().length > 0) {
                handleGuestLogin();
              }
            }}
            placeholder="Enter username"
            maxLength={50}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              fontSize: '1.1rem',
              fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(64, 255, 175, 0.3)',
              borderRadius: '12px',
              color: '#FFFFFF',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            autoFocus
          />
          <div
            style={{
              fontSize: '0.75rem',
              fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
              color: username.length > 40 ? '#FF5757' : 'rgba(255, 255, 255, 0.4)',
              marginTop: '0.5rem',
              textAlign: 'right',
            }}
          >
            {username.length}/50
          </div>
        </div>

        {/* Guest Login Button */}
        <button
          onClick={handleGuestLogin}
          disabled={username.trim().length === 0 || loading !== null}
          style={{
            width: '100%',
            padding: '1rem 1.5rem',
            fontSize: '1.1rem',
            fontWeight: 700,
            fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
            color: username.trim().length === 0 ? 'rgba(255, 255, 255, 0.3)' : '#000000',
            background: username.trim().length === 0
              ? 'rgba(255, 255, 255, 0.1)'
              : 'linear-gradient(135deg, #40FFAF 0%, #077345 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: username.trim().length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: username.trim().length === 0 ? 'none' : '0 0 30px rgba(64, 255, 175, 0.4)',
            opacity: username.trim().length === 0 ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (username.trim().length > 0) {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          {username.trim().length === 0 ? '⚠️ Username Required' : '🎮 Play as Guest'}
        </button>

        {/* Info Text */}
        <p
          style={{
            fontSize: '0.8rem',
            fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
            marginTop: '1.5rem',
            lineHeight: 1.4,
          }}
        >
          Guest scores are saved but cannot be synced across devices.
          <br />
          Sign in with Google or Discord to save your progress!
        </p>
      </div>
    </div>
  );
}
