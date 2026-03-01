'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuth } from '../../lib/supabase-auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔍 Processing OAuth callback...');
        
        // Supabase automatically handles the OAuth callback
        // Just check if session was established
        const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!session) {
          console.error('No session found after OAuth');
          throw new Error('No session established');
        }

        console.log('✅ OAuth successful:', {
          email: session.user.email,
          provider: session.user.app_metadata.provider
        });

        setStatus('success');
        
        // Redirect to game - the auth listener will handle the rest
        setTimeout(() => {
          router.push('/game');
        }, 1000);
        
      } catch (err) {
        console.error('❌ Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
        
        setTimeout(() => {
          router.push('/game');
        }, 3000);
      }
    };

    handleCallback();
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
      <div style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px' }}>
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

        {status === 'processing' && (
          <>
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
              Signing you in...
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem' }}>
              Please wait a moment
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
                color: '#40FFAF',
                marginBottom: '0.5rem',
              }}
            >
              Successfully signed in!
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem' }}>
              Redirecting to game...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
                color: '#FF5757',
                marginBottom: '0.5rem',
              }}
            >
              Authentication Failed
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem', marginBottom: '1rem' }}>
              {error || 'Something went wrong'}
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.9rem' }}>
              Redirecting to game...
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
