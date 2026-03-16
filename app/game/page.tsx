'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MergeGame from '@/components/MergeGame';

export default function GamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  const [guestUsername, setGuestUsername] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      setShouldRender(true);
    } else if (status === 'unauthenticated') {
      // Check for guest username set by PlayModeModal
      const storedGuest = localStorage.getItem('guestUsername');
      if (storedGuest && storedGuest.trim()) {
        setGuestUsername(storedGuest.trim());
        setShouldRender(true);
      } else {
        router.push('/?play=true');
      }
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎮</div>
          <div className="text-white text-2xl">Loading game...</div>
        </div>
      </div>
    );
  }

  if (!shouldRender) return null;

  // Authenticated users get the full game (scores saved to DB)
  // Guest users get the same gameplay but scores are never saved
  return <MergeGame guestMode={!!guestUsername} guestUsername={guestUsername ?? undefined} />;
}
