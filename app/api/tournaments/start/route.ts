// app/api/tournaments/start/route.ts
// POST  → waiting → starting  (creator triggers countdown)
// PATCH → starting → active   (called after countdown completes)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

async function resolveUserId(supabase: any, session: any): Promise<string | null> {
  const nextauthId = (session.user as any).id || session.user.email;
  const { data } = await supabase.from('users').select('id').eq('nextauth_id', nextauthId).single();
  return data?.id ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const userId = await resolveUserId(supabase, session);
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const { tournament_id } = await request.json();
    if (!tournament_id) return NextResponse.json({ error: 'tournament_id required' }, { status: 400 });

    const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournament_id).single();
    if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    if (tournament.created_by !== userId) return NextResponse.json({ error: 'Only the creator can start' }, { status: 403 });
    if (tournament.status !== 'waiting') return NextResponse.json({ error: `Cannot start from status: ${tournament.status}` }, { status: 400 });

    const { count } = await supabase
      .from('tournament_participants')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', tournament_id);

    if ((count ?? 0) < 2) return NextResponse.json({ error: 'At least 2 players required' }, { status: 400 });

    // waiting → starting (triggers countdown on all clients via Realtime)
    const { data: updated } = await supabase
      .from('tournaments')
      .update({ status: 'starting' })
      .eq('id', tournament_id)
      .select()
      .single();

    return NextResponse.json({ success: true, tournament: updated, participant_count: count });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { tournament_id } = await request.json();
    if (!tournament_id) return NextResponse.json({ error: 'tournament_id required' }, { status: 400 });

    const { data: tournament } = await supabase.from('tournaments').select('status').eq('id', tournament_id).single();
    if (!tournament || tournament.status !== 'starting')
      return NextResponse.json({ error: `Cannot activate from status: ${tournament?.status}` }, { status: 400 });

    // starting → active
    const { data: updated } = await supabase
      .from('tournaments')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', tournament_id)
      .select()
      .single();

    // Create initial score rows for all participants
    const { data: participants } = await supabase
      .from('tournament_participants')
      .select('user_id')
      .eq('tournament_id', tournament_id);

    if (participants?.length) {
      await supabase.from('tournament_scores').upsert(
        participants.map(p => ({
          tournament_id,
          user_id: p.user_id,
          score: 0,
          balls_dropped: 0,
          merges_completed: 0,
          game_duration_seconds: 0,
          finished: false,
          last_update: new Date().toISOString(),
        })),
        { onConflict: 'tournament_id,user_id', ignoreDuplicates: true }
      );
    }

    return NextResponse.json({ success: true, tournament: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
