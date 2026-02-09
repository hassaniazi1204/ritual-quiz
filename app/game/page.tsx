'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

// ----------------------------------------------------
//  Ball configuration
// ----------------------------------------------------
const BALL_CONFIG = [
  { level: 1, radius: 20, image: '/avatars/stefan2.png', color: '#8B5CF6', score: 10 },
  { level: 2, radius: 25, image: '/avatars/raintaro2.png', color: '#3B82F6', score: 20 },
  { level: 3, radius: 30, image: '/avatars/itoshi2.png', color: '#EC4899', score: 30 },
  { level: 4, radius: 35, image: '/avatars/hinata1.png', color: '#F59E0B', score: 40 },
  { level: 5, radius: 40, image: '/avatars/majorproject2.png', color: '#10B981', score: 50 },
  { level: 6, radius: 45, image: '/avatars/jezz1.png', color: '#EF4444', score: 60 },
  { level: 7, radius: 50, image: '/avatars/dunken2.png', color: '#8B5CF6', score: 70 },
  { level: 8, radius: 55, image: '/avatars/josh2.png', color: '#3B82F6', score: 80 },
  { level: 9, radius: 60, image: '/avatars/niraj2.png', color: '#EC4899', score: 90 },
  { level: 10, radius: 70, image: '/avatars/ritual2.png', color: '#F59E0B', score: 100 },
];

interface Ball {
  body: Matter.Body;
  level: number;
  image: HTMLImageElement;
}

// ----------------------------------------------------
//  Main component
// ----------------------------------------------------
export default function MergeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const imagesRef = useRef<{ [key: number]: HTMLImageElement }>({});

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [currentBallLevel, setCurrentBallLevel] = useState(1);
  const [nextBallLevel, setNextBallLevel] = useState(1);
  const [dropPosition, setDropPosition] = useState(400);
  const [canDrop, setCanDrop] = useState(true); // ← prevents early drops
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);

  const gameWidth = 420;
  const gameHeight = 720;
  const topBoundary = 100;
  const wallThickness = 5; // 1/4 of original 20

  // ----------------------------------------------------
  //  Load images
  // ----------------------------------------------------
  useEffect(() => {
    BALL_CONFIG.forEach((c) => {
      const img = new Image();
      img.src = c.image;
      imagesRef.current[c.level] = img;
    });
  }, []);

// ----------------------------------------------------
//  Initialise Matter.js (only the wall section changed)
// ----------------------------------------------------
useEffect(() => {
  if (!canvasRef.current) return;

  const engine = Matter.Engine.create({ gravity: { x: 0, y: 1 } });
  engineRef.current = engine;
  worldRef.current = engine.world;

  const render = Matter.Render.create({
    canvas: canvasRef.current,
    engine,
    options: {
      width: gameWidth,
      height: gameHeight,
      wireframes: false,
      background: '#0F0F23',
    },
  });
  renderRef.current = render;

  const runner = Matter.Runner.create();
  runnerRef.current = runner;
  Matter.Runner.run(runner, engine);
  Matter.Render.run(render);

  // ----------  NEW: physics walls (thicker) ----------
  const visualThickness = 5;      // what you see on the screen
  const physicsThickness = 20;    // actual static bodies for collisions

  const wallOpts = { isStatic: true, render: { visible: false } }; // invisible physics bodies

  // Ground – placed *inside* the canvas, but 20 px thick for physics
  const ground = Matter.Bodies.rectangle(
    gameWidth / 2,
    gameHeight - physicsThickness / 2,   // inside canvas
    gameWidth,
    physicsThickness,
    wallOpts
  );

  // Left wall – 20 px thick for physics
  const leftWall = Matter.Bodies.rectangle(
    physicsThickness / 2,
    gameHeight / 2,
    physicsThickness,
    gameHeight,
    wallOpts
  );

  // Right wall – 20 px thick for physics
  const rightWall = Matter.Bodies.rectangle(
    gameWidth - physicsThickness / 2,
    gameHeight / 2,
    physicsThickness,
    gameHeight,
    wallOpts
  );

  Matter.World.add(engine.world, [ground, leftWall, rightWall]);

  // ----------------------------------------------------
  //  Custom render loop – draw the *thin* visual walls
  // ----------------------------------------------------
  const customRender = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, gameWidth, gameHeight);
    ctx.fillStyle = '#0F0F23';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    // top danger line
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(0, topBoundary);
    ctx.lineTo(gameWidth, topBoundary);
    ctx.stroke();
    ctx.setLineDash([]);

    // ----- draw the *visual* thin walls (5 px) -----
    ctx.fillStyle = '#8B5CF6';
    ctx.fillRect(0, gameHeight - visualThickness, gameWidth, visualThickness); // ground
    ctx.fillRect(0, 0, visualThickness, gameHeight);                           // left wall
    ctx.fillRect(gameWidth - visualThickness, 0, visualThickness, gameHeight); // right wall

    // … (the rest of your custom rendering – balls, preview, etc.) …
    requestAnimationFrame(customRender);
  };
  customRender();

  // ----------------------------------------------------
  //  Collision, game‑over, cleanup – unchanged
  // ----------------------------------------------------
  // … (your existing collisionStart, game‑over interval, etc.) …
}, [gameOver]);


      // draw balls
      ballsRef.current.forEach((ball) => {
        const { body, level, image } = ball;
        const cfg = BALL_CONFIG[level - 1];
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        const vib = level * 0.5;
        const vibX = (Math.random() - 0.5) * vib;
        const vibY = (Math.random() - 0.5) * vib;

        // glow
        const grad = ctx.createRadialGradient(vibX, vibY, 0, vibX, vibY, cfg.radius);
        grad.addColorStop(0, cfg.color + '88');
        grad.addColorStop(1, cfg.color + '00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(vibX, vibY, cfg.radius + 5, 0, Math.PI * 2);
        ctx.fill();

        // ball background
        ctx.fillStyle = cfg.color;
        ctx.beginPath();
        ctx.arc(vibX, vibY, cfg.radius, 0, Math.PI * 2);
        ctx.fill();

        // avatar
        if (image.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(vibX, vibY, cfg.radius - 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(image, vibX - cfg.radius, vibY - cfg.radius, cfg.radius * 2, cfg.radius * 2);
          ctx.restore();
        }

        // border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(vibX, vibY, cfg.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      // preview of current ball
      if (!gameOver) {
        const cfg = BALL_CONFIG[currentBallLevel - 1];
        const img = imagesRef.current[currentBallLevel];
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.translate(dropPosition, 50);
        ctx.fillStyle = cfg.color;
        ctx.beginPath();
        ctx.arc(0, 0, cfg.radius, 0, Math.PI * 2);
        ctx.fill();

        if (img?.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, 0, cfg.radius - 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, -cfg.radius, -cfg.radius, cfg.radius * 2, cfg.radius * 2);
          ctx.restore();
        }

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, cfg.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      requestAnimationFrame(customRender);
    };
    customRender();

    // --------------------
    //  Collision – merging
    // --------------------
    Matter.Events.on(engine, 'collisionStart', (e) => {
      e.pairs.forEach((pair) => {
        const ballA = ballsRef.current.find((b) => b.body === pair.bodyA);
        const ballB = ballsRef.current.find((b) => b.body === pair.bodyB);
        if (
          ballA &&
          ballB &&
          ballA.level === ballB.level &&
          !ballA.body.isStatic &&
          !ballB.body.isStatic
        ) {
          const mergeLevel = ballA.level;
          const mergeScore = BALL_CONFIG[mergeLevel - 1].score;
          const mx = (pair.bodyA.position.x + pair.bodyB.position.x) / 2;
          const my = (pair.bodyA.position.y + pair.bodyB.position.y) / 2;

          Matter.World.remove(engine.world, pair.bodyA);
          Matter.World.remove(engine.world, pair.bodyB);
          ballsRef.current = ballsRef.current.filter(
            (b) => b.body !== pair.bodyA && b.body !== pair.bodyB
          );

          const newLevel = mergeLevel === 10 ? 1 : mergeLevel + 1;
          setTimeout(() => {
            createBall(mx, my, newLevel);
            setScore((s) => s + mergeScore);
            triggerScreenShake(mergeLevel);
          }, 100);
        }
      });
    });

    // --------------------
    //  Game‑over detection
    // --------------------
    const gameOverInterval = setInterval(() => {
      const tooHigh = ballsRef.current.some(
        (b) => b.body.position.y < topBoundary && b.body.velocity.y < 0.1
      );
      if (tooHigh && !gameOver) {
        setGameOver(true);
        setShowCardForm(true);
        cleanMatter();
      }
    }, 500);

    // cleanup helper
    const cleanMatter = () => {
      Matter.Render.stop(render);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      Matter.Engine.clear(engine);
    };

    // component cleanup
    return () => {
      clearInterval(gameOverInterval);
      cleanMatter();
    };
  }, [gameOver]);

  // ----------------------------------------------------
  //  Create a ball
  // ----------------------------------------------------
  const createBall = (x: number, y: number, level: number) => {
    if (!worldRef.current) return;

    // prune old bodies
    if (ballsRef.current.length > 180) {
      const toRemove = ballsRef.current.slice(0, 30);
      toRemove.forEach((b) => Matter.World.remove(worldRef.current!, b.body));
      ballsRef.current = ballsRef.current.slice(30);
    }

    const cfg = BALL_CONFIG[level - 1];
    const body = Matter.Bodies.circle(x, y, cfg.radius, {
      restitution: 0.25,
      friction: 0.4,
    });
    Matter.World.add(worldRef.current, body);
    ballsRef.current.push({ body, level, image: imagesRef.current[level] });
  };

  // ----------------------------------------------------
  //  Drop ball – now respects canDrop & updates next ball correctly
  // ----------------------------------------------------
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || !canDrop) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;

    // drop current ball
    createBall(x, 50, currentBallLevel);

    // disable further drops until everything settles
    setCanDrop(false);

    // compute next ball level first
    const rand = Math.random();
    const newNext = rand < 0.5 ? 1 : rand < 0.8 ? 2 : 3;

    // promote current ← next, then set new next
    setCurrentBallLevel(nextBallLevel);
    setNextBallLevel(newNext);
  };

  // ----------------------------------------------------
  //  Re‑enable dropping when all balls are almost still
  // ----------------------------------------------------
  useEffect(() => {
    if (canDrop) return;
    const checker = setInterval(() => {
      const moving = ballsRef.current.some((b) => b.body.speed > 0.5);
      if (!moving) {
        setCanDrop(true);
        clearInterval(checker);
      }
    }, 300);
    return () => clearInterval(checker);
  }, [canDrop]);

  // ----------------------------------------------------
  //  Mouse move – preview follows pointer
  // ----------------------------------------------------
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(40, Math.min(gameWidth - 40, e.clientX - rect.left));
    setDropPosition(x);
  };

  // ----------------------------------------------------
  //  Screen shake
  // ----------------------------------------------------
  const triggerScreenShake = (intensity: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const amt = intensity * 2;
    const dur = 200;
    const start = Date.now();

    const shake = () => {
      const elapsed = Date.now() - start;
      if (elapsed > dur) {
        canvas.style.transform = 'translate(0,0)';
        return;
      }
      const x = (Math.random() - 0.5) * amt;
      const y = (Math.random() - 0.5) * amt;
      canvas.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(shake);
    };
    shake();
  };

  // ----------------------------------------------------
  //  Restart
  // ----------------------------------------------------
  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    setShowCardForm(false);
    setCurrentBallLevel(1);
    setNextBallLevel(1);
    setUserName('');
    setUserImage(null);
    ballsRef.current = [];

    if (engineRef.current && worldRef.current) {
      Matter.World.clear(worldRef.current, false);
      Matter.Engine.clear(engineRef.current);
    }
    setCanDrop(true);
  };

  // ----------------------------------------------------
  //  UI helpers
  // ----------------------------------------------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUserImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generateCard = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    setShowCardForm(false);
  };

  // ----------------------------------------------------
  //  Render
  // ----------------------------------------------------
  return (
    <main className="min-h-screen bg-gradient-to-br from-ritual-dark to-ritual-darker p-8">
      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-4">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ritual-purple/20 border-2 border-ritual-purple rounded-xl font-bold hover:scale-105 transition-transform"
        >
          ← Back to Quiz
        </a>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 text-center">
        <h1
          className="text-5xl font-black text-gradient mb-4"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Ritual Merge Game
        </h1>
        <p className="text-gray-400 text-lg">Drop and merge balls to score points!</p>
      </div>

      {/* Game & Sidebar */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={gameWidth}
              height={gameHeight}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              className="border-4 border-ritual-purple rounded-2xl shadow-2xl cursor-crosshair mx-auto"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            {gameOver && !showCardForm && (
              <div className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-6 p-8">
                  <h2 className="text-4xl font-bold text-white">Game Over!</h2>
                  <p
                    className="text-6xl font-black text-gradient"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #EC4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {score}
                  </p>
                  <p className="text-2xl text-gray-300">Points</p>

                  {/* Card Form */}
                  <div className="bg-ritual-dark p-6 rounded-xl space-y-4 max-w-md mx-auto">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-ritual-purple outline-none"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-ritual-purple file:text-white"
                    />
                    <button
                      onClick={generateCard}
                      className="w-full py-3 bg-ritual-gradient rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                      Generate Score Card
                    </button>
                  </div>

                  <button
                    onClick={restartGame}
                    className="px-8 py-4 bg-ritual-purple rounded-xl font-bold text-white hover:scale-105 transition-transform"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Score */}
          <div className="bg-gradient-to-br from-ritual-purple/20 to-ritual-blue/20 p-6 rounded-2xl border-2 border-ritual-purple/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">Score</h3>
            <p
              className="text-6xl font-black text-gradient"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {score}
            </p>
          </div>

          {/* Next ball */}
          <div className="bg-gradient-to-br from-ritual-purple/20 to-ritual-blue/20 p-6 rounded-2xl border-2 border-ritual-purple/50">
            <h3 className="text-xl font-bold text-white mb-3">Next Ball</h3>
            <div
              className="w-20 h-20 rounded-full mx-auto border-4 border-white overflow-hidden"
              style={{ background: BALL_CONFIG[nextBallLevel - 1].color }}
            >
              <img
                src={BALL_CONFIG[nextBallLevel - 1].image}
                className="w-full h-full object-cover"
                alt={`Level ${nextBallLevel}`}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-ritual-purple/20 to-ritual-blue/20 p-6 rounded-2xl border-2 border-ritual-purple/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>🎯 Click to drop balls</li>
              <li>🔄 Merge same levels</li>
              <li>⬆️ Level up to score more</li>
              <li>🔁 Level 10 + 10 = Level 1</li>
              <li>❌ Don't cross the red line!</li>
            </ul>
          </div>

          {/* Ball levels */}
          <div className="grid grid-cols-5 gap-3">
            {BALL_CONFIG.map((c) => (
              <div key={c.level} className="text-center">
                <div
                  className="w-12 h-12 rounded-full overflow-hidden mx-auto border-2 border-white"
                  style={{ background: c.color }}
                >
                  <img src={c.image} className="w-full h-full object-cover" alt={`Lv${c.level}`} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Lv{c.level}</p>
              </div>
            ))}
          </div>

          {/* Restart */}
          <button
            onClick={restartGame}
            className="w-full py-4 bg-red-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
          >
            🔄 Restart Game
          </button>
        </div>
      </div>
    </main>
  );
}
