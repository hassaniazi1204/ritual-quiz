'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTournamentModal({ isOpen, onClose }: CreateTournamentModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 10,
    max_players: 100,
    auto_start_enabled: false,
    auto_start_player_count: 10,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!session) {
      setError('You must be logged in to create a tournament');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tournaments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tournament');
      }

      // Redirect to tournament lobby
      router.push(`/tournament/${data.tournament.id}`);
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-purple-500/30 rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-white">Create Tournament</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tournament Name */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Tournament Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Friday Night Challenge"
              required
              maxLength={100}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your tournament..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Duration *
            </label>
            <select
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Max Players
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="max_players"
                min={2}
                max={200}
                value={formData.max_players}
                onChange={handleChange}
                className="flex-1"
              />
              <span className="text-white font-bold text-xl w-12 text-center">
                {formData.max_players}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Recommended: 10-100 players for optimal performance
            </p>
          </div>

          {/* Auto-start Settings */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                name="auto_start_enabled"
                checked={formData.auto_start_enabled}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-black/50 border-gray-700 text-purple-500 focus:ring-purple-500"
              />
              <label className="text-white font-semibold">
                Enable Auto-Start
              </label>
            </div>

            {formData.auto_start_enabled && (
              <div className="ml-8">
                <label className="block text-gray-300 mb-2">
                  Start when this many players join:
                </label>
                <input
                  type="number"
                  name="auto_start_player_count"
                  value={formData.auto_start_player_count}
                  onChange={handleChange}
                  min={2}
                  max={formData.max_players}
                  className="w-32 px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Tournament will start automatically when {formData.auto_start_player_count} players join
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : '🏆 Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

