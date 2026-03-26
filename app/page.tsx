'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import PlayModeModal from '@/components/PlayModeModal';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);
  const [showPlayModal, setShowPlayModal] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => { setLoaded(true); }, []);

  useEffect(() => {
    if (status === 'loading') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('play') === 'true') {
      setShowPlayModal(true);
      window.history.replaceState({}, '', '/');
    }
  }, [status]);

  return (
    <main
      className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden"
      style={{
        backgroundImage: 'url(/brand-assets/Patterns/Wormhole.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* ── Top bar ── */}
      {status === 'authenticated' && (
        <div className="relative z-10 w-full flex justify-end items-center gap-3 px-6 py-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/leaderboard/solo">🏆 Leaderboard</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Sign Out
          </Button>
        </div>
      )}

      {/* ── Main content ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-6 pb-8 text-center"
        style={{ paddingTop: status === 'authenticated' ? '24px' : '80px' }}
      >
        {/* Logo */}
        <div
          className="mb-12 transition-all duration-700"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(-20px)',
          }}
        >
          <img
            src="/brand-assets/Lockup/Translucent.png"
            alt="Ritual"
            style={{
              width: 'clamp(180px, 28vw, 380px)',
              height: 'auto',
              display: 'block',
              margin: '0 auto',
              filter: 'drop-shadow(0 0 32px rgba(64,255,175,0.3))',
            }}
          />
        </div>

        {/* Heading */}
        <div
          className="mb-5 transition-all duration-700 delay-200"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <h1
            className="text-white font-black leading-none tracking-tight"
            style={{ fontSize: 'clamp(1.9rem, 5vw, 3.8rem)', letterSpacing: '-0.03em' }}
          >
            The state of AI is flawed.
          </h1>
        </div>

        {/* Sub-heading */}
        <div
          className="mb-10 max-w-2xl transition-all duration-700 delay-300"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', lineHeight: 1.65 }}>
            <span className="font-semibold" style={{ color: '#40FFAF' }}>
              Ritual is the solution.
            </span>{' '}
            <span className="text-white/70 font-normal">
              It brings AI to every protocol and app with just a few lines of code.
            </span>
          </p>
        </div>

        {/* Welcome back */}
        {status === 'authenticated' && session?.user && (
          <div
            className="mb-8 px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity duration-700"
            style={{
              opacity: loaded ? 1 : 0,
              background: 'rgba(64,255,175,0.08)',
              border: '1px solid rgba(64,255,175,0.25)',
              color: '#40FFAF',
            }}
          >
            Welcome back, {session.user.name || session.user.email?.split('@')[0]} 👋
          </div>
        )}

        {/* CTA Buttons */}
        <div
          className="flex flex-wrap gap-4 justify-center transition-all duration-700 delay-500"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <Button asChild variant="primary" size="xl">
            <Link href="/quiz">Start Quiz</Link>
          </Button>

          <Button
            variant="purple"
            size="xl"
            onClick={() => setShowPlayModal(true)}
          >
            Play Game
          </Button>

          <Button asChild variant="primary" size="xl"
            className="bg-gradient-to-r from-[#40FFAF] to-[#8840FF] text-black hover:opacity-90 hover:shadow-[0_0_28px_rgba(136,64,255,0.45)]"
          >
            <Link href="/siggychat">😼 SiggyChat</Link>
          </Button>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 w-full flex flex-wrap justify-center items-center gap-8 px-6 py-8 transition-opacity duration-700 delay-700"
        style={{
          opacity: loaded ? 1 : 0,
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {[
          { label: 'ritual.net',            href: 'https://ritual.net/' },
          { label: 'ritualfoundation.org',   href: 'https://www.ritualfoundation.org/' },
          { label: '@ritualnet',             href: 'https://x.com/ritualnet' },
          { label: '@ritualfnd',             href: 'https://x.com/ritualfnd' },
        ].map(link => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/45 text-sm font-medium hover:text-[#40FFAF] transition-colors duration-200"
            style={{ letterSpacing: '0.02em' }}
          >
            {link.label}
          </a>
        ))}
      </footer>

      <PlayModeModal
        isOpen={showPlayModal}
        onClose={() => setShowPlayModal(false)}
        isAuthenticated={status === 'authenticated'}
      />
    </main>
  );
}
