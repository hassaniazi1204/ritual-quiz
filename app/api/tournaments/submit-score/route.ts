// app/api/tournaments/submit-score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

export async function POST(request: NextRequest) {
  try {
    // Check NextAuth session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id || session.user.email;

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Parse request body
    const body = await request.json();
    const {
      tournament_id,
      score,
      final_score = false,
      game_metrics = {},
    } = body;

    if (!tournament_id || score === undefined) {
      return NextResponse.json(
        { error: 'Tournament ID and score are required' },
        { status: 400 }
      );
    }

    // Validate score is non-negative
    if (score < 0) {
      return NextResponse.json(
        { error: 'Invalid score' },
        { status: 400 }
      );
    }

    console.log('📊 Submitting score:', {
      tournament_id,
      userId,
      score,
      final_score,
      game_metrics
    });

    // Get tournament to verify it's active
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('status')
      .eq('id', tournament_id)
      .single();

    if (tournamentError || !tournament) {
      console.error('Tournament not found:', tournamentError);
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    if (tournament.status !== 'active') {
      return NextResponse.json(
        { error: 'Tournament is not active' },
        { status: 400 }
      );
    }

    const {
      balls_dropped = 0,
      merges_completed = 0,
      game_duration_seconds = 0,
    } = game_metrics;

    // UPSERT score (update if exists, insert if not)
    const { error: scoreError } = await supabase
      .from('tournament_scores')
      .upsert({
        tournament_id,
        user_id: userId,
        current_score: score,
        balls_dropped,
        merges_completed,
        game_duration_seconds,
        last_update: new Date().toISOString(),
      }, {
        onConflict: 'tournament_id,user_id'
      });

    if (scoreError) {
      console.error('❌ Error submitting score:', scoreError);
      return NextResponse.json(
        { error: 'Failed to submit score', details: scoreError.message },
        { status: 500 }
      );
    }

    console.log('✅ Score submitted successfully');

    // Update participant's status
    await supabase
      .from('tournament_participants')
      .update({ 
        last_heartbeat: new Date().toISOString(),
        status: final_score ? 'finished' : 'playing',
        game_ended_at: final_score ? new Date().toISOString() : null,
        game_duration_seconds: final_score ? game_duration_seconds : null,
      })
      .eq('tournament_id', tournament_id)
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      message: 'Score submitted successfully',
    });

  } catch (error) {
    console.error('❌ Submit score error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
