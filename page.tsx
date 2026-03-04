'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import PlayModeModal from '@/components/PlayModeModal';

export default function HomePage() {
  const { data: session } = useSession();
  const [showPlayModal, setShowPlayModal] = useState(false);

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url(/brand-assets/Patterns/Layers.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            SIGGYDROP
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 font-bold">
            Merge • Drop • Dominate
          </p>
        </div>

        {/* Play Button */}
        <button
          onClick={() => setShowPlayModal(true)}
          className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-black text-3xl transition-all hover:scale-110 shadow-2xl shadow-purple-500/50 mb-8"
        >
          <span className="relative z-10">▶️ PLAY NOW</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
        </button>

        {/* User Status */}
        {session ? (
          <div className="flex items-center gap-3 px-6 py-3 bg-gray-900/80 rounded-full border border-purple-500/30">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user?.name || 'User'}
                className="w-8 h-8 rounded-full border-2 border-purple-400"
              />
            )}
            <span className="text-white font-semibold">
              Welcome, {session.user?.name || 'Player'}!
            </span>
          </div>
        ) : (
          <p className="text-gray-400 text-lg">
            Click PLAY NOW to get started
          </p>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          {/* Feature 1 */}
          <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-purple-500/30">
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="text-xl font-black text-white mb-2">Solo Play</h3>
            <p className="text-gray-400 text-sm">
              Practice and master your skills
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-purple-500/30">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-black text-white mb-2">Tournaments</h3>
            <p className="text-gray-400 text-sm">
              Compete in real-time battles
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center p-6 bg-gray-900/50 rounded-xl border border-purple-500/30">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-black text-white mb-2">Leaderboards</h3>
            <p className="text-gray-400 text-sm">
              Climb the global rankings
            </p>
          </div>
        </div>

        {/* How to Play */}
        <div className="mt-12 text-center max-w-2xl">
          <h2 className="text-2xl font-black text-white mb-4">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              <span className="text-purple-400 font-bold">1. Click</span>
              <br />
              Drop balls
            </div>
            <div>
              <span className="text-purple-400 font-bold">2. Merge</span>
              <br />
              Same levels combine
            </div>
            <div>
              <span className="text-purple-400 font-bold">3. Score</span>
              <br />
              Get the highest points
            </div>
          </div>
        </div>
      </div>

      {/* Play Mode Modal */}
      <PlayModeModal 
        isOpen={showPlayModal}
        onClose={() => setShowPlayModal(false)}
      />
    </main>
  );
}
