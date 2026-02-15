'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

// Ball level configuration
const BALL_CONFIG = [
  { level: 1, radius: 30, image: '/avatars/stefan2.png', color: '#8B5CF6', score: 10, name: 'stefan' },
  { level: 2, radius: 36, image: '/avatars/raintaro2.png', color: '#3B82F6', score: 20, name: 'raintaro' },
  { level: 3, radius: 44, image: '/avatars/itoshi2.png', color: '#EC4899', score: 30, name: 'itoshi' },
  { level: 4, radius: 52, image: '/avatars/hinata2.png', color: '#F59E0B', score: 40, name: 'hinata' },
  { level: 5, radius: 60, image: '/avatars/majorproject2.png', color: '#10B981', score: 50, name: 'majorproject' },
  { level: 6, radius: 68, image: '/avatars/jezz2.png', color: '#EF4444', score: 60, name: 'jezz' },
  { level: 7, radius: 76, image: '/avatars/dunken2.png', color: '#8B5CF6', score: 70, name: 'dunken' },
  { level: 8, radius: 84, image: '/avatars/josh2.png', color: '#3B82F6', score: 80, name: 'josh' },
  { level: 9, radius: 92, image: '/avatars/niraj2.png', color: '#EC4899', score: 90, name: 'niraj' },
  { level: 10, radius: 104, image: '/avatars/ritual2.png', color: '#F59E0B', score: 100, name: 'ritual' },
];

interface Ball {
  body: Matter.Body;
  level: number;
  image: HTMLImageElement;
  id: number;
}

let ballIdCounter = 0;

// Helper function to get random ball level (weighted towards lower levels)
const getRandomBallLevel = (): number => {
  const random = Math.random();
  if (random < 0.4) return 1;
  if (random < 0.7) return 2;
  if (random < 0.85) return 3;
  if (random < 0.95) return 4;
  return 5;
};

export default function MergeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const imagesRef = useRef<{ [key: number]: HTMLImageElement }>({});
  const processingMergeRef = useRef<Set<string>>(new Set());
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Refs for render loop to access latest values
  const currentBallRef = useRef(1);
  const dropPositionRef = useRef(180);
  const canDropBallRef = useRef(true);
  const gameOverRef = useRef(false);
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentBall, setCurrentBall] = useState(1);
  const [nextBall, setNextBall] = useState(2);
  const [canDropBall, setCanDropBall] = useState(true);
  const [dropPosition, setDropPosition] = useState(180);
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  
  const gameWidth = 360;
  const gameHeight = 800;
  const topBoundary = 310;  // Lowered by 20% of gameHeight (160px) from 150 to 310
  const wallThickness = 5;
  const spawnY = 120;  // Below Score/Next Ball UI (which ends at ~90px)

  // Load all avatar images
  useEffect(() => {
    BALL_CONFIG.forEach((config) => {
      const img = new Image();
      img.src = config.image;
      img.crossOrigin = 'anonymous';
      imagesRef.current[config.level] = img;
    });
    
    // Initialize next ball
    setNextBall(getRandomBallLevel());
  }, []);

  // Initialize Matter.js physics engine
  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.2 },  // Increased gravity for faster falling
    });
    engineRef.current = engine;
    worldRef.current = engine.world;

    const wallOptions = { isStatic: true, render: { fillStyle: '#8B5CF6' } };
    
    // Create thicker, more solid ground
    const groundHeight = 20;
    const ground = Matter.Bodies.rectangle(
      gameWidth / 2, 
      gameHeight - groundHeight / 2, 
      gameWidth, 
      groundHeight, 
      wallOptions
    );
    
    const leftWall = Matter.Bodies.rectangle(wallThickness / 2, gameHeight / 2, wallThickness, gameHeight, wallOptions);
    const rightWall = Matter.Bodies.rectangle(gameWidth - wallThickness / 2, gameHeight / 2, wallThickness, gameHeight, wallOptions);
    
    Matter.World.add(engine.world, [ground, leftWall, rightWall]);
    
    console.log('✅ Physics initialized - Ground at y:', gameHeight - groundHeight / 2);
    
    // Run physics engine with proper timing
    const runner = Matter.Runner.create({
      delta: 1000 / 60,  // 60 FPS
      isFixed: true,
    });
    Matter.Runner.run(runner, engine);

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

      // Draw walls (visual representation)
      const groundHeight = 20;
      ctx.fillStyle = '#8B5CF6';
      ctx.fillRect(0, gameHeight - groundHeight, gameWidth, groundHeight);
      ctx.fillRect(0, 0, wallThickness, gameHeight);
      ctx.fillRect(gameWidth - wallThickness, 0, wallThickness, gameHeight);

      // Remove balls that fell out of bounds
      ballsRef.current = ballsRef.current.filter(ball => {
        const inBounds = ball.body.position.y < gameHeight + 100; // Add buffer
        if (!inBounds && worldRef.current) {
          console.log(`❌ Ball ${ball.id} fell out of bounds at y=${ball.body.position.y}`);
          Matter.World.remove(worldRef.current, ball.body);
        }
        return inBounds;
      });

      // Draw all balls
      ballsRef.current.forEach((ball) => {
        const { body, level, image } = ball;
        const config = BALL_CONFIG[level - 1];
        
        // Debug: Log if ball position seems wrong
        if (body.position.y > gameHeight - 50 && body.position.y < gameHeight + 50) {
          console.log(`⚠️ Ball ${ball.id} near ground: y=${body.position.y.toFixed(1)}, velocity=${body.velocity.y.toFixed(2)}`);
        }
        
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

      // ============ TOP OVERLAY UI - INSIDE CANVAS ============
      
      // 1. Draw Score - Top Left
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(10, 10, 140, 60);
      
      // Score border
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 140, 60);
      
      // Score label
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('SCORE', 20, 30);
      
      // Score value
      ctx.fillStyle = '#A78BFA';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(score.toString(), 20, 60);
      ctx.restore();
      
      // 2. Draw Next Ball - Top Right
      const nextBallConfig = BALL_CONFIG[nextBall - 1];
      const nextBallImage = imagesRef.current[nextBall];
      
      ctx.save();
      // Background panel
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(gameWidth - 110, 10, 100, 80);
      
      // Border
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(gameWidth - 110, 10, 100, 80);
      
      // Label
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NEXT', gameWidth - 60, 30);
      
      // Next ball circle
      ctx.fillStyle = nextBallConfig.color;
      ctx.beginPath();
      ctx.arc(gameWidth - 60, 60, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Next ball image
      if (nextBallImage && nextBallImage.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(gameWidth - 60, 60, 19, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          nextBallImage,
          gameWidth - 60 - 20,
          60 - 20,
          40,
          40
        );
        ctx.restore();
      }
      
      // Border around ball
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gameWidth - 60, 60, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw preview ball following cursor
      if (!gameOverRef.current && canDropBallRef.current) {
        const previewConfig = BALL_CONFIG[currentBallRef.current - 1];
        const previewImage = imagesRef.current[currentBallRef.current];
        
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.translate(dropPositionRef.current, spawnY);

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

        // Draw drop guide line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(dropPositionRef.current, spawnY + previewConfig.radius);
        ctx.lineTo(dropPositionRef.current, gameHeight - wallThickness);
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
        
        // Ball must be significantly below spawn point to count as "settled"
        const hasMovedFromSpawn = ball.body.position.y > spawnY + 50;
        
        // Ball must have very low velocity AND be below spawn area
        const isSettled = Math.abs(ball.body.velocity.y) < 0.2 && 
                         Math.abs(ball.body.velocity.x) < 0.2 &&
                         hasMovedFromSpawn;
        
        return isAboveLine && isSettled;
      });
      
      if (anyBallAbove) {
        setGameOver(true);
        gameOverRef.current = true;
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
      restitution: 0.3,     // Slight bounce
      friction: 0.5,        // More friction
      density: 0.002,       // Slightly heavier
      frictionAir: 0.002,   // Air resistance
    });

    // Give ball initial downward velocity so it starts falling immediately
    Matter.Body.setVelocity(body, { x: 0, y: 2 });

    Matter.World.add(worldRef.current, body);
    
    ballsRef.current.push({
      body,
      level,
      image: imagesRef.current[level],
      id: ballIdCounter++,
    });
    
    console.log(`✅ Ball created: Level ${level}, ID ${ballIdCounter - 1}, Position (${x}, ${y}), Total balls: ${ballsRef.current.length}`);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || !canDropBall) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const scaleX = gameWidth / rect.width;
    const actualX = x * scaleX;
    
    const config = BALL_CONFIG[currentBall - 1];
    const clampedX = Math.max(
      wallThickness + config.radius + 2, 
      Math.min(gameWidth - wallThickness - config.radius - 2, actualX)
    );
    
    // Prevent multiple drops
    setCanDropBall(false);
    canDropBallRef.current = false;
    
    createBall(clampedX, spawnY, currentBall);
    
    // Update ball queue
    setCurrentBall(nextBall);
    currentBallRef.current = nextBall;
    setNextBall(getRandomBallLevel());
    
    // Re-enable dropping after delay
    setTimeout(() => {
      setCanDropBall(true);
      canDropBallRef.current = true;
    }, 500);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || !canDropBall) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const scaleX = gameWidth / rect.width;
    const actualX = x * scaleX;
    
    const config = BALL_CONFIG[currentBall - 1];
    const clampedX = Math.max(
      wallThickness + config.radius + 2, 
      Math.min(gameWidth - wallThickness - config.radius - 2, actualX)
    );
    setDropPosition(clampedX);
    dropPositionRef.current = clampedX;
  };

  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    gameOverRef.current = false;
    setShowCardForm(false);
    setUserName('');
    setUserImage(null);
    setCurrentBall(1);
    currentBallRef.current = 1;
    setNextBall(getRandomBallLevel());
    setCanDropBall(true);
    canDropBallRef.current = true;
    ballsRef.current = [];
    processingMergeRef.current.clear();
    ballIdCounter = 0;
    
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
        {/* Game Canvas - Now taking more space since Score/Next Ball moved inside */}
        <div className="lg:col-span-9">
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
              <div className="absolute inset-0 bg-black/90 rounded-2xl flex items-center justify-center p-4">
                <div 
                  ref={cardRef}
                  className="w-full max-w-md"
                  style={{
                    aspectRatio: '1080/1350',
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-ritual-dark to-ritual-darker p-8 rounded-3xl border-4 border-ritual-purple relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-ritual-purple/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-ritual-blue/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="text-center space-y-3">
                        <h1 className="text-5xl font-black" style={{ color: '#A78BFA' }}>
                          GAME CARD
                        </h1>
                        <div className="h-2 w-32 mx-auto rounded-full" style={{
                          background: 'linear-gradient(90deg, #8B5CF6, #3B82F6, #EC4899)',
                        }}></div>
                      </div>

                      <div className="flex flex-col items-center gap-6 py-6">
                        <div className="flex-shrink-0">
                          {userImage ? (
                            <img
                              src={userImage}
                              alt={userName}
                              className="w-32 h-32 rounded-full border-4 object-cover"
                              style={{ borderColor: '#8B5CF6' }}
                            />
                          ) : (
                            <div 
                              className="w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl font-black"
                              style={{
                                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #EC4899)',
                                borderColor: '#8B5CF6',
                              }}
                            >
                              {userName.charAt(0).toUpperCase() || 'G'}
                            </div>
                          )}
                        </div>

                        <div className="text-center space-y-4 w-full px-6">
                          <h2 className="text-3xl font-black text-white break-words">
                            {userName || 'Player'}
                          </h2>

                          <div className="bg-black/20 rounded-2xl p-4 border-2 border-ritual-purple/30">
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-lg text-gray-300 font-semibold">Score:</span>
                              <span className="text-5xl font-black" style={{ color: '#A78BFA' }}>
                                {score}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t-2 border-ritual-purple/40 pt-4">
                        <div className="text-center space-y-1">
                          <p className="text-sm text-gray-400 font-semibold">
                            ritualfoundation.com
                          </p>
                          <p className="text-sm font-bold" style={{ color: '#A78BFA' }}>
                            @ritualfnd
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={restartGame}
                    className="w-full mt-4 px-8 py-3 bg-ritual-purple rounded-xl font-bold text-white hover:scale-105 transition-transform"
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
