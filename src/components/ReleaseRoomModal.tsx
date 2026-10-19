import React, { useState } from 'react';
import { X, Unlock, Key, ShieldCheck, AlertCircle } from 'lucide-react';
import { Tournament, User } from '../types';
import { storage } from '../lib/storage';

interface ReleaseRoomModalProps {
  tournament: Tournament;
  currentUser: User;
  onClose: () => void;
  onSuccess: (updatedTournament: Tournament) => void;
}

export const ReleaseRoomModal: React.FC<ReleaseRoomModalProps> = ({
  tournament,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [roomId, setRoomId] = useState(tournament.roomId || '');
  const [roomPassword, setRoomPassword] = useState(tournament.roomPassword || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!roomId.trim()) {
      setError('Room ID is required.');
      return;
    }

    if (!roomPassword.trim()) {
      setError('Room Password is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = storage.releaseRoom(
        tournament.id,
        roomId.trim(),
        roomPassword.trim(),
        currentUser.id
      );
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error releasing room details');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#14141F] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative cut-corner space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Unlock className="w-5 h-5 text-[#FF6A00]" />
            <h2 className="font-display text-base font-bold uppercase text-white tracking-wide">
              Release Custom Room Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 space-y-1">
          <span className="font-bold text-white block">{tournament.title}</span>
          <span className="text-zinc-400 block">{tournament.mode} · {tournament.map} · {tournament.filledSlots} Registered Players</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Custom Room ID <span className="text-[#FF6A00]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 7891204"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-score tracking-wider focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Custom Room Password <span className="text-[#FF6A00]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. booyah99"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-amber-400 font-score tracking-wider focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          <p className="text-[11px] text-zinc-400 bg-black/40 p-2.5 rounded border border-zinc-800/80">
            Releasing credentials broadcasts an alert to all confirmed players and unlocks the Room Card on their tournament portal.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#FF6A00] hover:bg-[#FF8800] text-black shadow-lg cut-corner flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" /> Release to Confirmed Players
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
