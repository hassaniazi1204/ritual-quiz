import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Leaderboard POST API Called ===');
    const body = await request.json();
    console.log('Request body:', body);
    const { username, score } = body;

    // Validation
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      console.error('Validation failed: Invalid username');
      return NextResponse.json(
        { error: 'Username is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      console.error('Validation failed: Invalid score');
      return NextResponse.json(
        { error: 'Invalid score' },
        { status: 400 }
      );
    }

    // Trim and limit username length
    const cleanUsername = username.trim().slice(0, 50);
    console.log('Inserting into database:', { username: cleanUsername, score });

    // Insert into database
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([
        {
          username: cleanUsername,
          score: score,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save score' },
        { status: 500 }
      );
    }

    console.log('Successfully saved to database:', data);
    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch top 20 scores
    const { data, error } = await supabase
      .from('leaderboard')
      .select('id, username, score, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true }) // Tie-breaker: earlier score wins
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
