'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MergeGame from '@/components/MergeGame';

export default function GamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated and not loading, redirect to home
    if (status === 'unauthenticated') {
      router.push('/?play=true'); // Add play param to auto-open modal
    }
  }, [status, router]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  // Don't render game if not authenticated
  if (!session) {
    return null;
  }

  // User is authenticated - render game
  return <MergeGame />;
}
