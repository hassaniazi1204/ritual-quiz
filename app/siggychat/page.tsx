'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SiggyChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "So… another mortal wanders into the Forge. 😼 Tell me, visitor… are you an Initiate exploring the temple, an Ascendant seeking knowledge, or a future Ritualist ready to build something magnificent on Ritual Chain? Choose your words carefully. Impress me and I might share secrets of the multiverse…",
    },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const bottomRef             = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);
  const audioRef              = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const audio = new Audio('/sounds/siggychat.mp3');
    audio.loop   = true;
    audio.volume = 0.35;
    audioRef.current = audio;
    const unlock = () => { audio.play().catch(() => {}); };
    document.addEventListener('click',      unlock, { once: true });
    document.addEventListener('keydown',    unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
    if (!isMuted && audioRef.current.paused) audioRef.current.play().catch(() => {});
  }, [isMuted]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/siggychat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const content = data.reply || (data.error ? `⚠️ ${data.error}` : '…the Forge is silent.');
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Network error: ${err.message}` }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      // Dots.png background — covers full page, fixed so it doesn't scroll
      backgroundImage: "url('/brand-assets/Patterns/Dots.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      // Dark overlay so dots are visible but not blinding
      backgroundColor: '#050510',
      fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 16px 32px',
    }}>

      {/* Font declarations */}
      <style>{`
        @font-face {
          font-family: 'Barlow-ExtraBold';
          src: url('/brand-assets/Fonts/Barlow-ExtraBold.ttf') format('truetype');
          font-weight: 800;
        }
        @font-face {
          font-family: 'Barlow-Medium';
          src: url('/brand-assets/Fonts/Barlow-Medium.ttf') format('truetype');
          font-weight: 500;
        }
        @font-face {
          font-family: 'Barlow-Regular';
          src: url('/brand-assets/Fonts/Barlow-Regular.ttf') format('truetype');
          font-weight: 400;
        }
        @keyframes float {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-18px) scale(1.15); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 18px rgba(64,255,175,0.2); }
          50%       { box-shadow: 0 0 36px rgba(64,255,175,0.4), 0 0 60px rgba(136,64,255,0.2); }
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; transform: scaleY(0.6); }
          40%            { opacity: 1;   transform: scaleY(1); }
        }
        .msg-bubble { animation: fadeUp 0.3s ease forwards; }
        .send-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.04); box-shadow: 0 0 30px rgba(64,255,175,0.5) !important; }
        .send-btn:active:not(:disabled) { transform: scale(0.97); }
        .input-field:focus { outline: none; border-color: #40FFAF !important; box-shadow: 0 0 0 3px rgba(64,255,175,0.15); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a4a3a; border-radius: 4px; }
      `}</style>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '720px',
        paddingTop: '28px', paddingBottom: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left: Home + Mute */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontFamily: "'Barlow-Medium', 'Barlow', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#40FFAF',
              background: 'rgba(64,255,175,0.08)',
              border: '1px solid rgba(64,255,175,0.25)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>← Home</button>
          </Link>
          <button
            onClick={() => setIsMuted(m => !m)}
            title={isMuted ? 'Unmute music' : 'Mute music'}
            style={{
              padding: '8px 13px',
              fontSize: '1rem',
              color: isMuted ? 'rgba(64,255,175,0.3)' : '#40FFAF',
              background: isMuted ? 'rgba(10,20,15,0.5)' : 'rgba(64,255,175,0.08)',
              border: `1px solid ${isMuted ? 'rgba(64,255,175,0.1)' : 'rgba(64,255,175,0.25)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >{isMuted ? '🔇' : '🔊'}</button>
        </div>

        {/* Spacer */}
        <div style={{ width: '96px' }} />
      </div>

      {/* ── Logo + Title block ─────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '10px', marginBottom: '20px',
      }}>
        {/* Ritual logo */}
        <img
          src="/brand-assets/Lockup/Translucent.png"
          alt="Ritual"
          style={{
            width: 'clamp(160px, 30vw, 260px)',
            height: 'auto',
            filter: 'drop-shadow(0 0 20px rgba(64,255,175,0.4))',
          }}
        />

        {/* SIGGY CHAT heading */}
        <h1 style={{
          margin: 0,
          fontFamily: "'Barlow-ExtraBold', 'Barlow', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#40FFAF',
          textShadow: '0 0 30px rgba(64,255,175,0.5)',
        }}>✦ Siggy Chat ✦</h1>

        {/* Sub-heading */}
        <p style={{
          margin: 0,
          fontFamily: "'Barlow-Medium', 'Barlow', sans-serif",
          fontWeight: 500,
          fontSize: '0.78rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(64,255,175,0.5)',
        }}>Guardian of the Ritual Forge</p>
      </div>

      {/* ── Chat window — transparent so Dots.png shows through ─────────────── */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '720px',
        flex: 1,
        display: 'flex', flexDirection: 'column',
        // Transparent background — only a very subtle tint to keep text readable
        background: 'rgba(5, 5, 16, 0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(64,255,175,0.2)',
        borderRadius: '20px',
        overflow: 'hidden',
        animation: 'pulse-glow 5s ease-in-out infinite',
        minHeight: '52vh',
        maxHeight: 'calc(100vh - 340px)',
      }}>
        {/* Accent top bar */}
        <div style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #40FFAF, #8840FF, #40FFAF, transparent)',
        }} />

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '20px 18px',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className="msg-bubble"
              style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: '10px',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                background: msg.role === 'assistant'
                  ? 'linear-gradient(135deg, #8840FF, #E554E8)'
                  : 'linear-gradient(135deg, #064028, #40FFAF)',
                border: `2px solid ${msg.role === 'assistant' ? 'rgba(229,84,232,0.4)' : 'rgba(64,255,175,0.4)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem',
              }}>
                {msg.role === 'assistant' ? '😼' : '◈'}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '76%',
                padding: '11px 15px',
                borderRadius: msg.role === 'assistant' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                background: msg.role === 'assistant'
                  ? 'rgba(88,32,160,0.25)'
                  : 'rgba(10,50,30,0.35)',
                border: `1px solid ${msg.role === 'assistant' ? 'rgba(136,64,255,0.3)' : 'rgba(64,255,175,0.2)'}`,
                backdropFilter: 'blur(6px)',
              }}>
                {/* Sender label */}
                <div style={{
                  fontFamily: "'Barlow-ExtraBold', 'Barlow', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.6rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: msg.role === 'assistant' ? '#40FFAF' : 'rgba(64,255,175,0.6)',
                  marginBottom: '5px',
                }}>
                  {msg.role === 'assistant' ? 'Siggy' : 'You'}
                </div>
                {/* Message text */}
                <div style={{
                  fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
                  fontWeight: 400,
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  color: msg.role === 'assistant' ? '#e2d4ff' : '#c8f5e0',
                  letterSpacing: '0.01em',
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="msg-bubble" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #8840FF, #E554E8)',
                border: '2px solid rgba(229,84,232,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem',
              }}>😼</div>
              <div style={{
                padding: '13px 16px',
                borderRadius: '4px 16px 16px 16px',
                background: 'rgba(88,32,160,0.25)',
                border: '1px solid rgba(136,64,255,0.3)',
                display: 'flex', gap: '5px', alignItems: 'center',
              }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: '6px', height: '11px', borderRadius: '3px',
                    background: '#40FFAF',
                    animation: `blink 1.2s ease-in-out ${j * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input area ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '720px',
        marginTop: '14px',
        display: 'flex', gap: '10px', alignItems: 'center',
      }}>
        <input
          ref={inputRef}
          className="input-field"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Speak to the Forge, mortal…"
          disabled={loading}
          style={{
            flex: 1,
            padding: '13px 18px',
            fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
            fontWeight: 400,
            fontSize: '0.93rem',
            background: 'rgba(5, 5, 16, 0.55)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(64,255,175,0.2)',
            borderRadius: '12px',
            color: '#e2d4ff',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        />
        <button
          className="send-btn"
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            padding: '13px 22px',
            fontFamily: "'Barlow-ExtraBold', 'Barlow', sans-serif",
            fontWeight: 800,
            fontSize: '0.82rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: input.trim() && !loading ? '#050510' : 'rgba(64,255,175,0.3)',
            background: input.trim() && !loading
              ? 'linear-gradient(135deg, #40FFAF 0%, #077345 100%)'
              : 'rgba(10,30,20,0.5)',
            border: `1px solid ${input.trim() && !loading ? 'rgba(64,255,175,0.5)' : 'rgba(64,255,175,0.1)'}`,
            borderRadius: '12px',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            boxShadow: input.trim() && !loading ? '0 0 20px rgba(64,255,175,0.3)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          SEND ✦
        </button>
      </div>

      {/* Footer hint */}
      <p style={{
        position: 'relative', zIndex: 1,
        marginTop: '10px',
        fontFamily: "'Barlow-Regular', 'Barlow', sans-serif",
        fontSize: '0.65rem',
        color: 'rgba(64,255,175,0.3)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>
        Press Enter to send · Powered by the Ritual Forge
      </p>
    </div>
  );
}
