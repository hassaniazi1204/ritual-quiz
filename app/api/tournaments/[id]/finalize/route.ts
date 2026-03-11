// app/api/tournaments/[id]/finalize/route.ts
//
// Industry-standard tournament finalization:
//   1. Read live scores from tournament_scores (source of truth)
//   2. Join users to get current usernames
//   3. Sort by score DESC, assign ranks
//   4. DELETE old results, INSERT fresh snapshot into tournament_results
//   5. Mark tournament status = 'finished'
//
// Called by:
//   - /api/tournaments/end  (admin ends early)
//   - play page timer       (end_time reached)
//   - submit-score route    (all players finished)
//   - PATCH cron            (pg_cron safety net)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tournamentId = params.id;
  if (!tournamentId)
    return NextResponse.json({ error: 'tournamentId required' }, { status: 400 });

  try {
    const supabase = createClient();

    // ── Guard: only finalize active tournaments ───────────────────────────────
    const { data: tournament, error: tErr } = await supabase
      .from('tournaments')
      .select('status')
      .eq('id', tournamentId)
      .single();

    if (tErr || !tournament)
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

    // Idempotent: already finished → return existing results
    if (tournament.status === 'finished') {
      const { data: existing } = await supabase
        .from('tournament_results')
        .select('user_id, username, rank, final_score')
        .eq('tournament_id', tournamentId)
        .order('rank', { ascending: true });
      return NextResponse.json({ success: true, already_finished: true, results: existing });
    }

    // ── Step 2: Query final scores ────────────────────────────────────────────
    const { data: scores, error: scoresErr } = await supabase
      .from('tournament_scores')
      .select('user_id, score, balls_dropped, merges_completed, game_duration_seconds')
      .eq('tournament_id', tournamentId)
      .order('score', { ascending: false });  // sort DESC

    if (scoresErr) throw scoresErr;
    if (!scores?.length)
      return NextResponse.json({ error: 'No scores found for this tournament' }, { status: 404 });

    // ── Step 2 cont: Join users to get usernames ──────────────────────────────
    const userIds = scores.map(s => s.user_id);
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('id, username')
      .in('id', userIds);

    if (usersErr) throw usersErr;
    const usernameMap = new Map((users || []).map(u => [u.id, u.username]));

    // ── Step 3: Assign ranks (1-based) ───────────────────────────────────────
    const results = scores.map((s, index) => ({
      tournament_id:         tournamentId,
      user_id:               s.user_id,
      username:              usernameMap.get(s.user_id) || 'Unknown',  // snapshot
      rank:                  index + 1,                                 // 1, 2, 3…
      final_score:           s.score,
      balls_dropped:         s.balls_dropped         ?? 0,
      merges_completed:      s.merges_completed      ?? 0,
      game_duration_seconds: s.game_duration_seconds ?? 0,
    }));

    // ── Step 4: DELETE old results, INSERT fresh snapshot ────────────────────
    // Delete first to avoid stale rows from previous (partial) finalizations
    const { error: delErr } = await supabase
      .from('tournament_results')
      .delete()
      .eq('tournament_id', tournamentId);

    if (delErr) throw delErr;

    const { error: insErr } = await supabase
      .from('tournament_results')
      .insert(results);

    if (insErr) throw insErr;

    // ── Step 5: Mark tournament finished ─────────────────────────────────────
    const { error: updErr } = await supabase
      .from('tournaments')
      .update({
        status:    'finished',
        ended_at:  new Date().toISOString(),
      })
      .eq('id', tournamentId);

    if (updErr) throw updErr;

    console.log(`[finalize] Tournament ${tournamentId} finalized. ${results.length} results written.`);

    return NextResponse.json({ success: true, results });

  } catch (err: any) {
    console.error('[finalize] error:', err.message);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
