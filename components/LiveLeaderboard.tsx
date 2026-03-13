'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Entry {
  user_id: string;
  username: string;
  score: number;
  finished: boolean;
}

interface Props {
  tournamentId: string;
  currentUserId?: string;
  compact?: boolean;
  // When true (results page): show all players, no top-10 cap
  showAll?: boolean;
}

// ── Animated score counter ────────────────────────────────────────────────────
function AnimatedScore({ value, compact, isMe }: { value: number; compact: boolean; isMe: boolean }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current;
    const delta = value - start;
    const duration = Math.min(600, Math.abs(delta) / 10 + 200);
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + delta * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = value;
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span className={`
      font-black tabular-nums flex-shrink-0
      ${compact ? 'text-sm' : 'text-base'}
      ${isMe ? 'text-purple-200' : 'text-gray-300'}
    `}>
      {display.toLocaleString()}
    </span>
  );
}

// ── Rank badge ────────────────────────────────────────────────────────────────
function RankBadge({ rank, compact }: { rank: number; compact: boolean }) {
  const style =
    rank === 1 ? 'bg-yellow-400 text-black'  :
    rank === 2 ? 'bg-slate-300 text-black'   :
    rank === 3 ? 'bg-amber-600 text-white'   :
                 'bg-purple-900/80 text-purple-300';

  return (
    <div className={`
      rounded-full flex items-center justify-center font-black flex-shrink-0
      ${compact ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm'}
      ${style}
    `}>
      {rank}
    </div>
  );
}

// ── Single leaderboard row ────────────────────────────────────────────────────
function LeaderboardRow({
  entry,
  rank,
  isMe,
  compact,
  isSeparator = false,
}: {
  entry: Entry;
  rank: number;
  isMe: boolean;
  compact: boolean;
  isSeparator?: boolean;
}) {
  return (
    <motion.div
      key={entry.user_id}
      layout="position"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{
        layout:  { type: 'spring', stiffness: 500, damping: 40 },
        opacity: { duration: 0.2 },
      }}
      className={`
        flex items-center gap-2 rounded-lg select-none
        ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}
        ${isSeparator ? 'mt-1 border-t border-purple-500/20 pt-2' : ''}
        ${isMe
          // Current player highlight: purple border + slightly brighter bg
          ? 'bg-purple-600/30 border border-purple-400/70 shadow-sm shadow-purple-600/20'
          : 'bg-white/5 border border-transparent'
        }
      `}
    >
      <RankBadge rank={rank} compact={compact} />

      {/* Avatar initial */}
      <div className={`
        rounded-full bg-gradient-to-br from-purple-500 to-pink-600
        flex items-center justify-center text-white font-bold flex-shrink-0
        ${compact ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm'}
      `}>
        {entry.username.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span className={`
          truncate font-medium
          ${compact ? 'text-xs' : 'text-sm'}
          ${isMe ? 'text-purple-200 font-bold' : 'text-gray-200'}
        `}>
          {entry.username}
          {isMe && <span className="ml-1 text-purple-400 font-normal">(You)</span>}
          {entry.finished && <span className="ml-1 text-green-400 text-xs">✓</span>}
        </span>
      </div>

      <AnimatedScore value={entry.score} compact={compact} isMe={isMe} />
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LiveLeaderboard({
  tournamentId,
  currentUserId,
  compact = false,
  showAll  = false,
}: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Stable supabase instance — never recreated on re-render
  const supabaseRef   = useRef(createClient());
  const supabase      = supabaseRef.current;
  const updateBuffer  = useRef<Map<string, any>>(new Map());
  const updateTimer   = useRef<NodeJS.Timeout | null>(null);

  // ── Initial data load ─────────────────────────────────────────────────────
  const initialLoad = useCallback(async () => {
    try {
      const { data: scores, error: scoresError } = await supabase
        .from('tournament_scores')
        .select('user_id, score, finished')
        .eq('tournament_id', tournamentId)
        .order('score', { ascending: false });

      if (scoresError) throw scoresError;
      if (!scores?.length) { setLoading(false); return; }

      const userIds = scores.map(s => s.user_id);
      const { data: users } = await supabase
        .from('users').select('id, username').in('id', userIds);

      const nameMap = new Map((users || []).map(u => [u.id, u.username]));

      setEntries(scores.map(s => ({
        user_id:  s.user_id,
        username: nameMap.get(s.user_id) || 'Player',
        score:    s.score,
        finished: s.finished,
      })));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [tournamentId, supabase]);

  // ── Realtime patch (batched 200ms) ────────────────────────────────────────
  const patchEntry = useCallback((payload: any) => {
    const updated = payload.new;
    if (!updated) return;

    updateBuffer.current.set(updated.user_id, updated);
    if (updateTimer.current) return;

    updateTimer.current = setTimeout(() => {
      const buffered = Array.from(updateBuffer.current.values());
      updateBuffer.current.clear();
      updateTimer.current = null;

      setEntries(prev => {
        let next = [...prev];
        buffered.forEach(u => {
          const idx = next.findIndex(e => e.user_id === u.user_id);
          if (idx !== -1) {
            next[idx] = {
              ...next[idx],
              score:    u.score    ?? next[idx].score,
              finished: u.finished ?? next[idx].finished,
            };
          } else {
            // New player — username will show as Player until next full load
            next.push({ user_id: u.user_id, username: 'Player', score: u.score ?? 0, finished: u.finished ?? false });
          }
        });
        return next.sort((a, b) => b.score - a.score);
      });
    }, 200);
  }, []);

  useEffect(() => {
    initialLoad();
    const ch = supabase
      .channel(`leaderboard:${tournamentId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tournament_scores', filter: `tournament_id=eq.${tournamentId}` }, patchEntry)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tournament_scores', filter: `tournament_id=eq.${tournamentId}` }, patchEntry)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
      if (updateTimer.current) clearTimeout(updateTimer.current);
    };
  }, [tournamentId, initialLoad, patchEntry, supabase]);

  // ── Display logic ─────────────────────────────────────────────────────────
  //
  // showAll=true  (results page): all entries, no cap
  // showAll=false (live play):
  //   top10 = entries[0..9]
  //   if currentUser is outside top10, append them as an extra row with a separator
  //   if currentUser is inside top10, just show top10 (no duplicate)

  const sorted = entries; // already sorted desc by score

  let displayRows: { entry: Entry; rank: number; isMe: boolean; isSeparator: boolean }[] = [];

  if (showAll) {
    displayRows = sorted.map((e, i) => ({
      entry: e, rank: i + 1, isMe: e.user_id === currentUserId, isSeparator: false,
    }));
  } else {
    const top10 = sorted.slice(0, 10);
    displayRows = top10.map((e, i) => ({
      entry: e, rank: i + 1, isMe: e.user_id === currentUserId, isSeparator: false,
    }));

    // Check if current player is outside top 10
    if (currentUserId) {
      const playerRank = sorted.findIndex(e => e.user_id === currentUserId);
      const inTop10    = playerRank !== -1 && playerRank < 10;

      if (!inTop10 && playerRank !== -1) {
        const playerEntry = sorted[playerRank];
        displayRows.push({
          entry:       playerEntry,
          rank:        playerRank + 1,
          isMe:        true,
          isSeparator: true, // adds visual separator above this row
        });
      }
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className={`bg-purple-900/30 rounded-xl border border-purple-500/20 ${compact ? 'p-3' : 'p-6'}`}>
      <Header compact={compact} />
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    </div>
  );

  if (error) return (
    <div className={`bg-purple-900/30 rounded-xl border border-purple-500/20 ${compact ? 'p-3' : 'p-6'}`}>
      <Header compact={compact} />
      <div className="text-center text-red-400 py-4 text-sm">
        {error}
        <br />
        <button onClick={initialLoad} className="mt-2 px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className={`bg-purple-900/30 rounded-xl border border-purple-500/20 ${compact ? 'p-3' : 'p-6'}`}>
      <Header compact={compact} />

      {displayRows.length === 0 ? (
        <p className={`text-center text-gray-400 ${compact ? 'py-4 text-sm' : 'py-8'}`}>
          Waiting for players to start...
        </p>
      ) : (
        <motion.div layout className={compact ? 'space-y-1' : 'space-y-2'}>
          <AnimatePresence initial={false}>
            {displayRows.map(({ entry, rank, isMe, isSeparator }) => (
              <LeaderboardRow
                key={entry.user_id}
                entry={entry}
                rank={rank}
                isMe={isMe}
                compact={compact}
                isSeparator={isSeparator}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <p className="mt-3 text-center text-xs text-gray-600">
        Updates automatically in real-time
      </p>
    </div>
  );
}

function Header({ compact }: { compact: boolean }) {
  return (
    <h3 className={`font-bold text-purple-300 mb-3 flex items-center gap-2 ${compact ? 'text-sm' : 'text-lg'}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      Live Leaderboard
    </h3>
  );
}
