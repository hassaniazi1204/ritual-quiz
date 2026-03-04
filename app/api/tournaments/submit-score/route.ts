import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Validation constants
const VALIDATION_RULES = {
  MAX_SCORE_PER_MINUTE: 2000,
  MAX_SCORE_PER_BALL: 150,
  MAX_DURATION_VARIANCE: 30,
  MIN_SUBMISSION_INTERVAL: 2, // seconds
};

function validateScore(score: number, metrics: any, tournament: any) {
  const flags: string[] = [];
  
  // Rule 1: Score must be reasonable for duration
  const maxPossibleScore = tournament.duration_minutes * VALIDATION_RULES.MAX_SCORE_PER_MINUTE;
  if (score > maxPossibleScore) {
    flags.push('SCORE_TOO_HIGH_FOR_DURATION');
  }
  
  // Rule 2: Score must be reasonable for balls dropped
  if (metrics.balls_dropped > 0) {
    const scorePerBall = score / metrics.balls_dropped;
    if (scorePerBall > VALIDATION_RULES.MAX_SCORE_PER_BALL) {
      flags.push('SCORE_PER_BALL_TOO_HIGH');
    }
  }
  
  // Rule 3: Game duration must match tournament duration (for final scores)
  if (metrics.game_duration_seconds) {
    const expectedDuration = tournament.duration_minutes * 60;
    const variance = Math.abs(metrics.game_duration_seconds - expectedDuration);
    if (variance > VALIDATION_RULES.MAX_DURATION_VARIANCE) {
      flags.push('DURATION_MISMATCH');
    }
  }
  
  // Rule 4: Must have reasonable activity metrics
  if (metrics.balls_dropped === 0 || metrics.merges_completed === 0) {
    flags.push('NO_GAME_ACTIVITY');
  }
  
  return {
    valid: flags.length === 0,
    flags: flags,
  };
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tournament_id, score, final_score, game_metrics } = body;

    // Validate input
    if (!tournament_id || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournament_id)
      .single();

    if (tournamentError || !tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Check tournament status
    if (tournament.status !== 'active' && !final_score) {
      return NextResponse.json({ error: 'Tournament is not active' }, { status: 400 });
    }

    // Get participant
    const { data: participant, error: participantError } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('tournament_id', tournament_id)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Not a tournament participant' }, { status: 403 });
    }

    // Check rate limiting (prevent spam)
    const { data: lastSubmission } = await supabase
      .from('tournament_scores')
      .select('submitted_at')
      .eq('participant_id', participant.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (lastSubmission) {
      const timeSinceLastSubmission = 
        (new Date().getTime() - new Date(lastSubmission.submitted_at).getTime()) / 1000;
      
      if (timeSinceLastSubmission < VALIDATION_RULES.MIN_SUBMISSION_INTERVAL) {
        return NextResponse.json({ error: 'Too many submissions' }, { status: 429 });
      }
    }

    // Validate score
    const validation = validateScore(score, game_metrics || {}, tournament);

    // Insert score
    const { data: scoreRecord, error: scoreError } = await supabase
      .from('tournament_scores')
      .insert({
        tournament_id: tournament_id,
        participant_id: participant.id,
        user_id: user.id,
        score: score,
        final_score: final_score || false,
        balls_dropped: game_metrics?.balls_dropped,
        merges_completed: game_metrics?.merges_completed,
        game_duration_seconds: game_metrics?.game_duration_seconds,
        validated: validation.valid,
        validation_flags: validation.flags,
      })
      .select()
      .single();

    if (scoreError) {
      console.error('Error submitting score:', scoreError);
      return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
    }

    // Get current rank
    const { data: rankings } = await supabase
      .rpc('get_tournament_rankings', { p_tournament_id: tournament_id });

    const myRank = rankings?.find((r: any) => r.user_id === user.id)?.rank;

    // Update participant status if final score
    if (final_score) {
      await supabase
        .from('tournament_participants')
        .update({
          status: 'finished',
          game_ended_at: new Date().toISOString(),
        })
        .eq('id', participant.id);
    }

    return NextResponse.json({
      success: true,
      validated: validation.valid,
      validation_flags: validation.flags,
      current_rank: myRank,
      score_id: scoreRecord.id,
    });

  } catch (error) {
    console.error('Score submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
