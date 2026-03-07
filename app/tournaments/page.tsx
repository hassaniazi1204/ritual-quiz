'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function TournamentHubPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tournament creation form
  const [tournamentName, setTournamentName] = useState('');
  const [duration, setDuration] = useState(5);
  const [maxPlayers, setMaxPlayers] = useState(10);

  // Tournament join form
  const [tournamentCode, setTournamentCode] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tournaments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tournamentName,
          duration_minutes: duration,
          max_players: maxPlayers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create tournament');
        setLoading(false);
        return;
      }

      // Redirect to tournament lobby
      router.push(`/tournament/${data.tournament.id}`);
    } catch (err) {
      console.error('Create error:', err);
      setError('Failed to create tournament');
      setLoading(false);
    }
  };

  const handleJoinTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tournaments/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournament_code: tournamentCode.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to join tournament');
        setLoading(false);
        return;
      }

      // Redirect based on tournament status
      router.push(`/tournament/${data.tournament_id}`);
    } catch (err) {
      console.error('Join error:', err);
      setError('Failed to join tournament');
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🏆 Tournaments
          </h1>
          <p className="text-gray-400 text-lg">Create or join a tournament to compete</p>
        </div>

        {/* Main Options */}
        {!showCreateForm && !showJoinForm && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Tournament Card */}
            <div
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500/30 hover:border-purple-500 rounded-3xl p-8 cursor-pointer transition-all hover:scale-105 group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎮</div>
              <h2 className="text-3xl font-black text-white mb-2">Create Tournament</h2>
              <p className="text-gray-400 mb-6">
                Host a new tournament and invite players with a code
              </p>
              <div className="flex items-center text-purple-400 font-bold">
                <span>Get Started</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Join Tournament Card */}
            <div
              onClick={() => setShowJoinForm(true)}
              className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-2 border-blue-500/30 hover:border-blue-500 rounded-3xl p-8 cursor-pointer transition-all hover:scale-105 group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
              <h2 className="text-3xl font-black text-white mb-2">Join Tournament</h2>
              <p className="text-gray-400 mb-6">
                Enter a tournament code to join an existing tournament
              </p>
              <div className="flex items-center text-blue-400 font-bold">
                <span>Enter Code</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Create Tournament Form */}
        {showCreateForm && (
          <div className="bg-gray-900/80 backdrop-blur-lg border-2 border-purple-500/30 rounded-3xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-white">Create Tournament</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Tournament Name</label>
                <input
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="Enter tournament name"
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min={1}
                  max={60}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Max Players</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                  min={2}
                  max={50}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 focus:border-purple-500 rounded-xl text-white outline-none transition-colors"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </button>
            </form>
          </div>
        )}

        {/* Join Tournament Form */}
        {showJoinForm && (
          <div className="bg-gray-900/80 backdrop-blur-lg border-2 border-blue-500/30 rounded-3xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-white">Join Tournament</h2>
              <button
                onClick={() => setShowJoinForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleJoinTournament} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Tournament Code</label>
                <input
                  type="text"
                  value={tournamentCode}
                  onChange={(e) => setTournamentCode(e.target.value.toUpperCase().slice(0, 8))}
                  placeholder="Enter 8-digit code"
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 focus:border-blue-500 rounded-xl text-white text-center text-2xl font-mono font-bold outline-none transition-colors uppercase"
                  maxLength={8}
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || tournamentCode.length !== 8}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Joining...' : 'Join Tournament'}
              </button>
            </form>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
