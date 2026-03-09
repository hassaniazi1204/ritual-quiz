'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useSession } from 'next-auth/react';

interface Result {
  user_id: string;
  username: string;
  rank: number;
  final_score: number;
  balls_dropped: number;
  merges_completed: number;
  game_duration_seconds: number;
}

export default function TournamentResults() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const tournamentId = params.id as string;

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournamentCode, setTournamentCode] = useState<string>('');

  const supabase = createClient();
  const currentUserId = session?.user ? ((session.user as any).id || session.user.email) : null;

  useEffect(() => {
    if (!tournamentId) return;

    const fetchResults = async () => {
      try {
        console.log('📊 Fetching results for tournament:', tournamentId);

        // Get tournament info
        const { data: tournament, error: tournamentError } = await supabase
          .from('tournaments')
          .select('tournament_code, status')
          .eq('id', tournamentId)
          .single();

        if (tournamentError) throw tournamentError;

        setTournamentCode(tournament.tournament_code);

        // Get results (don't require 'finished' status - just check if results exist)
        const { data, error: resultsError } = await supabase
          .from('tournament_results')
          .select('*')
          .eq('tournament_id', tournamentId)
          .order('rank', { ascending: true });

        if (resultsError) throw resultsError;

        if (!data || data.length === 0) {
          // Only show error if tournament isn't finished yet
          if (tournament.status !== 'finished') {
            setError('Tournament has not ended yet');
          } else {
            setError('No results found for this tournament');
          }
          setLoading(false);
          return;
        }

        console.log('✅ Fetched results:', data);
        setResults(data);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error fetching results:', err);
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    // Subscribe to tournament status changes (in case it ends while we're waiting)
    const channel = supabase
      .channel(`results-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${tournamentId}`
        },
        (payload: any) => {
          console.log('📡 Tournament updated:', payload);
          if (payload.new.status === 'finished') {
            fetchResults();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-300 mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-300 mb-4">Error</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <button
            onClick={() => router.push('/tournaments')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  const userResult = results.find(r => r.user_id === currentUserId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏆 Tournament Results
          </h1>
          <p className="text-purple-200 text-lg">
            Code: <span className="font-mono font-bold">{tournamentCode}</span>
          </p>
        </div>

        {/* User's Result Highlight (if they participated) */}
        {userResult && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 mb-8 border-2 border-purple-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm mb-1">Your Result</p>
                <p className="text-white text-3xl font-bold">
                  #{userResult.rank} Place
                </p>
              </div>
              <div className="text-right">
                <p className="text-purple-200 text-sm mb-1">Final Score</p>
                <p className="text-white text-3xl font-bold">
                  {userResult.final_score.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-purple-900/50 rounded-lg p-6 border border-purple-500/30 backdrop-blur">
          <h2 className="text-2xl font-bold text-purple-200 mb-6">Final Rankings</h2>
          
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.user_id}
                className={`
                  flex items-center gap-4 p-4 rounded-lg transition-all
                  ${result.user_id === currentUserId 
                    ? 'bg-purple-600/40 border-2 border-purple-400' 
                    : 'bg-purple-800/30 border border-purple-700/50'
                  }
                `}
              >
                {/* Rank Badge */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  ${result.rank === 1 ? 'bg-yellow-500 text-black' : 
                    result.rank === 2 ? 'bg-gray-300 text-black' :
                    result.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-purple-700 text-purple-200'}
                `}>
                  {result.rank}
                </div>

                {/* Avatar Initial */}
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {result.username.charAt(0).toUpperCase()}
                </div>

                {/* Username and Stats */}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-lg truncate">
                    {result.username}
                    {result.user_id === currentUserId && (
                      <span className="ml-2 text-sm text-purple-300">(You)</span>
                    )}
                  </div>
                  <div className="text-purple-300 text-sm">
                    {result.balls_dropped} balls • {result.merges_completed} merges • {formatDuration(result.game_duration_seconds)}
                  </div>
                </div>

                {/* Final Score */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {result.final_score.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-300">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => router.push('/tournaments')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
          >
            Back to Tournaments
          </button>
          <button
            onClick={() => router.push('/game')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
          >
            Play Solo
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-purple-300 text-sm">
          Thanks for playing! 🎮
        </div>
      </div>
    </div>
  );
}
