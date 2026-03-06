// app/api/tournaments/start/route.ts
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
        { error: 'Only the tournament creator can start the tournament' },
        { status: 403 }
      );
    }

    // Check if tournament is in correct status
    if (tournament.status !== 'waiting') {
      return NextResponse.json(
        { error: `Tournament cannot be started - current status: ${tournament.status}` },
        { status: 400 }
      );
    }

    // Check if there are enough participants (at least 2)
    const { count: participantCount } = await supabase
      .from('tournament_participants')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', tournament_id);

    if (!participantCount || participantCount < 2) {
      return NextResponse.json(
        { error: 'At least 2 players required to start the tournament' },
        { status: 400 }
      );
    }

    // Calculate start and end times
    const now = new Date();
    const actual_start_time = new Date(now.getTime() + 5000); // Start in 5 seconds (countdown)
    const end_time = new Date(actual_start_time.getTime() + tournament.duration_minutes * 60 * 1000);

    // Update tournament status to 'starting' (5-second countdown)
    const { data: updatedTournament, error: updateError } = await supabase
      .from('tournaments')
      .update({
        status: 'starting',
        actual_start_time: actual_start_time.toISOString(),
        end_time: end_time.toISOString(),
      })
      .eq('id', tournament_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error starting tournament:', updateError);
      return NextResponse.json(
        { error: 'Failed to start tournament' },
        { status: 500 }
      );
    }

    // Create initial leaderboard entries for all participants with score 0
    // This ensures the leaderboard shows all players immediately
    const { data: participants, error: participantsError } = await supabase
      .from('tournament_participants')
      .select('user_id, username')
      .eq('tournament_id', tournament_id);

    if (!participantsError && participants) {
      // Insert initial scores for all participants
      const initialScores = participants.map(p => ({
        tournament_id: tournament_id,
        user_id: p.user_id,
        current_score: 0,
        best_score: 0,
        game_duration_seconds: 0,
        balls_dropped: 0,
        merges_completed: 0,
        last_update: new Date().toISOString(),
      }));

      const { error: scoresError } = await supabase
        .from('tournament_scores')
        .upsert(initialScores, { 
          onConflict: 'tournament_id,user_id',
          ignoreDuplicates: false 
        });

      if (scoresError) {
        console.error('Error creating initial leaderboard:', scoresError);
        // Don't fail the tournament start, just log the error
      } else {
        console.log(`Created initial leaderboard entries for ${participants.length} participants`);
      }
    }

    // The status will automatically change from 'starting' to 'active' after 5 seconds
    // This will be handled by the frontend or a separate cron job
    // For now, we'll schedule it with a setTimeout equivalent via database trigger
    // or let the frontend handle it when countdown reaches 0

    return NextResponse.json({
      success: true,
      tournament: {
        id: updatedTournament.id,
        status: updatedTournament.status,
        actual_start_time: updatedTournament.actual_start_time,
        end_time: updatedTournament.end_time,
        duration_minutes: updatedTournament.duration_minutes,
      },
      countdown_seconds: 5,
      participant_count: participantCount,
    });

  } catch (error) {
    console.error('Tournament start error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper endpoint to actually activate tournament after countdown
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const body = await request.json();
    const { tournament_id } = body;

    // Update status from 'starting' to 'active'
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .update({ status: 'active' })
      .eq('id', tournament_id)
      .eq('status', 'starting') // Only update if still in starting state
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tournament: tournament,
    });

  } catch (error) {
    console.error('Tournament activation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
