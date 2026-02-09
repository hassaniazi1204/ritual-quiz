'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

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
  const worldRef = useRef<Matter.World | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const imagesRef = useRef<{ [key: number]: HTMLImageElement }>({});

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentBallLevel, setCurrentBallLevel] = useState(Math.floor(Math.random() * 3) + 1);
  const [nextBallLevel, setNextBallLevel] = useState(Math.floor(Math.random() * 3) + 1);
  const [dropPosition, setDropPosition] = useState(180);

  const gameWidth = 360;
  const gameHeight = 900;
  const topBoundary = 120;

  useEffect(() => {
    BALL_CONFIG.forEach((config) => {
      const img = new Image();
      img.src = config.image;
      imagesRef.current[config.level] = img;
    });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1 } });
    engineRef.current = engine;
    worldRef.current = engine.world;

    const ground = Matter.Bodies.rectangle(gameWidth / 2, gameHeight, gameWidth, 20, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(0, gameHeight / 2, 20, gameHeight, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(gameWidth, gameHeight / 2, 20, gameHeight, { isStatic: true });

    Matter.World.add(engine.world, [ground, leftWall, rightWall]);
    Matter.Engine.run(engine);

    const renderLoop = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, gameWidth, gameHeight);
      ctx.fillStyle = '#0F0F23';
      ctx.fillRect(0, 0, gameWidth, gameHeight);

      ctx.strokeStyle = '#EF4444';
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(0, topBoundary);
      ctx.lineTo(gameWidth, topBoundary);
      ctx.stroke();
      ctx.setLineDash([]);

      ballsRef.current.forEach((ball) => {
        const config = BALL_CONFIG[ball.level - 1];
        const img = ball.image;
        ctx.save();
        ctx.translate(ball.body.position.x, ball.body.position.y);

        ctx.beginPath();
        ctx.arc(0, 0, config.radius, 0, Math.PI * 2);
        ctx.clip();

        if (img.complete) {
          ctx.drawImage(img, -config.radius, -config.radius, config.radius * 2, config.radius * 2);
        }

        ctx.restore();
      });

      if (!gameOver) {
        const previewConfig = BALL_CONFIG[currentBallLevel - 1];
        const previewImage = imagesRef.current[currentBallLevel];
        ctx.save();
        ctx.translate(dropPosition, 60);
        ctx.globalAlpha = 0.7;

        ctx.beginPath();
        ctx.arc(0, 0, previewConfig.radius, 0, Math.PI * 2);
        ctx.clip();

        if (previewImage?.complete) {
          ctx.drawImage(previewImage, -previewConfig.radius, -previewConfig.radius, previewConfig.radius * 2, previewConfig.radius * 2);
        }

        ctx.restore();
      }

      requestAnimationFrame(renderLoop);
    };

    renderLoop();

    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const ballA = ballsRef.current.find(b => b.body === pair.bodyA);
        const ballB = ballsRef.current.find(b => b.body === pair.bodyB);

        if (ballA && ballB && ballA.level === ballB.level) {
          const mergeLevel = ballA.level;
          const newLevel = mergeLevel === 10 ? 1 : mergeLevel + 1;
          const x = (pair.bodyA.position.x + pair.bodyB.position.x) / 2;
          const y = (pair.bodyA.position.y + pair.bodyB.position.y) / 2;

          Matter.World.remove(engine.world, pair.bodyA);
          Matter.World.remove(engine.world, pair.bodyB);
          ballsRef.current = ballsRef.current.filter(b => b !== ballA && b !== ballB);

          createBall(x, y, newLevel);
          setScore(s => s + BALL_CONFIG[mergeLevel - 1].score);
        }
      });
    });

    const gameOverCheck = setInterval(() => {
      const hitTop = ballsRef.current.some(
        ball => ball.body.position.y - BALL_CONFIG[ball.level - 1].radius < topBoundary
      );
      if (hitTop) setGameOver(true);
    }, 500);

    return () => clearInterval(gameOverCheck);
  }, [gameOver]);

  const createBall = (x: number, y: number, level: number) => {
    if (!worldRef.current) return;
    const config = BALL_CONFIG[level - 1];
    const body = Matter.Bodies.circle(x, y, config.radius, { restitution: 0.2, friction: 0.3 });
    Matter.World.add(worldRef.current, body);
    ballsRef.current.push({ body, level, image: imagesRef.current[level] });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.max(60, Math.min(gameWidth - 60, e.clientX - rect.left));

    createBall(x, 60, currentBallLevel);
    setCurrentBallLevel(nextBallLevel);

    const rand = Math.random();
    setNextBallLevel(rand < 0.5 ? 1 : rand < 0.8 ? 2 : 3);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.max(60, Math.min(gameWidth - 60, e.clientX - rect.left));
    setDropPosition(x);
  };

  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    ballsRef.current = [];
    if (worldRef.current) Matter.World.clear(worldRef.current, false);
    if (engineRef.current) Matter.Engine.clear(engineRef.current);
  };

  return (
    <main className="min-h-screen bg-black p-6">
      <a href="/" className="text-white mb-4 inline-block">← Back to Quiz</a>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <canvas
          ref={canvasRef}
          width={gameWidth}
          height={gameHeight}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          className="border-4 border-purple-500 rounded-xl mx-auto"
        />

        <div className="space-y-6 text-white">
          <div className="p-4 border rounded">
            <h2 className="text-xl font-bold">Score</h2>
            <p className="text-4xl">{score}</p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Next Ball</h3>
            <img src={BALL_CONFIG[nextBallLevel - 1].image} className="w-20 h-20 rounded-full" />
            <p>Level {nextBallLevel}</p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Merge Chart</h3>
            <div className="grid grid-cols-5 gap-2">
              {BALL_CONFIG.map(b => (
                <div key={b.level} className="text-center">
                  <img src={b.image} className="w-12 h-12 rounded-full mx-auto" />
                  <p className="text-xs">Lv {b.level}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={restartGame} className="bg-red-500 p-3 rounded">Restart</button>

          {gameOver && <p className="text-red-400 text-xl">Game Over!</p>}
        </div>
      </div>
    </main>
  );
}
