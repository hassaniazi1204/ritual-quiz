'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  correctAnswerText?: string;
  difficulty: string;
}

const ROLES = [
  { min: 0,  max: 4,  title: 'Initiate',   color: '#FF5757', emoji: '🌱' },
  { min: 5,  max: 6,  title: 'Ritty Bitty', color: '#E88239', emoji: '⭐' },
  { min: 7,  max: 7,  title: 'Ritty',       color: '#F6BE4F', emoji: '🔮' },
  { min: 8,  max: 9,  title: 'Ritualist',   color: '#00C2FF', emoji: '👑' },
  { min: 10, max: 10, title: 'Mage',        color: '#40FFAF', emoji: '🧙' },
];

const getRoleInfo = (score: number) =>
  ROLES.find(r => score >= r.min && score <= r.max) || ROLES[0];

/* ─── shared style tokens ────────────────────────── */
const BG_ROUNDEL: React.CSSProperties = {
  backgroundImage:    'url(/brand-assets/Patterns/Roundel.png)',
  backgroundSize:     'cover',
  backgroundPosition: 'center center',
  backgroundRepeat:   'no-repeat',
  backgroundAttachment: 'fixed',
};

const OVERLAY: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.60)',
  zIndex: 0,
};

const NEON_LOGO_SRC        = '/brand-assets/Lockup/Neon on Grey.png';   // kept for quiz/result screens
const TRANSLUCENT_LOGO_SRC = '/brand-assets/Lockup/Translucent.png';     // used on start screen

/* ═══════════════════════════════════════════════════
   START SCREEN
═══════════════════════════════════════════════════ */
function StartScreen({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t); }, []);

  const fade = (delay: string): React.CSSProperties => ({
    opacity:    ready ? 1 : 0,
    transform:  ready ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.7s ease ${delay}, transform 0.7s ease ${delay}`,
  });

  return (
    <main style={{ minHeight: '100vh', width: '100%', ...BG_ROUNDEL,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      fontFamily: "'Barlow', sans-serif", position: 'relative' }}>

      <div style={OVERLAY} />

      {/* ── Back button — top-left ── */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%',
        padding: '24px 32px 0', display: 'flex', alignItems: 'center' }}>
        <Link href="/">
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              color: 'rgba(255,255,255,0.55)',
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#40FFAF'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'}
          >
            ← Back
          </span>
        </Link>
      </div>

      {/* ── center column ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        flexGrow: 1, width: '100%',
        padding: '20px 24px 0', textAlign: 'center',
      }}>

        {/* Logo — Translucent.png */}
        <div style={{ ...fade('0s'), marginBottom: '52px' }}>
          <img
            src={TRANSLUCENT_LOGO_SRC}
            alt="Ritual"
            style={{
              width: 'clamp(180px, 28vw, 380px)', height: 'auto',
              display: 'block', margin: '0 auto',
              filter: 'drop-shadow(0 0 36px rgba(64,255,175,0.4))',
            }}
          />
        </div>

        {/* Main heading — 3 lines, #40FFAF */}
        <div style={{ ...fade('0.15s'), marginBottom: '24px', maxWidth: '820px' }}>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 3.2rem)',
            fontWeight: 900,
            color: '#40FFAF',
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
            margin: 0,
            textShadow: '0 0 40px rgba(64,255,175,0.35)',
          }}>
            Conquer the World's First AI Execution Layer
          </h1>
        </div>

        {/* Sub-heading — #E7E7E7, no neon glow */}
        <div style={{ ...fade('0.28s'), marginBottom: '64px', maxWidth: '560px' }}>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            fontWeight: 400,
            color: '#E7E7E7',
            lineHeight: 1.6,
            margin: 0,
          }}>
            Only the Sharpest Minds Can Master
          </p>
        </div>

        {/* Extra line above button */}
        <div style={{ ...fade('0.38s'), marginBottom: '28px' }}>
          <p style={{
            fontSize: 'clamp(0.9rem, 1.6vw, 1.05rem)',
            fontWeight: 400, color: '#E7E7E7',
            lineHeight: 1.5, margin: 0,
          }}>
            Answer 10 questions and get your personalized Ritual Card
          </p>
        </div>

        {/* Start Quiz button */}
        <div style={fade('0.52s')}>
          <button
            onClick={onStart}
            disabled={loading}
            style={{
              padding: '22px 72px',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontWeight: 800, fontFamily: "'Barlow', sans-serif",
              letterSpacing: '0.05em', textTransform: 'uppercase',
              color: '#000000',
              background: 'linear-gradient(135deg, #40FFAF 0%, #077345 100%)',
              border: 'none', borderRadius: '14px', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 0 40px rgba(64,255,175,0.5), 0 8px 24px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              if (loading) return;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px) scale(1.04)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 60px rgba(64,255,175,0.65), 0 12px 32px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(64,255,175,0.5), 0 8px 24px rgba(0,0,0,0.4)';
            }}
          >
            {loading ? 'Loading…' : 'Take the Challenge'}
          </button>
        </div>
      </div>

      {/* spacer */}
      <div style={{ position: 'relative', zIndex: 1, height: '80px' }} />
    </main>
  );
}

/* ═══════════════════════════════════════════════════
   QUIZ SCREEN
═══════════════════════════════════════════════════ */
function QuizScreen({
  question, index, total, score,
  onAnswer,
}: {
  question: Question;
  index: number;
  total: number;
  score: number;
  onAnswer: (selected: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked]     = useState(false);

  const submit = () => {
    if (selected === null || locked) return;
    setLocked(true);
    setTimeout(() => {
      onAnswer(selected);
      setSelected(null);
      setLocked(false);
    }, 1400);
  };

  const progress = ((index + 1) / total) * 100;

  return (
    /* Full-page Roundel background, vertically centered */
    <main style={{
      minHeight: '100vh', width: '100%', ...BG_ROUNDEL,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',   /* ← vertically centered */
      fontFamily: "'Barlow', sans-serif", position: 'relative',
    }}>

      <div style={OVERLAY} />

      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '760px',
        padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px',
      }}>

        {/* top bar — Mark logo replaces Neon logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/">
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', cursor: 'pointer',
              transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#40FFAF'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}
            >← Home</span>
          </Link>

          {/* Mark/Translucent.png — 5x larger */}
          <img
            src="/brand-assets/Mark/Translucent.png"
            alt="Ritual"
            style={{
              height: '200px', width: 'auto',
              filter: 'drop-shadow(0 0 24px rgba(64,255,175,0.5))',
            }}
          />

          <span style={{ color: '#40FFAF', fontWeight: 700, fontSize: '0.95rem' }}>
            {score} / {index}
          </span>
        </div>

        {/* progress bar */}
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, #40FFAF, #8840FF)',
            transition: 'width 0.4s ease', borderRadius: '99px' }} />
        </div>

        {/* question card — Outline.png background */}
        <div style={{
          borderRadius: '20px', padding: '36px 32px',
          border: '1px solid rgba(7,115,69,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Outline.png pattern inside card */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(/brand-assets/Patterns/Outline.png)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.12, zIndex: 0,
          }} />
          {/* dark tint over pattern so text stays readable */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.82)',
            zIndex: 1,
          }} />

          {/* card content — above both layers */}
          <div style={{ position: 'relative', zIndex: 2 }}>

            {/* question counter only — no difficulty badge */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600 }}>
                Question {index + 1} of {total}
              </span>
            </div>

            {/* question text — #077345 */}
            <h2 style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 800,
              color: '#077345', lineHeight: 1.4, margin: '0 0 28px',
            }}>
              {question.question}
            </h2>

            {/* options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              {question.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect  = i === question.correctAnswer;
                const showResult = locked;

                let bg     = 'rgba(255,255,255,0.05)';
                let border = '1px solid rgba(255,255,255,0.12)';
                let color  = '#E7E7E7';

                if (showResult) {
                  if (isCorrect)                     { bg = 'rgba(64,255,175,0.18)'; border = '1px solid #40FFAF'; color = '#40FFAF'; }
                  else if (isSelected && !isCorrect) { bg = 'rgba(255,87,87,0.18)';  border = '1px solid #FF5757'; color = '#FF5757'; }
                  else                               { color = 'rgba(255,255,255,0.3)'; }
                } else if (isSelected) {
                  bg = 'rgba(7,115,69,0.25)'; border = '1px solid #077345'; color = '#FFFFFF';
                }

                return (
                  <button key={i} onClick={() => { if (!locked) setSelected(i); }}
                    style={{
                      background: bg, border, borderRadius: '12px',
                      padding: '14px 18px', textAlign: 'left',
                      cursor: locked ? 'default' : 'pointer',
                      color, fontFamily: "'Barlow', sans-serif",
                      fontSize: '1rem', fontWeight: 600, lineHeight: 1.4,
                      display: 'flex', alignItems: 'center', gap: '14px',
                      transition: 'all 0.15s ease',
                      transform: isSelected && !locked ? 'scale(1.01)' : 'scale(1)',
                    }}>
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.85rem',
                      background: isSelected && !locked ? '#077345' :
                                  showResult && isCorrect ? '#40FFAF' :
                                  showResult && isSelected ? '#FF5757' : 'rgba(255,255,255,0.1)',
                      color: (isSelected && !locked) || (showResult && (isCorrect || isSelected)) ? '#fff' : '#fff',
                    }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* feedback banner */}
            {locked && (
              <div style={{
                padding: '12px 18px', borderRadius: '10px', textAlign: 'center',
                fontWeight: 700, fontSize: '0.95rem', marginBottom: '20px',
                background: selected === question.correctAnswer
                  ? 'rgba(64,255,175,0.15)' : 'rgba(255,87,87,0.15)',
                color: selected === question.correctAnswer ? '#40FFAF' : '#FF5757',
                border: `1px solid ${selected === question.correctAnswer ? '#40FFAF' : '#FF5757'}`,
              }}>
                {selected === question.correctAnswer
                  ? '✅ Correct!'
                  : `❌ Incorrect — ${question.options[question.correctAnswer]}`}
              </div>
            )}

            {/* submit */}
            {!locked && (
              <button onClick={submit} disabled={selected === null}
                style={{
                  width: '100%', padding: '16px',
                  background: selected !== null
                    ? 'linear-gradient(135deg, #40FFAF 0%, #077345 100%)'
                    : 'rgba(255,255,255,0.07)',
                  border: 'none', borderRadius: '12px',
                  color: selected !== null ? '#000' : 'rgba(255,255,255,0.3)',
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 800, fontSize: '1rem',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  cursor: selected !== null ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: selected !== null ? '0 0 30px rgba(64,255,175,0.3)' : 'none',
                }}>
                {index === total - 1 ? 'Finish Quiz' : 'Submit Answer'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════
   RESULT SCREEN
═══════════════════════════════════════════════════ */
function ResultScreen({
  score, total, onRestart,
}: { score: number; total: number; onRestart: () => void }) {
  const role = getRoleInfo(score);
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUserImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const downloadCard = async () => {
    if (!userName.trim()) { alert('Enter your name first'); return; }
    setDownloading(true);
    await new Promise(r => setTimeout(r, 100));
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#000' });
      const link   = document.createElement('a');
      link.download = `ritual-card-${userName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
    setDownloading(false);
  };

  const shareX = () => {
    const text = `I scored ${score}/${total} on the Ritual Quiz and earned the "${role.title}" role! ${role.emoji}\n\nhttps://ritual-quiz.vercel.app`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main style={{ minHeight: '100vh', width: '100%', ...BG_ROUNDEL,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: "'Barlow', sans-serif", position: 'relative' }}>

      <div style={OVERLAY} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '640px',
        padding: '48px 24px 64px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '32px' }}>

        {/* logo */}
        <img src={NEON_LOGO_SRC} alt="Ritual"
          style={{ height: '44px', width: 'auto',
            filter: 'drop-shadow(0 0 16px rgba(64,255,175,0.4))' }} />

        {/* result card */}
        <div style={{
          width: '100%', background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(20px)',
          border: `2px solid ${role.color}40`,
          borderRadius: '24px', padding: '40px 32px',
          textAlign: 'center',
          boxShadow: `0 0 60px ${role.color}25`,
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '12px' }}>{role.emoji}</div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900,
            color: role.color, margin: '0 0 8px',
            textShadow: `0 0 30px ${role.color}80` }}>
            {role.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '28px', fontSize: '1rem' }}>
            Your Ritual Role
          </p>

          <div style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 900,
            color: '#FFFFFF', lineHeight: 1, marginBottom: '4px' }}>
            {score}<span style={{ fontSize: '40%', color: 'rgba(255,255,255,0.4)' }}>/{total}</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '32px' }}>
            Questions correct
          </p>

          {/* name + photo for card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <input
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="Your name (for card)"
              style={{
                padding: '13px 16px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px', color: '#fff',
                fontFamily: "'Barlow', sans-serif", fontSize: '1rem',
                outline: 'none', width: '100%',
              }}
            />
            <label style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px', color: 'rgba(255,255,255,0.5)',
              fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem',
              cursor: 'pointer', textAlign: 'left',
            }}>
              {userImage ? '✅ Photo uploaded' : '📷 Upload photo (optional)'}
              <input type="file" accept="image/*" onChange={handleImageUpload}
                style={{ display: 'none' }} />
            </label>
          </div>

          {/* action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={downloadCard} disabled={downloading}
              style={{
                padding: '15px', borderRadius: '12px', border: 'none',
                background: `linear-gradient(135deg, ${role.color} 0%, #077345 100%)`,
                color: '#000', fontWeight: 800, fontSize: '1rem',
                fontFamily: "'Barlow', sans-serif",
                cursor: downloading ? 'not-allowed' : 'pointer',
                opacity: downloading ? 0.7 : 1,
                boxShadow: `0 0 30px ${role.color}40`,
                transition: 'transform 0.2s ease',
              }}>
              {downloading ? 'Generating…' : '⬇ Download Ritual Card'}
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={shareX}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                  fontFamily: "'Barlow', sans-serif", cursor: 'pointer',
                  transition: 'background 0.2s',
                }}>
                𝕏 Share
              </button>
              <button onClick={onRestart}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                  fontFamily: "'Barlow', sans-serif", cursor: 'pointer',
                  transition: 'background 0.2s',
                }}>
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* hidden download card */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <div ref={cardRef} style={{
          width: '600px', height: '600px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px', fontFamily: "'Barlow', sans-serif",
          position: 'relative', overflow: 'hidden',
          background: '#000000',
        }}>

          {/* Outline.png — full card background */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(/brand-assets/Patterns/Outline.png)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.25,
          }} />

          {/* dark tint so content stays readable */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.70)',
          }} />

          {/* colored role border glow overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            border: `3px solid ${role.color}`,
            boxShadow: `inset 0 0 60px ${role.color}22`,
            borderRadius: '0px',
            pointerEvents: 'none',
          }} />

          {/* all card content above overlays */}
          <div style={{
            position: 'relative', zIndex: 2,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', width: '100%',
          }}>

            {/* Translucent.png logo at top */}
            <img
              src="/brand-assets/Lockup/Translucent.png"
              alt="Ritual"
              style={{
                width: '200px', height: 'auto',
                marginBottom: '20px',
                filter: 'drop-shadow(0 0 20px rgba(64,255,175,0.45))',
              }}
            />

            {/* user avatar */}
            {userImage && (
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden',
                border: `2px solid ${role.color}`, marginBottom: '14px', flexShrink: 0,
              }}>
                <img src={userImage} alt="user"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* role emoji */}
            <div style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '8px' }}>
              {role.emoji}
            </div>

            {/* user name */}
            <div style={{
              fontSize: '2rem', fontWeight: 900, color: role.color,
              textShadow: `0 0 24px ${role.color}99`, marginBottom: '4px',
              letterSpacing: '-0.02em',
            }}>
              {userName || 'Ritualist'}
            </div>

            {/* score */}
            <div style={{
              fontSize: '3.5rem', fontWeight: 900, color: '#FFFFFF',
              lineHeight: 1, marginBottom: '4px',
              textShadow: '0 0 20px rgba(255,255,255,0.3)',
            }}>
              {score}<span style={{ fontSize: '55%', color: 'rgba(255,255,255,0.4)' }}>/10</span>
            </div>

            {/* role title */}
            <div style={{
              fontSize: '1.1rem', fontWeight: 700, color: role.color,
              marginBottom: '16px', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {role.title}
            </div>

            {/* url */}
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
              ritual-quiz.vercel.app
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════ */
export default function QuizPage() {
  type Stage = 'start' | 'quiz' | 'result';
  const [stage, setStage]       = useState<Stage>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]   = useState(true);
  const [qIndex, setQIndex]     = useState(0);
  const [score, setScore]       = useState(0);

  /* load questions once */
  useEffect(() => {
    (async () => {
      const res  = await fetch('/questions.json');
      const data = await res.json();
      const all: Question[] = data.questions;
      const shuffle = (a: Question[]) => [...a].sort(() => Math.random() - 0.5);
      const easy   = shuffle(all.filter(q => q.difficulty === 'easy')).slice(0, 4);
      const medium = shuffle(all.filter(q => q.difficulty === 'medium')).slice(0, 4);
      const hard   = shuffle(all.filter(q => q.difficulty === 'hard')).slice(0, 2);
      setQuestions(shuffle([...easy, ...medium, ...hard]));
      setLoading(false);
    })();
  }, []);

  const handleStart = () => { if (!loading) setStage('quiz'); };

  const handleAnswer = (selected: number) => {
    if (selected === questions[qIndex].correctAnswer) setScore(s => s + 1);
    if (qIndex + 1 < questions.length) setQIndex(i => i + 1);
    else setStage('result');
  };

  const handleRestart = () => {
    setStage('start'); setQIndex(0); setScore(0);
  };

  if (stage === 'start')  return <StartScreen  onStart={handleStart} loading={loading} />;
  if (stage === 'quiz')   return <QuizScreen   question={questions[qIndex]} index={qIndex}
                                   total={questions.length} score={score} onAnswer={handleAnswer} />;
  if (stage === 'result') return <ResultScreen score={score} total={questions.length} onRestart={handleRestart} />;
  return null;
}
