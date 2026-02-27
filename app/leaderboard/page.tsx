'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  created_at: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerUsername, setPlayerUsername] = useState<string | null>(null);
  const [playerScore, setPlayerScore] = useState<number | null>(null);
  const [isPlayerInTop20, setIsPlayerInTop20] = useState<boolean>(true);

  useEffect(() => {
    // Get URL params
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');
    const score = params.get('score');
    
    if (username) setPlayerUsername(decodeURIComponent(username));
    if (score) setPlayerScore(parseInt(score, 10));
    
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/leaderboard');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch leaderboard');
      }

      const data = result.data || [];
      setLeaderboard(data);
      
      // Check if player is in top 20
      if (playerUsername && playerScore !== null) {
        const foundInTop20 = data.some((entry: LeaderboardEntry) => 
          entry.username === playerUsername && entry.score === playerScore
        );
        setIsPlayerInTop20(foundInTop20);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundImage: 'url(/brand-assets/Patterns/Curved%20Grid.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
        position: 'relative',
      }}
    >
      {/* Dark overlay for better contrast */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '1000px',
          padding: '2rem 1rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <Link
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #E554E8, #8840FF)',
              border: 'none',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontWeight: 700,
              fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
              fontSize: '1rem',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 800,
              fontFamily: "'Barlow-ExtraBold', 'Barlow', sans-serif",
              color: '#40FFAF',
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
              textShadow: '0 0 40px rgba(64, 255, 175, 0.4)',
            }}
          >
            🏆 LEADERBOARD
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontFamily: "'Barlow-Medium', 'Barlow', sans-serif",
              color: '#E7E7E7',
              marginTop: '0.5rem',
            }}
          >
            Top 20 SiggyDrop Champions
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#FFFFFF',
              fontSize: '1.25rem',
              fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
            }}
          >
            Loading leaderboard...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'rgba(255, 87, 87, 0.2)',
              border: '2px solid #FF5757',
              borderRadius: '12px',
              color: '#FF5757',
              fontSize: '1.1rem',
              fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
            }}
          >
            ⚠️ {error}
            <button
              onClick={fetchLeaderboard}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#FF5757',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
                display: 'block',
                margin: '1rem auto 0',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Not in Top 20 Message */}
        {!loading && !error && playerUsername && !isPlayerInTop20 && (
          <div
            style={{
              background: 'rgba(255, 87, 87, 0.15)',
              border: '2px solid rgba(255, 87, 87, 0.5)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '1.5rem',
                marginBottom: '0.5rem',
              }}
            >
              ⚠️
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
                color: '#FF5757',
                marginBottom: '0.5rem',
              }}
            >
              You are not in the Top 20
            </div>
            <div
              style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
              }}
            >
              Keep playing to beat the high scores!
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && !error && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(64, 255, 175, 0.3)',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 120px',
                gap: '1rem',
                padding: '1.5rem',
                background: 'rgba(64, 255, 175, 0.1)',
                borderBottom: '2px solid rgba(64, 255, 175, 0.3)',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
                  color: '#40FFAF',
                  fontSize: '1rem',
                  textAlign: 'center',
                }}
              >
                RANK
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
                  color: '#40FFAF',
                  fontSize: '1rem',
                }}
              >
                PLAYER
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
                  color: '#40FFAF',
                  fontSize: '1rem',
                  textAlign: 'right',
                }}
              >
                SCORE
              </div>
            </div>

            {/* Table Body */}
            {leaderboard.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '1.1rem',
                  fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
                }}
              >
                No scores yet. Be the first to play!
              </div>
            ) : (
              leaderboard.map((entry, index) => {
                const rank = index + 1;
                const medal = getMedalEmoji(rank);
                const isTopThree = rank <= 3;
                const isCurrentPlayer = playerUsername && entry.username === playerUsername && entry.score === playerScore;

                // Determine background color
                let backgroundColor = 'transparent';
                if (isCurrentPlayer) {
                  backgroundColor = 'rgba(136, 64, 255, 0.2)'; // Purple highlight for player
                } else if (isTopThree) {
                  backgroundColor = 'rgba(64, 255, 175, 0.05)';
                }

                return (
                  <div
                    key={entry.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 120px',
                      gap: '1rem',
                      padding: '1.25rem 1.5rem',
                      borderBottom:
                        index < leaderboard.length - 1
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : 'none',
                      background: backgroundColor,
                      border: isCurrentPlayer ? '2px solid rgba(136, 64, 255, 0.6)' : 'none',
                      borderRadius: isCurrentPlayer ? '12px' : '0',
                      margin: isCurrentPlayer ? '0.25rem 0' : '0',
                      transition: 'all 0.2s',
                      boxShadow: isCurrentPlayer ? '0 0 20px rgba(136, 64, 255, 0.4)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentPlayer) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(64, 255, 175, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentPlayer) {
                        (e.currentTarget as HTMLElement).style.background = isTopThree
                          ? 'rgba(64, 255, 175, 0.05)'
                          : 'transparent';
                      }
                    }}
                  >
                    {/* Rank */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isCurrentPlayer ? '1.75rem' : '1.5rem',
                        fontWeight: isCurrentPlayer ? 900 : 700,
                        fontFamily: isCurrentPlayer ? "'Barlow-ExtraBold', 'Barlow', sans-serif" : "'Barlow-Bold', 'Barlow', sans-serif",
                        color: isCurrentPlayer ? '#8840FF' : '#40FFAF',
                      }}
                    >
                      {medal && <span style={{ fontSize: '1.5rem' }}>{medal}</span>}
                      {!medal && <span>#{rank}</span>}
                    </div>

                    {/* Player */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: isCurrentPlayer ? '1.2rem' : '1.1rem',
                        fontFamily: isCurrentPlayer ? "'Barlow-Bold', 'Barlow', sans-serif" : "'Barlow-Regular', 'Barlow', sans-serif",
                        color: isCurrentPlayer ? '#E554E8' : '#FFFFFF',
                        fontWeight: isCurrentPlayer ? 700 : 400,
                      }}
                    >
                      {entry.username}
                    </div>

                    {/* Score */}
                    <div
                      style={{
                        textAlign: 'right',
                        fontSize: isCurrentPlayer ? '1.5rem' : '1.3rem',
                        fontWeight: isCurrentPlayer ? 900 : 700,
                        fontFamily: isCurrentPlayer ? "'Barlow-ExtraBold', 'Barlow', sans-serif" : "'Barlow-Bold', 'Barlow', sans-serif",
                        color: isCurrentPlayer ? '#8840FF' : '#FFFFFF',
                      }}
                    >
                      {entry.score.toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Refresh Button */}
        {!loading && !error && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={fetchLeaderboard}
              style={{
                padding: '0.75rem 2rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(64, 255, 175, 0.5)',
                borderRadius: '12px',
                color: '#40FFAF',
                fontWeight: 700,
                fontFamily: "'Barlow-Bold', 'Barlow', sans-serif",
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(64, 255, 175, 0.2)';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              🔄 Refresh Leaderboard
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
