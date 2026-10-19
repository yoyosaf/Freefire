import React, { useState } from 'react';
import { Lock, Unlock, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { Tournament, Registration } from '../types';
import { CountdownTimer } from './CountdownTimer';

interface RoomCardProps {
  tournament: Tournament;
  registration?: Registration;
  isStaff?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  tournament,
  registration,
  isStaff = false,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const isConfirmed = registration?.status === 'CONFIRMED';
  const isRoomReleased = Boolean(tournament.roomReleasedAt && tournament.roomId);
  const canViewRoom = isStaff || (isConfirmed && isRoomReleased);

  const copyToClipboard = (text: string, type: 'id' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  // Case 1: Unlocked state with credentials and 1-click copy
  if (canViewRoom && tournament.roomId) {
    return (
      <div className="bg-gradient-to-br from-zinc-900 via-[#1C1C2B] to-[#12121e] border-2 border-[#FF6A00]/50 rounded-xl p-5 cut-corner shadow-[0_0_25px_rgba(255,106,0,0.25)] relative overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6A00] via-[#FFC107] to-[#FF6A00]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#FF6A00]/20 border border-[#FF6A00]/40 flex items-center justify-center text-[#FF6A00]">
              <Unlock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
                  Custom Room Credentials
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  UNLOCKED
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Join in Free Fire now. You are assigned to <strong className="text-[#FFC107]">Slot #{registration?.slotNumber ?? 'Staff View'}</strong>.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-500 block">Status</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Room Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Room ID Box */}
          <div className="bg-black/60 border border-zinc-700/80 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">Room ID</span>
              <span className="font-score text-xl font-bold text-white tracking-widest">
                {tournament.roomId}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(tournament.roomId || '', 'id')}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-[#FF6A00] hover:text-black text-xs font-medium text-zinc-300 transition-all flex items-center gap-1.5 border border-zinc-700"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedId ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Room Password Box */}
          <div className="bg-black/60 border border-zinc-700/80 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">Password</span>
              <span className="font-score text-xl font-bold text-[#FFC107] tracking-wider">
                {tournament.roomPassword}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(tournament.roomPassword || '', 'pass')}
              className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-[#FFC107] hover:text-black text-xs font-medium text-zinc-300 transition-all flex items-center gap-1.5 border border-zinc-700"
            >
              {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedPass ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="p-3 bg-zinc-950/70 border border-amber-500/20 rounded-lg flex items-start gap-2.5 text-xs text-zinc-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Match Rule:</strong> Do NOT share credentials with non-registered players. Room moderators will kick unauthorized IDs from custom rooms. Sit only in <strong>Slot #{registration?.slotNumber ?? 'assigned slot'}</strong>.
          </span>
        </div>
      </div>
    );
  }

  // Case 2: Locked state with padlock and countdown
  return (
    <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-5 cut-corner relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-zinc-400 shrink-0">
            <Lock className="w-6 h-6 text-amber-500/80" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base sm:text-lg font-bold uppercase tracking-wide text-zinc-200">
                Custom Room Credentials
              </h3>
              <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                LOCKED
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isConfirmed
                ? 'Credentials unlock 10–15 minutes before the match start time. Be ready!'
                : 'Only confirmed registered players can see custom room credentials.'}
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 rounded-lg flex flex-col items-center">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 mb-1">
            Match Starts In
          </span>
          <CountdownTimer targetDate={tournament.startsAt} compact />
        </div>
      </div>
    </div>
  );
};
