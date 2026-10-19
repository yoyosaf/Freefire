import React, { useState } from 'react';
import { User, Save, CheckCircle2, ShieldCheck, Smartphone, Flame } from 'lucide-react';
import { User as UserType } from '../../types';
import { storage } from '../../lib/storage';
import { formatBDT } from '../../lib/points';

interface ProfilePageProps {
  currentUser: UserType;
  onUpdateUser: (updated: UserType) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUpdateUser,
}) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [ffUid, setFfUid] = useState(currentUser.ffUid || '');
  const [ffIgn, setFfIgn] = useState(currentUser.ffIgn || '');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ffUid || ffUid.trim().length < 5) {
      setError('Free Fire Player UID is required to participate in custom rooms.');
      return;
    }

    if (!ffIgn || ffIgn.trim().length < 2) {
      setError('Free Fire In-Game Name (IGN) is required.');
      return;
    }

    try {
      const updated = storage.updateUser(currentUser.id, {
        displayName: displayName.trim(),
        phone: phone.trim(),
        ffUid: ffUid.trim(),
        ffIgn: ffIgn.trim(),
      });
      onUpdateUser(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Error updating profile');
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
          <User className="w-6 h-6 text-[#FF6A00]" />
          Player Identity & Free Fire Profile
        </h1>
        <p className="text-xs text-zinc-400">
          Room moderators verify your UID and IGN before kicking non-registered attendees from custom lobbies
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-600 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Profile and Free Fire identity updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="bg-[#14141F] border border-zinc-800 rounded-2xl p-6 sm:p-8 cut-corner space-y-6 shadow-xl">
        {/* User Card */}
        <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
          <div className="w-16 h-16 rounded-xl bg-zinc-800 border-2 border-[#FF6A00]/50 overflow-hidden shadow-lg shrink-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{currentUser.displayName}</h2>
              <span className="bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentUser.email}</p>
            <p className="text-xs text-emerald-400 font-score font-bold mt-1">
              Wallet Balance: {formatBDT(currentUser.walletBalance)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Display Name <span className="text-[#FF6A00]">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Phone Number (Bangladesh) <span className="text-[#FF6A00]">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <div>
              <label className="text-xs font-bold text-[#FFC107] block mb-1 uppercase tracking-wide">
                Free Fire UID (Player ID) <span className="text-[#FF6A00]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 249018471"
                value={ffUid}
                onChange={(e) => setFfUid(e.target.value)}
                required
                className="w-full bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-score focus:outline-none focus:border-[#FF6A00]"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Found in your Free Fire profile under your avatar.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#FFC107] block mb-1 uppercase tracking-wide">
                Free Fire In-Game Name (IGN) <span className="text-[#FF6A00]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 亗・S N I P E R・亗"
                value={ffIgn}
                onChange={(e) => setFfIgn(e.target.value)}
                required
                className="w-full bg-black/60 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Must match your in-game nickname exactly.
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-xs font-extrabold bg-[#FF6A00] hover:bg-[#FF8800] text-black shadow-lg flex items-center gap-1.5 cut-corner"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
