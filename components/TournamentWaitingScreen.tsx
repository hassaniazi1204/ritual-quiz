'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface TournamentWaitingScreenProps {
  tournamentId: string;
  playerScore: number;
  playerUsername: string;
}

export default function TournamentWaitingScreen({
  tournamentId,
  playerScore,
  playerUsername,
}: TournamentWaitingScreenProps) {
  const router = useRouter();
  const supabase = createClient();
  const [tournament, setTournament] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check tournament status
  const checkTournamentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error) {
        console.error('Error fetching tournament:', error);
        return;
      }

      setTournament(data);

      // If tournament is finished, redirect to results
      if (data.status === 'finished') {
        console.log('Tournament finished - redirecting to results');
        router.push(`/tournament/${tournamentId}/results`);
        return;
      }

      // Calculate time remaining
      if (data.status === 'active' && data.started_at) {
        const startTime = new Date(data.started_at).getTime();
        const durationMs = data.duration_minutes * 60 * 1000;
        const endTime = startTime + durationMs;
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        setTimeRemaining(remaining);

        if (remaining === 0) {
          // Tournament time is up, check again soon
          setTimeout(checkTournamentStatus, 2000);
        }
      }

      setChecking(false);
    } catch (error) {
      console.error('Error checking tournament:', error);
      setChecking(false);
    }
  };

  // Initial check and periodic polling
  useEffect(() => {
    checkTournamentStatus();
    const interval = setInterval(checkTournamentStatus, 3000); // Check every 3 seconds
    
    return () => clearInterval(interval);
  }, [tournamentId]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining === 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Real-time subscription to tournament changes
  useEffect(() => {
    const channel = supabase
      .channel(`tournament:${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${tournamentId}`,
        },
        (payload) => {
          console.log('Tournament updated:', payload);
          const newStatus = (payload.new as any).status;
          if (newStatus === 'finished') {
            router.push(`/tournament/${tournamentId}/results`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <div className="text-white text-xl font-bold">Checking tournament status...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900 p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-black/60 backdrop-blur-lg border-2 border-purple-500/30 rounded-3xl p-8 sm:p-12 text-center">
          {/* Icon */}
          <div className="text-8xl mb-6 animate-bounce">
            🎮
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Game Complete!
          </h1>

          {/* Your Score */}
          <div className="mb-8">
            <div className="text-gray-400 text-sm mb-2">Your Final Score</div>
            <div className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {playerScore.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              Great job, {playerUsername}! 🎉
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mb-8" />

          {/* Tournament Status */}
          <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-6 mb-8">
            <div className="text-yellow-400 text-lg font-bold mb-3">
              ⏳ Tournament Still in Progress
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Other players are still competing. The final leaderboard and rankings will be revealed when the tournament ends.
            </p>

            {/* Time Remaining */}
            {timeRemaining !== null && timeRemaining > 0 && (
              <div className="mt-4">
                <div className="text-gray-400 text-xs mb-2">Time Remaining</div>
                <div className={`text-4xl font-black font-mono ${
                  timeRemaining <= 60 ? 'text-red-400 animate-pulse' :
                  timeRemaining <= 300 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  ⏱️ {formatTime(timeRemaining)}
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-left">
            <div className="text-white font-bold mb-3 flex items-center gap-2">
              <span>ℹ️</span>
              <span>What happens next?</span>
            </div>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>You'll automatically be redirected to the results page when the tournament ends</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>The host can also end the tournament early if all players finish</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Your score has been recorded and will be ranked against other players</span>
              </li>
            </ul>
          </div>

          {/* Loading Animation */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <div className="text-gray-400 text-sm mt-2">
            Waiting for tournament to finish...
          </div>
        </div>

        {/* Tournament Info Footer */}
        {tournament && (
          <div className="mt-6 text-center">
            <div className="text-gray-400 text-sm">
              Tournament: <span className="text-white font-bold">{tournament.name}</span>
            </div>
            <div className="text-gray-500 text-xs mt-1">
              ID: {tournamentId.slice(0, 8)}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
