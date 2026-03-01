'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase automatically handles the OAuth callback via the auth listener
    // Just redirect to game - the auth listener will handle the rest
    console.log('✅ OAuth callback - redirecting to game...');
    
    const timer = setTimeout(() => {
      router.push('/game');
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
      }}
    >
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <img
          src="/brand-assets/Lockup/Translucent.png"
          alt="Ritual"
          style={{
            width: '200px',
            height: 'auto',
            marginBottom: '2rem',
            filter: 'drop-shadow(0 0 20px rgba(64,255,175,0.4))',
          }}
        />
        
        <div
          style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(64, 255, 175, 0.2)',
            borderTop: '4px solid #40FFAF',
            borderRadius: '50%',
            margin: '0 auto 2rem',
            animation: 'spin 1s linear infinite',
          }}
        />
        
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
            color: '#40FFAF',
            marginBottom: '0.5rem',
          }}
        >
          Completing sign in...
        </h2>
        
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem' }}>
          Redirecting to game...
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
