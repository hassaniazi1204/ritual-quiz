// app/api/leaderboard/route.ts
// Solo play leaderboard — top 20 enforced server-side.
// Resolves user via session → nextauth_id → users.id (uuid).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

// Get or create users row, return users.id (uuid)
async function resolveUserId(supabase: any, session: any): Promise<string | null> {
  const nextauthId = (session.user as any).id || session.user.email;
  if (!nextauthId) return null;

  const username = session.user.name || session.user.email?.split('@')[0] || 'Player';

  // Try to find existing user first
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('nextauth_id', nextauthId)
    .single();

  if (existing) return existing.id;

  // Create new user row
  const { data: created, error } = await supabase
    .from('users')
    .insert({ nextauth_id: nextauthId, username, email: session.user.email, avatar: session.user.image })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create user:', error);
    return null;
  }
  return created.id;
}

// ─── GET: Fetch top 20 ───────────────────────────────────────────────────────
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: scores, error } = await supabase
      .from('solo_scores')
      .select(`id, score, created_at, users ( username )`)
      .order('score', { ascending: false })
      .limit(20);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const leaderboard = (scores || []).map((row: any) => ({
      id:         row.id,
      username:   row.users?.username ?? 'Unknown',
      score:      row.score,
      created_at: row.created_at,
    }));

    return NextResponse.json({ success: true, data: leaderboard });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST: Submit solo score ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const body = await request.json();
    // Support both new format { score, game_metrics } and MergeGame's { username, score }
    const score       = body.score;
    const game_metrics = body.game_metrics || {};

    if (typeof score !== 'number' || score < 0)
      return NextResponse.json({ error: 'Valid score required' }, { status: 400 });

    const { balls_dropped = 0, merges_completed = 0 } = game_metrics;
    if (merges_completed > balls_dropped && balls_dropped > 0)
      return NextResponse.json({ error: 'Invalid game metrics' }, { status: 400 });

    const userId = await resolveUserId(supabase, session);
    if (!userId) return NextResponse.json({ error: 'Failed to resolve user' }, { status: 500 });

    // Check current top-20 threshold
    const { data: currentTop20 } = await supabase
      .from('solo_scores')
      .select('id, score')
      .order('score', { ascending: false })
      .limit(20);

    const isTop20Full      = (currentTop20?.length ?? 0) >= 20;
    const lowestTop20Score = isTop20Full ? currentTop20![currentTop20!.length - 1].score : -1;

    if (score <= lowestTop20Score && isTop20Full)
      return NextResponse.json({ success: true, ranked: false, threshold: lowestTop20Score });

    const { error: insertError } = await supabase
      .from('solo_scores')
      .insert({ user_id: userId, score });

    if (insertError) throw insertError;

    if (isTop20Full) {
      await supabase.from('solo_scores').delete().eq('id', currentTop20![currentTop20!.length - 1].id);
    }

    return NextResponse.json({ success: true, ranked: true }, { status: 201 });
  } catch (err: any) {
    console.error('Leaderboard POST error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
