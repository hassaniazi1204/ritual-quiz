'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

// Ball level configuration
const BALL_CONFIG = [
  { level: 1, radius: 15, image: '/avatars/stefan2.png', color: '#8B5CF6', score: 10, name: 'stefan' },
  { level: 2, radius: 18, image: '/avatars/raintaro2.png', color: '#3B82F6', score: 20, name: 'raintaro' },
  { level: 3, radius: 22, image: '/avatars/itoshi2.png', color: '#EC4899', score: 30, name: 'itoshi' },
  { level: 4, radius: 26, image: '/avatars/hinata1.png', color: '#F59E0B', score: 40, name: 'hinata' },
  { level: 5, radius: 30, image: '/avatars/majorproject2.png', color: '#10B981', score: 50, name: 'majorproject' },
  { level: 6, radius: 34, image: '/avatars/jezz1.png', color: '#EF4444', score: 60, name: 'jezz' },
  { level: 7, radius: 38, image: '/avatars/dunken2.png', color: '#8B5CF6', score: 70, name: 'dunken' },
  { level: 8, radius: 42, image: '/avatars/josh2.png', color: '#3B82F6', score: 80, name: 'josh' },
  { level: 9, radius: 46, image: '/avatars/niraj2.png', color: '#EC4899', score: 90, name: 'niraj' },
  { level: 10, radius: 52, image: '/avatars/ritual2.png', color: '#F59E0B', score: 100, name: 'ritual' },
];

interface Ball {
  body: Matter.Body;
  level: number;
  image: HTMLImageElement;
  id: number;
}

let ballIdCounter = 0;

export default function MergeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const imagesRef = useRef<{ [key: number]: HTMLImageElement }>({});
  const processingMergeRef = useRef<Set<string>>(new Set());
  const canDropRef = useRef(true);
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentBallLevel, setCurrentBallLevel] = useState(1);
  const [nextBallLevel, setNextBallLevel] = useState(2);
  const [dropPosition, setDropPosition] = useState(180);
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  
  const gameWidth = 360;
  const gameHeight = 800;
  const topBoundary = 150;
  const wallThickness = 5;

  // Load all avatar images
  useEffect(() => {
    BALL_CONFIG.forEach((config) => {
      const img = new Image();
      img.src = config.image;
      img.crossOrigin = 'anonymous';
      imagesRef.current[config.level] = img;
    });
  }, []);

  // Initialize Matter.js physics engine
  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1 },
    });
    engineRef.current = engine;
    worldRef.current = engine.world;

    const wallOptions = { isStatic: true, render: { fillStyle: '#8B5CF6' } };
    
    const ground = Matter.Bodies.rectangle(gameWidth / 2, gameHeight - wallThickness / 2, gameWidth, wallThickness, wallOptions);
    const leftWall = Matter.Bodies.rectangle(wallThickness / 2, gameHeight / 2, wallThickness, gameHeight, wallOptions);
    const rightWall = Matter.Bodies.rectangle(gameWidth - wallThickness / 2, gameHeight / 2, wallThickness, gameHeight, wallOptions);
    
    Matter.World.add(engine.world, [ground, leftWall, rightWall]);

    Matter.Engine.run(engine);

    // Custom render loop
    const customRender = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, gameWidth, gameHeight);
      ctx.fillStyle = '#0F0F23';
      ctx.fillRect(0, 0, gameWidth, gameHeight);
      
      // Draw top boundary line
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(wallThickness, topBoundary);
      ctx.lineTo(gameWidth - wallThickness, topBoundary);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw walls
      ctx.fillStyle = '#8B5CF6';
      ctx.fillRect(0, gameHeight - wallThickness, gameWidth, wallThickness);
      ctx.fillRect(0, 0, wallThickness, gameHeight);
      ctx.fillRect(gameWidth - wallThickness, 0, wallThickness, gameHeight);

      // Draw all balls
      ballsRef.current.forEach((ball) => {
        const { body, level, image } = ball;
        const config = BALL_CONFIG[level - 1];
        
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        const vibrationIntensity = level * 0.3;
        const vibrationX = (Math.random() - 0.5) * vibrationIntensity;
        const vibrationY = (Math.random() - 0.5) * vibrationIntensity;

        // Glow
        const gradient = ctx.createRadialGradient(vibrationX, vibrationY, 0, vibrationX, vibrationY, config.radius);
        gradient.addColorStop(0, config.color + '66');
        gradient.addColorStop(1, config.color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(vibrationX, vibrationY, config.radius + 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(vibrationX, vibrationY, config.radius, 0, Math.PI * 2);
        ctx.fill();

        if (image && image.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(vibrationX, vibrationY, config.radius - 1, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            image,
            vibrationX - config.radius,
            vibrationY - config.radius,
            config.radius * 2,
            config.radius * 2
          );
          ctx.restore();
        }

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(vibrationX, vibrationY, config.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      // Draw preview ball following cursor
      if (!gameOver && canDropRef.current) {
        const previewConfig = BALL_CONFIG[currentBallLevel - 1];
        const previewImage = imagesRef.current[currentBallLevel];
        
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.translate(dropPosition, 80);

        ctx.fillStyle = previewConfig.color;
        ctx.beginPath();
        ctx.arc(0, 0, previewConfig.radius, 0, Math.PI * 2);
        ctx.fill();

        if (previewImage && previewImage.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, 0, previewConfig.radius - 1, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            previewImage,
            -previewConfig.radius,
            -previewConfig.radius,
            previewConfig.radius * 2,
            previewConfig.radius * 2
          );
          ctx.restore();
        }

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, previewConfig.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Draw drop line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(dropPosition, 80 + previewConfig.radius);
        ctx.lineTo(dropPosition, gameHeight - wallThickness);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      requestAnimationFrame(customRender);
    };
    customRender();

    // Collision detection
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        if (bodyA.isStatic || bodyB.isStatic) return;

        const ballA = ballsRef.current.find(b => b.body.id === bodyA.id);
        const ballB = ballsRef.current.find(b => b.body.id === bodyB.id);

        if (!ballA || !ballB) return;
        if (ballA.level !== ballB.level) return;

        const mergeKey = [ballA.id, ballB.id].sort().join('-');
        if (processingMergeRef.current.has(mergeKey)) return;
        processingMergeRef.current.add(mergeKey);

        const mergeLevel = ballA.level;
        const mergeScore = BALL_CONFIG[mergeLevel - 1].score;
        
        const mergeX = (bodyA.position.x + bodyB.position.x) / 2;
        const mergeY = (bodyA.position.y + bodyB.position.y) / 2;

        Matter.World.remove(engine.world, bodyA);
        Matter.World.remove(engine.world, bodyB);
        
        ballsRef.current = ballsRef.current.filter(b => b.id !== ballA.id && b.id !== ballB.id);

        const newLevel = mergeLevel === 10 ? 1 : mergeLevel + 1;
        
        setTimeout(() => {
          createBall(mergeX, mergeY, newLevel);
          setScore(prev => prev + mergeScore);
          triggerScreenShake(mergeLevel);
          processingMergeRef.current.delete(mergeKey);
        }, 50);
      });
    });

    // Game over detection
    const checkGameOver = setInterval(() => {
      if (gameOver) return;
      
      const anyBallAbove = ballsRef.current.some(ball => {
        const config = BALL_CONFIG[ball.level - 1];
        const topOfBall = ball.body.position.y - config.radius;
        const isAboveLine = topOfBall < topBoundary;
        const isSettled = Math.abs(ball.body.velocity.y) < 0.5 && Math.abs(ball.body.velocity.x) < 0.5;
        return isAboveLine && isSettled;
      });
      
      if (anyBallAbove) {
        setGameOver(true);
        setShowCardForm(true);
      }
    }, 500);

    return () => {
      clearInterval(checkGameOver);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      ballsRef.current = [];
      processingMergeRef.current.clear();
      engineRef.current = null;
      worldRef.current = null;
    };
  }, [gameOver]);

  const createBall = (x: number, y: number, level: number) => {
    if (!worldRef.current) return;

    const config = BALL_CONFIG[level - 1];
    const body = Matter.Bodies.circle(x, y, config.radius, {
      restitution: 0.2,
      friction: 0.3,
      density: 0.001,
    });

    Matter.World.add(worldRef.current, body);
    
    ballsRef.current.push({
      body,
      level,
      image: imagesRef.current[level],
      id: ballIdCounter++,
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || !canDropRef.current) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const scaleX = gameWidth / rect.width;
    const actualX = x * scaleX;
    
    const config = BALL_CONFIG[currentBallLevel - 1];
    const clampedX = Math.max(wallThickness + config.radius + 2, Math.min(gameWidth - wallThickness - config.radius - 2, actualX));
    
    createBall(clampedX, 80, currentBallLevel);
    
    canDropRef.current = false;
    
    setTimeout(() => {
      canDropRef.current = true;
    }, 800);
    
    setCurrentBallLevel(nextBallLevel);
    
    const random = Math.random();
    if (random < 0.4) setNextBallLevel(1);
    else if (random < 0.7) setNextBallLevel(2);
    else if (random < 0.85) setNextBallLevel(3);
    else setNextBallLevel(4);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || !canDropRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const scaleX = gameWidth / rect.width;
    const actualX = x * scaleX;
    
    const config = BALL_CONFIG[currentBallLevel - 1];
    const clampedX = Math.max(wallThickness + config.radius + 2, Math.min(gameWidth - wallThickness - config.radius - 2, actualX));
    setDropPosition(clampedX);
  };

  const triggerScreenShake = (intensity: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const shakeAmount = intensity * 1.5;
    const duration = 150;
    const startTime = Date.now();

    const shake = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        canvas.style.transform = 'translate(0, 0)';
        return;
      }

      const x = (Math.random() - 0.5) * shakeAmount;
      const y = (Math.random() - 0.5) * shakeAmount;
      canvas.style.transform = `translate(${x}px, ${y}px)`;
      
      requestAnimationFrame(shake);
    };
    shake();
  };

  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    setShowCardForm(false);
    setUserName('');
    setUserImage(null);
    setCurrentBallLevel(1);
    setNextBallLevel(2);
    ballsRef.current = [];
    processingMergeRef.current.clear();
    ballIdCounter = 0;
    canDropRef.current = true;
    
    if (engineRef.current && worldRef.current) {
      const bodies = Matter.Composite.allBodies(worldRef.current);
      bodies.forEach(body => {
        if (!body.isStatic) {
          Matter.World.remove(worldRef.current!, body);
        }
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUserImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateCard = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    setShowCardForm(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-ritual-dark to-ritual-darker p-4 md:p-8">
      <div className="max-w-6xl mx-auto mb-4">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ritual-purple/20 border-2 border-ritual-purple rounded-xl font-bold hover:scale-105 transition-transform"
        >
          ← Back to Quiz
        </a>
      </div>

      <div className="max-w-6xl mx-auto mb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-2" style={{ color: '#A78BFA' }}>
          Ritual Merge Game
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Drop and merge balls to score points!
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gradient-to-br from-ritual-purple/20 to-ritual-blue/20 p-4 rounded-2xl border border-ritual-purple/50">
            <h3 className="text-xl font-bold text-white mb-3">Score</h3>
            <p className="text-5xl font-black" style={{ color: '#A78BFA' }}>
              {score}
            </p>
          </div>

          <div className="bg-gradient-to-br from-ritual-purple/20 to-ritual-blue/20 p-4 rounded-2xl border border-ritual-purple/50">
            <h3 className="text-lg font-bold text-white mb-3">Next Ball</h3>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: BALL_CONFIG[nextBallLevel - 1].color }}
                >
                  {imagesRef.current[nextBallLevel]?.complete && (
                    <img 
                      src={BALL_CONFIG[nextBallLevel - 1].image}
                      alt="Next"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <p className="text-center text-sm text-gray-300 mt-2">
                  {BALL_CONFIG[nextBallLevel - 1].name}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-ritual-purple/20 to-ritual-blue/20 p-4 rounded-2xl border border-ritual-purple/50">
            <h3 className="text-lg font-bold text-white mb-3 text-center">Merge Guide</h3>
            <div className="relative w-full aspect-square max-w-[200px] mx-auto">
              {BALL_CONFIG.map((config, index) => {
                const angle = (index / BALL_CONFIG.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 70;
                const x = 50 + radius * Math.cos(angle);
                const y = 50 + radius * Math.sin(angle);
                
                return (
                  <div
                    key={config.level}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div 
                      className="w-9 h-9 rounded-full overflow-hidden border border-white/30"
                      style={{ backgroundColor: config.color }}
                    >
                      {imagesRef.current[config.level]?.complete && (
                        <img 
                          src={config.image}
                          alt={config.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <p className="text-[9px] text-gray-400 text-center mt-0.5 truncate w-10">
                      {config.name}
                    </p>
                  </div>
                );
              })}
              
              {/* Arrows between levels */}
              {BALL_CONFIG.map((_, index) => {
                const angle1 = (index / BALL_CONFIG.length) * 2 * Math.PI - Math.PI / 2;
                const angle2 = ((index + 1) / BALL_CONFIG.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 70;
                const x1 = 50 + radius * Math.cos(angle1);
                const y1 = 50 + radius * Math.sin(angle1);
                const x2 = 50 + radius * Math.cos(angle2);
                const y2 = 50 + radius * Math.sin(angle2);
                
                return (
                  <svg
                    key={`arrow-${index}`}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 0 }}
                  >
                    <defs>
                      <marker
                        id={`arrowhead-${index}`}
                        markerWidth="6"
                        markerHeight="6"
                        refX="5"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 6 3, 0 6" fill="rgba(139, 92, 246, 0.5)" />
                      </marker>
                    </defs>
                    <line
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="rgba(139, 92, 246, 0.5)"
                      strokeWidth="1"
                      markerEnd={`url(#arrowhead-${index})`}
                    />
                  </svg>
                );
              })}
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="lg:col-span-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={gameWidth}
              height={gameHeight}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              className="border border-ritual-purple rounded-2xl shadow-2xl cursor-crosshair mx-auto bg-[#0F0F23]"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            
            {gameOver && showCardForm && (
              <div className="absolute inset-0 bg-black/90 rounded-2xl flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-sm w-full">
                  <h2 className="text-3xl font-bold text-white">Game Over!</h2>
                  <p className="text-5xl font-black" style={{ color: '#A78BFA' }}>
                    {score}
                  </p>
                  <p className="text-xl text-gray-300">Points</p>
                  
                  <div className="bg-ritual-dark p-4 rounded-xl space-y-3">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-ritual-purple outline-none"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-xs file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-ritual-purple file:text-white file:text-xs"
                    />
                    <button
                      onClick={generateCard}
                      className="w-full py-2 bg-ritual-gradient rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                    >
                      Generate Card
                    </button>
                  </div>
                  
                  <button
                    onClick={restartGame}
                    className="px-6 py-2 bg-ritual-purple rounded-xl font-bold text-white hover:scale-105 transition-transform"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}

            {gameOver && !showCardForm && (
              <div className="absolute inset-0 bg-black/90 rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-white">Final Score</h2>
                  <p className="text-6xl font-black" style={{ color: '#A78BFA' }}>
                    {score}
                  </p>
                  <button
                    onClick={restartGame}
                    className="px-8 py-3 bg-ritual-purple rounded-xl font-bold text-white hover:scale-105 transition-transform"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gradient-to-br from-ritual-purple/20 to-ritual-blue/20 p-4 rounded-2xl border border-ritual-purple/50">
            <h3 className="text-lg font-bold text-white mb-3">How to Play</h3>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li>🎯 Click to drop balls</li>
              <li>🔄 Merge same levels</li>
              <li>⬆️ Level up to score</li>
              <li>🔁 Lv10 + Lv10 = Lv1</li>
              <li>❌ Don't cross red line!</li>
              <li>⏳ Wait for ball to settle</li>
            </ul>
          </div>

          <button
            onClick={restartGame}
            className="w-full py-3 bg-red-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
          >
            🔄 Restart
          </button>
        </div>
      </div>
    </main>
  );
}
