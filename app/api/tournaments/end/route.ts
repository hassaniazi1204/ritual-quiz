import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    console.log('🏁 Ending tournament:', tournamentId);

    const supabase = createClient();

    // STEP 1: Get all scores (separate query)
    const { data: scores, error: scoresError } = await supabase
      .from('tournament_scores')
      .select('user_id, current_score, balls_dropped, merges_completed, game_duration_seconds')
      .eq('tournament_id', tournamentId)
      .order('current_score', { ascending: false });

    if (scoresError) {
      console.error('❌ Error fetching scores:', scoresError);
      return NextResponse.json(
        { error: 'Failed to fetch scores', details: scoresError.message },
        { status: 500 }
      );
    }

    if (!scores || scores.length === 0) {
      console.log('⚠️ No scores found for tournament');
      return NextResponse.json(
        { error: 'No scores found for this tournament' },
        { status: 404 }
      );
    }

    console.log('✅ Fetched scores:', scores);

    // STEP 2: Get participant details (separate query)
    const { data: participants, error: participantsError } = await supabase
      .from('tournament_participants')
      .select('user_id, username, profile_image')
      .eq('tournament_id', tournamentId);

    if (participantsError) {
      console.error('❌ Error fetching participants:', participantsError);
      return NextResponse.json(
        { error: 'Failed to fetch participants', details: participantsError.message },
        { status: 500 }
      );
    }

    console.log('✅ Fetched participants:', participants);

    // STEP 3: Manually join in JavaScript
    const participantsMap = new Map(
      participants?.map(p => [p.user_id, p]) || []
    );

    const results = scores.map((score, index) => {
      const participant = participantsMap.get(score.user_id);
      return {
        tournament_id: tournamentId,
        user_id: score.user_id,
        username: participant?.username || 'Unknown Player',
        profile_image: participant?.profile_image || null,
        rank: index + 1,
        final_score: score.current_score,
        balls_dropped: score.balls_dropped || 0,
        merges_completed: score.merges_completed || 0,
        game_duration_seconds: score.game_duration_seconds || 0
      };
    });

    console.log('✅ Prepared results:', results);

    // STEP 4: Save results
    const { error: resultsError } = await supabase
      .from('tournament_results')
      .upsert(results, { 
        onConflict: 'tournament_id,user_id'
      });

    if (resultsError) {
      console.error('❌ Error saving results:', resultsError);
      return NextResponse.json(
        { error: 'Failed to save results', details: resultsError.message },
        { status: 500 }
      );
    }

    console.log('✅ Results saved successfully');

    // STEP 5: Update tournament status
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ 
        status: 'finished',
        ended_at: new Date().toISOString()
      })
      .eq('id', tournamentId);

    if (updateError) {
      console.error('❌ Error updating tournament status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update tournament', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ Tournament status updated to finished');

    return NextResponse.json({
      success: true,
      message: 'Tournament ended successfully',
      results
    });

  } catch (error: any) {
    console.error('❌ Unexpected error in end tournament API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
