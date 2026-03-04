import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const tournamentId = params.id;

    // Get tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Get leaderboard using optimized query
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('live_tournament_leaderboards')
      .select('*')
      .eq('tournament_id', tournamentId)
      .limit(100);

    if (leaderboardError) {
      console.error('Leaderboard error:', leaderboardError);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Get current user's rank if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    let myRank = null;
    
    if (user) {
      const myEntry = leaderboard?.find((entry: any) => entry.user_id === user.id);
      myRank = myEntry?.rank || null;
    }

    return NextResponse.json({
      success: true,
      tournament: {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        end_time: tournament.end_time,
      },
      leaderboard: leaderboard || [],
      my_rank: myRank,
    });

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
