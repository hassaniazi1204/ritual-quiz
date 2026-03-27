'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type View = 'home' | 'create' | 'join';

export default function TournamentHubPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [view, setView] = useState<View>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [tournamentName, setTournamentName] = useState('');
  const [duration, setDuration] = useState(5);
  const [maxPlayers, setMaxPlayers] = useState(10);

  // Join form
  const [tournamentCode, setTournamentCode] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/tournaments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tournamentName, duration_minutes: duration, max_players: maxPlayers }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create'); setLoading(false); return; }
      router.push(`/tournament/${data.tournament.id}`);
    } catch { setError('Failed to create tournament'); setLoading(false); }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/tournaments/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournament_code: tournamentCode.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to join'); setLoading(false); return; }
      router.push(`/tournament/${data.tournament_id}`);
    } catch { setError('Failed to join tournament'); setLoading(false); }
  };

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-10 h-10 border-2 border-[#40FFAF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black px-4 py-12">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          {view !== 'home' ? (
            <button
              onClick={() => { setView('home'); setError(null); }}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back
            </button>
          ) : (
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Home
            </button>
          )}
          <p className="text-xs font-bold text-[#40FFAF] uppercase tracking-[0.2em] mb-2">Arena</p>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {view === 'home'   && 'Tournaments'}
            {view === 'create' && 'Create Tournament'}
            {view === 'join'   && 'Join Tournament'}
          </h1>
        </div>

        {/* Home — two cards */}
        {view === 'home' && (
          <div className="space-y-3">
            <button
              onClick={() => setView('create')}
              className="w-full text-left p-6 rounded-2xl border border-white/8 bg-white/2 hover:bg-white/5 hover:border-[#8840FF]/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-5">
                <span className="text-4xl">🎮</span>
                <div className="flex-1">
                  <h2 className="text-white font-black text-xl tracking-tight">Create Tournament</h2>
                  <p className="text-white/40 text-sm mt-0.5">Host and invite players with a code</p>
                </div>
                <svg className="text-white/20 group-hover:text-[#8840FF] transition-colors flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </button>

            <button
              onClick={() => setView('join')}
              className="w-full text-left p-6 rounded-2xl border border-white/8 bg-white/2 hover:bg-white/5 hover:border-[#40FFAF]/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-5">
                <span className="text-4xl">🎯</span>
                <div className="flex-1">
                  <h2 className="text-white font-black text-xl tracking-tight">Join Tournament</h2>
                  <p className="text-white/40 text-sm mt-0.5">Enter a code to join an existing game</p>
                </div>
                <svg className="text-white/20 group-hover:text-[#40FFAF] transition-colors flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </button>
          </div>
        )}

        {/* Create form */}
        {view === 'create' && (
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                Tournament Name
              </label>
              <Input
                value={tournamentName}
                onChange={e => setTournamentName(e.target.value)}
                placeholder="Enter a name"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                  Duration (min)
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value))}
                  min={1} max={60}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                  Max Players
                </label>
                <Input
                  type="number"
                  value={maxPlayers}
                  onChange={e => setMaxPlayers(parseInt(e.target.value))}
                  min={2} max={50}
                  required
                />
              </div>
            </div>
            {error && (
              <p className="text-red-400 text-sm px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20">
                {error}
              </p>
            )}
            <Button variant="purple" size="md" className="w-full" disabled={loading}>
              {loading ? 'Creating…' : 'Create Tournament'}
            </Button>
          </form>
        )}

        {/* Join form */}
        {view === 'join' && (
          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                Tournament Code
              </label>
              <Input
                value={tournamentCode}
                onChange={e => setTournamentCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="XXXXXX"
                className="text-center font-mono text-2xl font-black tracking-[0.3em] h-16"
                maxLength={6}
                required
              />
              <p className="text-right text-xs text-white/25 mt-1.5">{tournamentCode.length}/6</p>
            </div>
            {error && (
              <p className="text-red-400 text-sm px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20">
                {error}
              </p>
            )}
            <Button
              variant="primary"
              size="md"
              className="w-full"
              disabled={loading || tournamentCode.length !== 6}
            >
              {loading ? 'Joining…' : 'Join Tournament'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
