// app/api/leaderboard/route.ts — Solo leaderboard (top 20, server-enforced)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

async function resolveUserId(supabase: any, session: any): Promise<string | null> {
  const nextauthId = (session.user as any).id || session.user.email;
  if (!nextauthId) {
    console.error('[resolveUserId] no nextauthId — session.user:', JSON.stringify(session.user));
    return null;
  }
  const username = session.user.name || session.user.email?.split('@')[0] || 'Player';

  // Find existing user
  const { data: existing, error: findErr } = await supabase
    .from('users').select('id').eq('nextauth_id', nextauthId).maybeSingle();
  if (findErr) console.error('[resolveUserId] find error:', findErr.message);
  if (existing) return existing.id;

  // Create new user
  const { data: created, error } = await supabase
    .from('users')
    .insert({ nextauth_id: nextauthId, username, email: session.user.email, avatar: session.user.image })
    .select('id').single();

  if (error) {
    console.error('[resolveUserId] insert failed:', {
      message: error.message,
      code:    error.code,
      details: error.details,
      hint:    error.hint,
      nextauthId,
      hasUrl:  !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey:  !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    return null;
  }
  return created?.id ?? null;
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data: scores, error } = await supabase
      .from('solo_scores')
      .select('id, score, created_at, users ( username )')
      .order('score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[leaderboard GET]', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const leaderboard = (scores || []).map((row: any) => ({
      id:         row.id,
      username:   row.users?.username ?? 'Unknown',
      score:      row.score,
      created_at: row.created_at,
    }));

    return NextResponse.json({ success: true, data: leaderboard });
  } catch (err: any) {
    console.error('[leaderboard GET] exception:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const body = await request.json();
    const score = typeof body.score === 'number' ? body.score : null;

    if (score === null || score < 0)
      return NextResponse.json({ error: 'Valid score required' }, { status: 400 });

    // Anti-cheat (ChatGPT Step 7)
    const { balls_dropped = 0, merges_completed = 0 } = body.game_metrics || {};
    if (merges_completed > balls_dropped && balls_dropped > 0)
      return NextResponse.json({ error: 'Invalid game metrics' }, { status: 400 });

    const userId = await resolveUserId(supabase, session);
    if (!userId) {
      console.error('[leaderboard POST] resolveUserId failed', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nextauthId: (session.user as any).id,
      });
      return NextResponse.json({ error: 'Failed to resolve user' }, { status: 500 });
    }

    // Top-20 gate
    const { data: top20 } = await supabase
      .from('solo_scores').select('id, score')
      .order('score', { ascending: false }).limit(20);

    const full      = (top20?.length ?? 0) >= 20;
    const threshold = full ? top20![top20!.length - 1].score : -1;

    if (score <= threshold && full)
      return NextResponse.json({ success: true, ranked: false, threshold });

    const { error: ins } = await supabase.from('solo_scores').insert({ user_id: userId, score });
    if (ins) { console.error('[leaderboard POST] insert:', ins.message); throw ins; }

    if (full) await supabase.from('solo_scores').delete().eq('id', top20![top20!.length - 1].id);

    return NextResponse.json({ success: true, ranked: true }, { status: 201 });
  } catch (err: any) {
    console.error('[leaderboard POST] exception:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
