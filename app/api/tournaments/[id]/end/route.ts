// app/api/tournaments/[id]/end/route.ts
// Creator-authenticated endpoint to end a tournament early.
// The client (host) calls this instead of calling /finalize directly.
// This keeps the client out of tournament state management entirely.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

async function resolveUserId(supabase: any, session: any): Promise<string | null> {
  const nextauthId = (session.user as any).id || session.user.email;
  if (!nextauthId) return null;
  const { data } = await supabase
    .from('users').select('id').eq('nextauth_id', nextauthId).maybeSingle();
  return data?.id ?? null;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tournamentId = params.id;
  if (!tournamentId)
    return NextResponse.json({ error: 'tournamentId required' }, { status: 400 });

  try {
    // Auth — only the tournament creator can end it early
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const userId = await resolveUserId(supabase, session);
    if (!userId)
      return NextResponse.json({ error: 'Failed to resolve user' }, { status: 500 });

    const { data: tournament } = await supabase
      .from('tournaments')
      .select('status, created_by')
      .eq('id', tournamentId)
      .single();

    if (!tournament)
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    if (tournament.created_by !== userId)
      return NextResponse.json({ error: 'Only the tournament creator can end it early' }, { status: 403 });
    if (tournament.status !== 'running')
      return NextResponse.json({ error: `Tournament is not running (status: ${tournament.status})` }, { status: 400 });

    // Delegate to finalize — server controls the state transition
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/tournaments/${tournamentId}/finalize`, {
      method: 'POST',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (err: any) {
    console.error('[end] error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
