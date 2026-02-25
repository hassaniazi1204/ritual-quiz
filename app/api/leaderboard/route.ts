import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Leaderboard POST API Called ===');
    
    // Check for environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing database credentials' },
        { status: 500 }
      );
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
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

    // Insert into database - ONLY username and score (NO id field)
    // The database will auto-generate the id via the sequence
    const insertData = {
      username: cleanUsername,
      score: score,
      // Explicitly omit 'id' field - let database handle it
    };
    
    const { data, error } = await supabase
      .from('leaderboard')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      
      // Check if it's the duplicate key error
      if (error.message.includes('duplicate key') || error.code === '23505') {
        return NextResponse.json(
          { 
            error: 'Database sequence error. The id auto-increment is out of sync. Please contact support to reset the sequence.',
            details: error.message 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Successfully saved to database:', data);
    return NextResponse.json(
      { success: true, data: data?.[0] || data },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check for environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing database credentials' },
        { status: 500 }
      );
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
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
        { error: `Database error: ${error.message}` },
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
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
