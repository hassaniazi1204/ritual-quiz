'use client'; 

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

// Ball level configuration
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

export default function MergeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const imagesRef = useRef<{ [key: number]: HTMLImageElement }>({});
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentBallLevel, setCurrentBallLevel] = useState(1);
  const [nextBallLevel, setNextBallLevel] = useState(1);
  const [dropPosition, setDropPosition] = useState(400);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  
  const gameWidth = 420;
  const gameHeight = 720;
  const topBoundary = 100;

  // Load all avatar images
  useEffect(() => {
    BALL_CONFIG.forEach((config) => {
      const img = new Image();
      img.src = config.image;
      imagesRef.current[config.level] = img;
    });
  }, []);

  // Initialize Matter.js physics engine
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1 },
    });
    engineRef.current = engine;
    worldRef.current = engine.world;

    // Create renderer
    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: gameWidth,
        height: gameHeight,
        wireframes: false,
        background: '#0F0F23',
      },
    });
    renderRef.current = render;

    // Create boundaries
    const wallOptions = { isStatic: true, render: { fillStyle: '#8B5CF6' } };
    
    const ground = Matter.Bodies.rectangle(gameWidth / 2, gameHeight, gameWidth, 20, wallOptions);
    const leftWall = Matter.Bodies.rectangle(0, gameHeight / 2, 20, gameHeight, wallOptions);
    const rightWall = Matter.Bodies.rectangle(gameWidth, gameHeight / 2, 20, gameHeight, wallOptions);
    
    Matter.World.add(engine.world, [ground, leftWall, rightWall]);

    // Start engine and renderer
    Matter.Engine.run(engine);
    Matter.Render.run(render);

    // Custom render loop for drawing images on balls
    const customRender = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, gameWidth, gameHeight);
      
      // Draw background
      ctx.fillStyle = '#0F0F23';
      ctx.fillRect(0, 0, gameWidth, gameHeight);
      
      // Draw top boundary line (danger zone)
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(0, topBoundary);
      ctx.lineTo(gameWidth, topBoundary);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw walls
      ctx.fillStyle = '#8B5CF6';
      ctx.fillRect(0, gameHeight - 20, gameWidth, 20); // Ground
      ctx.fillRect(0, 0, 20, gameHeight); // Left wall
      ctx.fillRect(gameWidth - 20, 0, 20, gameHeight); // Right wall

      // Draw all balls with their images
      ballsRef.current.forEach((ball) => {
        const { body, level, image } = ball;
        const config = BALL_CONFIG[level - 1];
        
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        // Draw ball circle with vibration effect
        const vibrationIntensity = level * 0.5;
        const vibrationX = (Math.random() - 0.5) * vibrationIntensity;
        const vibrationY = (Math.random() - 0.5) * vibrationIntensity;

        // Draw outer glow
        const gradient = ctx.createRadialGradient(
          vibrationX, vibrationY, 0,
          vibrationX, vibrationY, config.radius
        );
        gradient.addColorStop(0, config.color + '88');
        gradient.addColorStop(1, config.color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(vibrationX, vibrationY, config.radius + 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw ball background
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(vibrationX, vibrationY, config.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw avatar image
        if (image.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(vibrationX, vibrationY, config.radius - 2, 0, Math.PI * 2);
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

        // Draw border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(vibrationX, vibrationY, config.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      // Draw CURRENT ball preview (the one about to drop)
if (!gameOver) {
  const previewConfig = BALL_CONFIG[currentBallLevel - 1];
  const previewImage = imagesRef.current[currentBallLevel];       
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.translate(dropPosition, 50);

        // Preview ball
        ctx.fillStyle = previewConfig.color;
        ctx.beginPath();
        ctx.arc(0, 0, previewConfig.radius, 0, Math.PI * 2);
        ctx.fill();

        if (previewImage?.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, 0, previewConfig.radius - 2, 0, Math.PI * 2);
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
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, previewConfig.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      requestAnimationFrame(customRender);
    };
    customRender();

    // Collision detection for merging
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const ballA = ballsRef.current.find(b => b.body === bodyA);
        const ballB = ballsRef.current.find(b => b.body === bodyB);

        if (ballA && ballB && ballA.level === ballB.level && !ballA.body.isStatic && !ballB.body.isStatic) {
          // Same level collision - merge!
          const mergeLevel = ballA.level;
          const mergeScore = BALL_CONFIG[mergeLevel - 1].score;
          
          // Calculate merge position (midpoint)
          const mergeX = (bodyA.position.x + bodyB.position.x) / 2;
          const mergeY = (bodyA.position.y + bodyB.position.y) / 2;

          // Remove old balls
          Matter.World.remove(engine.world, bodyA);
          Matter.World.remove(engine.world, bodyB);
          ballsRef.current = ballsRef.current.filter(b => b.body !== bodyA && b.body !== bodyB);

          // Determine new ball level (loop at level 10)
          const newLevel = mergeLevel === 10 ? 1 : mergeLevel + 1;
          
          // Create new merged ball
          setTimeout(() => {
            createBall(mergeX, mergeY, newLevel);
            setScore(prev => prev + mergeScore);
            
            // Screen shake effect
            triggerScreenShake(mergeLevel);
          }, 100);
        }
      });
    });

    // Game over detection
    const checkGameOver = setInterval(() => {
      const anyBallAboveBoundary = ballsRef.current.some(
        ball => ball.body.position.y < topBoundary && ball.body.velocity.y < 0.1
      );
      
      if (anyBallAboveBoundary && !gameOver) {
        setGameOver(true);
        setShowCardForm(true);
        Matter.Render.stop(renderRef.current!);
Matter.Runner.stop(Matter.Runner.create());
Matter.Engine.clear(engine);

      }
    }, 500);

    return () => {
      clearInterval(checkGameOver);
      Matter.Render.stop(render);
      Matter.Render.stop(renderRef.current!);
Matter.Runner.stop(Matter.Runner.create());
Matter.Engine.clear(engine);

    };
  }, [gameOver]);

  // Create a new ball
  const createBall = (x: number, y: number, level: number) => {
  if (!worldRef.current) return;

  // cleanup old bodies (prevents world overload)
  if (ballsRef.current.length > 180) {
    const remove = ballsRef.current.slice(0, 30);
    remove.forEach(b => Matter.World.remove(worldRef.current!, b.body));
    ballsRef.current = ballsRef.current.slice(30);
  }

  const config = BALL_CONFIG[level - 1];

  const body = Matter.Bodies.circle(x, y, config.radius, {
    restitution: 0.25,
    friction: 0.4,
  });

  Matter.World.add(worldRef.current, body);

  ballsRef.current.push({
    body,
    level,
    image: imagesRef.current[level],
  });
};

  // Drop ball on click
const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
  if (gameOver) return;

  const rect = canvasRef.current?.getBoundingClientRect();
  if (!rect) return;

  const x = e.clientX - rect.left;

  // drop CURRENT ball
  createBall(x, 50, currentBallLevel);

  // promote next → current
  setCurrentBallLevel(nextBallLevel);

  // generate next
  const random = Math.random();
  if (random < 0.5) setNextBallLevel(1);
  else if (random < 0.8) setNextBallLevel(2);
  else setNextBallLevel(3);
};


  // Track mouse position for ball preview
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(40, Math.min(gameWidth - 40, e.clientX - rect.left));
    setDropPosition(x);
  };

  // Screen shake effect
  const triggerScreenShake = (intensity: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const shakeAmount = intensity * 2;
    const duration = 200;
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

  // Restart game
  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    setShowCardForm(false);
    setCurrentBallLevel(1);
    setUserName('');
    setUserImage(null);
    setNextBallLevel(1);
    ballsRef.current = [];
    
    if (engineRef.current && worldRef.current) {
      Matter.World.clear(worldRef.current, false);
      Matter.Engine.clear(engineRef.current);
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
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-5xl font-black text-center text-gradient mb-4" style={{
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #EC4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Ritual Merge Game
        </h1>
        <p className="text-center text-gray-400 text-lg">
          Drop and merge balls to score points!
        </p>
      </div>

      {/* Game Container */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Canvas */}
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
                  <p className="text-6xl font-black text-gradient" style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #EC4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
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
          {/* Score Board */}
          <div className="bg-gradient-to-br from-ritual-purple/20 to-ritual-blue/20 p-6 rounded-2xl border-2 border-ritual-purple/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">Score</h3>
            <p className="text-6xl font-black text-gradient" style={{
              background: 'linear-gradient(135deg, #8B5CF6, #3B82F6, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {score}
            </p>
          </div>
<div className="bg-gradient-to-br from-ritual-purple/20 to-ritual-blue/20 p-6 rounded-2xl border-2 border-ritual-purple/50">
  <h3 className="text-xl font-bold text-white mb-3">Next Ball</h3>
  <div
    className="w-20 h-20 rounded-full mx-auto border-4 border-white overflow-hidden"
    style={{ background: BALL_CONFIG[nextBallLevel - 1].color }}
  >
    <img
      src={BALL_CONFIG[nextBallLevel - 1].image}
      className="w-full h-full object-cover"
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

          {/* Ball Levels */}
          <div className="grid grid-cols-5 gap-3">
  {BALL_CONFIG.map((config) => (
    <div key={config.level} className="text-center">
      <div
        className="w-12 h-12 rounded-full overflow-hidden mx-auto border-2 border-white"
        style={{ background: config.color }}
      >
        <img
          src={config.image}
          className="w-full h-full object-cover"
        />
      </div>

      <p className="text-xs text-gray-400 mt-1">
        Lv{config.level}
      </p>
    </div>
  ))}
</div>


          {/* Restart Button */}
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
