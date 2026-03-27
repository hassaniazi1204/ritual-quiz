// app/api/tournaments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function resolveUserId(supabase: any, session: any): Promise<string | null> {
  const nextauthId = (session.user as any).id || session.user.email;
  if (!nextauthId) {
    console.error('[resolveUserId] no nextauthId in session:', JSON.stringify(session.user));
    return null;
  }

  // 1. Try to find existing user
  const { data: existing, error: findErr } = await supabase
    .from('users')
    .select('id')
    .eq('nextauth_id', nextauthId)
    .maybeSingle();

  if (findErr) console.error('[resolveUserId] find error:', findErr.message);
  if (existing) return existing.id;

  // 2. Insert new user
  const username = session.user.name || session.user.email?.split('@')[0] || 'Player';
  const { data: created, error: insertErr } = await supabase
    .from('users')
    .insert({
      nextauth_id: nextauthId,
      username,
      email:  session.user.email,
      avatar: session.user.image,
    })
    .select('id')
    .single();

  if (!insertErr) return created?.id ?? null;

  // 3. Insert failed — if it's a duplicate (23505), another request already created the row
  //    Do a second find to get the id
  if (insertErr.code === '23505') {
    console.warn('[resolveUserId] duplicate insert, re-fetching:', nextauthId);
    const { data: retry } = await supabase
      .from('users')
      .select('id')
      .eq('nextauth_id', nextauthId)
      .maybeSingle();
    return retry?.id ?? null;
  }

  console.error('[resolveUserId] insert failed:', {
    message: insertErr.message,
    code:    insertErr.code,
    details: insertErr.details,
    hint:    insertErr.hint,
    nextauthId,
    hasUrl:  !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey:  !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const userId = await resolveUserId(supabase, session);
    if (!userId) return NextResponse.json({ error: 'Failed to resolve user' }, { status: 500 });

    const body = await request.json().catch(() => ({}));
    const { max_players = 10, duration_minutes = 10 } = body;

    // Block creation only if a tournament is actively RUNNING and not yet expired.
    // A tournament whose timer has elapsed is treated as stale — auto-finish it
    // and allow creation to proceed rather than blocking forever.
    const { data: runningTournaments } = await supabase
      .from('tournaments')
      .select('id, started_at, duration_minutes')
      .eq('status', 'running');

    if (runningTournaments?.length) {
      const now = Date.now();
      const genuinelyRunning = runningTournaments.filter(t => {
        if (!t.started_at || !t.duration_minutes) return true; // no timer info, assume running
        const endMs = new Date(t.started_at).getTime() + t.duration_minutes * 60 * 1000;
        return now < endMs; // only block if timer hasn't expired
      });

      // Auto-finish any tournaments whose timer has already elapsed
      const stale = runningTournaments.filter(t => !genuinelyRunning.includes(t));
      if (stale.length) {
        const staleIds = stale.map(t => t.id);
        console.log('[create] auto-finishing stale tournaments:', staleIds);
        await supabase
          .from('tournaments')
          .update({ status: 'finished', ended_at: new Date().toISOString() })
          .in('id', staleIds);
      }

      if (genuinelyRunning.length > 0) {
        return NextResponse.json(
          { error: 'A tournament is currently running. Wait for it to finish before creating a new one.' },
          { status: 409 }
        );
      }
    }

    // Generate unique 6-char code
    let tournament_code = '';
    for (let i = 0; i < 10; i++) {
      const candidate = generateCode();
      const { data } = await supabase
        .from('tournaments').select('id').eq('tournament_code', candidate).maybeSingle();
      if (!data) { tournament_code = candidate; break; }
    }
    if (!tournament_code)
      return NextResponse.json({ error: 'Could not generate unique code' }, { status: 500 });

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert({
        tournament_code,
        created_by:      userId,
        max_players,
        duration_minutes,
        status:          'waiting',
      })
      .select().single();

    if (error || !tournament)
      return NextResponse.json({ error: 'Failed to create tournament', details: error?.message }, { status: 500 });

    await supabase.from('tournament_participants').insert({
      tournament_id: tournament.id,
      user_id:       userId,
      status:        'joined',
    });

    return NextResponse.json({ success: true, tournament });
  } catch (err: any) {
    console.error('[create] error:', err.message);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
