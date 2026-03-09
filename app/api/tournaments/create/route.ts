// app/api/tournaments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

// Simple function to generate a 6-character tournament code
function generateTournamentCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    // Check NextAuth session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Parse request body
    const body = await request.json();
    const {
      max_players = 10,
    } = body;

    // Get user info from NextAuth session
    let userId = (session.user as any).id;
    
    if (!userId && session.user.email) {
      userId = session.user.email;
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unable to identify user. Please sign in again.' },
        { status: 401 }
      );
    }
    
    const username = session.user.name || session.user.email?.split('@')[0] || 'Player';

    console.log('Creating tournament for user:', { userId, username });

    // Generate unique tournament code (retry if collision)
    let tournament_code = '';
    let codeExists = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (codeExists && attempts < maxAttempts) {
      tournament_code = generateTournamentCode();
      
      const { data: existingTournament } = await supabase
        .from('tournaments')
        .select('id')
        .eq('tournament_code', tournament_code)
        .single();

      codeExists = !!existingTournament;
      attempts++;
    }

    if (codeExists) {
      return NextResponse.json(
        { error: 'Failed to generate unique tournament code. Please try again.' },
        { status: 500 }
      );
    }

    console.log('Generated tournament code:', tournament_code);

    // Create tournament with ONLY the fields that exist in the new schema
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        tournament_code,
        created_by: userId,
        max_players,
        status: 'waiting',
      })
      .select()
      .single();

    if (tournamentError) {
      console.error('Error creating tournament:', tournamentError);
      return NextResponse.json(
        { 
          error: 'Failed to create tournament',
          details: tournamentError.message || 'Unknown error',
          code: tournamentError.code 
        },
        { status: 500 }
      );
    }

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament was not created' },
        { status: 500 }
      );
    }

    console.log('Tournament created:', tournament);

    // Add creator as first participant
    const { error: participantError } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: tournament.id,
        user_id: userId,
        username: username,
        profile_image: session.user.image || null,
        status: 'joined',
      });

    if (participantError) {
      console.error('Error adding creator as participant:', participantError);
      // Don't fail - tournament is created, just log the error
    }

    return NextResponse.json({
      success: true,
      tournament: {
        id: tournament.id,
        tournament_code: tournament.tournament_code,
        max_players: tournament.max_players,
        status: tournament.status,
        created_at: tournament.created_at,
      },
    });

  } catch (error) {
    console.error('Tournament creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
