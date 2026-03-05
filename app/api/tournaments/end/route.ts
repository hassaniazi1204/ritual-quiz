// app/api/tournaments/end/route.ts
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
    const { tournament_id } = body;

    if (!tournament_id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    // Get tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournament_id)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Check if user is the creator
    if (tournament.created_by !== userId) {
      return NextResponse.json(
        { error: 'Only the tournament creator can end the tournament' },
        { status: 403 }
      );
    }

    // Update tournament status to finished
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ 
        status: 'finished',
        end_time: new Date().toISOString(),
      })
      .eq('id', tournament_id);

    if (updateError) {
      console.error('Error ending tournament:', updateError);
      return NextResponse.json(
        { error: 'Failed to end tournament' },
        { status: 500 }
      );
    }

    // Get all final scores and create results
    const { data: scores, error: scoresError } = await supabase
      .from('tournament_scores')
      .select('*')
      .eq('tournament_id', tournament_id)
      .eq('final_score', true)
      .order('score', { ascending: false });

    if (!scoresError && scores) {
      // Get participant info
      const { data: participants } = await supabase
        .from('tournament_participants')
        .select('user_id, username, profile_image')
        .eq('tournament_id', tournament_id);

      const participantMap = new Map(
        participants?.map(p => [p.user_id, p]) || []
      );

      // Create results with rankings
      const results = scores.map((score, index) => {
        const participant = participantMap.get(score.user_id);
        return {
          tournament_id: tournament_id,
          user_id: score.user_id,
          username: participant?.username || 'Unknown',
          profile_image: participant?.profile_image,
          final_score: score.score,
          balls_dropped: score.balls_dropped,
          merges_completed: score.merges_completed,
          game_duration_seconds: score.game_duration_seconds,
          rank: index + 1,
          validation_flags: score.validation_flags,
        };
      });

      // Insert results (upsert to avoid duplicates)
      if (results.length > 0) {
        await supabase
          .from('tournament_results')
          .upsert(results, { 
            onConflict: 'tournament_id,user_id',
            ignoreDuplicates: false 
          });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Tournament ended successfully',
    });

  } catch (error) {
    console.error('End tournament error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
