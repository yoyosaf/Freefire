import React from 'react';
import { MoreHorizontal, Users, MapPin, Trophy, ShieldCheck, ChevronRight, Flame } from 'lucide-react';
import { Tournament, Registration } from '../types';
import { formatBDT, formatBangladeshTime } from '../lib/points';

interface MatchRowItemProps {
  tournament: Tournament;
  registration?: Registration;
  onSelect: (tournament: Tournament) => void;
  onJoin: (tournament: Tournament) => void;
}

export const MatchRowItem: React.FC<MatchRowItemProps> = ({
  tournament,
  registration,
  onSelect,
  onJoin,
}) => {
  const isFull = tournament.filledSlots >= tournament.maxSlots;
  const isLive = tournament.status === 'LIVE';
  const isCompleted = tournament.status === 'COMPLETED';
  const isConfirmed = registration?.status === 'CONFIRMED';
  const isPending = registration?.status === 'PENDING_PAYMENT' || registration?.status === 'PAYMENT_SUBMITTED';

  // Format date header like "TOMORROW, 22:30" or "TODAY, 21:00"
  const getHeaderDate = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const tomorrow = new Date(now.getTime() + 86400000);
      const isTomorrow = date.toDateString() === tomorrow.toDateString();

      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      if (isToday) return `TODAY, ${timeStr}`;
      if (isTomorrow) return `TOMORROW, ${timeStr}`;
      return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}, ${timeStr}`;
    } catch {
      return 'UPCOMING MATCH';
    }
  };

  const modeFormatMap: Record<string, string> = {
    SOLO: '1v1',
    DUO: '2v2',
    SQUAD: '4v4',
  };

  return (
    <div className="group bg-[#11141c] hover:bg-[#151924] border border-zinc-800/80 hover:border-cyan-500/40 rounded-xl p-3 sm:p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Left: Thumbnail with Free Fire 'F' emblem badge */}
      <div 
        onClick={() => onSelect(tournament)}
        className="relative w-full sm:w-44 h-28 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-zinc-900 cursor-pointer"
      >
        <img
          src={tournament.bannerUrl}
          alt={tournament.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Yellow/Gold 'F' emblem in top-left like in screenshot */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded bg-gradient-to-br from-amber-400 to-[#FF6A00] flex items-center justify-center shadow-md">
          <span className="font-display font-black text-black text-xs leading-none">F</span>
        </div>

        {/* Live badge if live */}
        {isLive && (
          <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span> LIVE
          </span>
        )}
      </div>

      {/* Middle: Details */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Date header in uppercase */}
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <span className="text-cyan-400">{getHeaderDate(tournament.startsAt)}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">{formatBangladeshTime(tournament.startsAt)}</span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(tournament)}
          className="font-display text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors cursor-pointer truncate"
        >
          {tournament.title}
        </h3>

        {/* Metadata with bullets */}
        <div className="text-xs text-zinc-400 flex items-center gap-2 flex-wrap">
          <span>Hosted by <strong className="text-zinc-200">BOOYAH Arena</strong></span>
          <span className="text-zinc-600">•</span>
          <span>{tournament.map}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-cyan-300 font-semibold">{modeFormatMap[tournament.mode] || tournament.mode}</span>
          <span className="text-zinc-600">•</span>
          <span className="font-score text-zinc-300">{tournament.filledSlots}/{tournament.maxSlots} slots</span>
          <span className="text-zinc-600">•</span>
          <span className="font-score text-[#FFC107] font-semibold">Prize: {formatBDT(tournament.prizePool)}</span>
        </div>

        {/* Badges line: Open / User-hosted / Confirmed */}
        <div className="flex items-center gap-2 pt-1">
          {isCompleted ? (
            <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded">
              Finished
            </span>
          ) : isFull ? (
            <span className="bg-amber-950/80 text-amber-400 border border-amber-800/80 text-[10px] font-bold px-2 py-0.5 rounded">
              Full
            </span>
          ) : (
            <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-[10px] font-bold px-2.5 py-0.5 rounded">
              Open
            </span>
          )}

          <span className="bg-zinc-800/80 text-zinc-400 text-[10px] font-medium px-2 py-0.5 rounded border border-zinc-700/60">
            {tournament.entryFee === 0 ? 'Free Entry' : `Fee: ${formatBDT(tournament.entryFee)}`}
          </span>

          {isConfirmed && (
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Slot #{registration?.slotNumber}
            </span>
          )}

          {isPending && (
            <span className="bg-amber-950/80 text-amber-400 border border-amber-700/60 text-[10px] font-semibold px-2 py-0.5 rounded">
              Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0">
        <button
          onClick={() => onSelect(tournament)}
          className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          title="More match options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {!isCompleted && (
          <button
            disabled={isFull && !registration}
            onClick={() => (isConfirmed ? onSelect(tournament) : onJoin(tournament))}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isConfirmed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : isPending
                ? 'bg-amber-600 hover:bg-amber-500 text-black'
                : isFull
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-[#00c5ff] hover:bg-[#00b0e6] text-black font-extrabold shadow-[0_0_15px_rgba(0,197,255,0.4)]'
            }`}
          >
            {isConfirmed ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" /> Room ID
              </>
            ) : isPending ? (
              'Review'
            ) : isFull ? (
              'Full'
            ) : (
              <>
                Join Match <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
