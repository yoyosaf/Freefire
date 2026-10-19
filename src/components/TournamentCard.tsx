import React from 'react';
import { Trophy, Swords, MapPin, Users, Flame, ChevronRight, ShieldCheck } from 'lucide-react';
import { Tournament, Registration } from '../types';
import { formatBDT, formatBangladeshTime } from '../lib/points';
import { SlotProgressBar } from './SlotProgressBar';
import { CountdownTimer } from './CountdownTimer';

interface TournamentCardProps {
  tournament: Tournament;
  registration?: Registration;
  onSelect: (tournament: Tournament) => void;
  onJoin: (tournament: Tournament) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  registration,
  onSelect,
  onJoin,
}) => {
  const isFull = tournament.filledSlots >= tournament.maxSlots;
  const isLive = tournament.status === 'LIVE';
  const isCompleted = tournament.status === 'COMPLETED';
  const isCancelled = tournament.status === 'CANCELLED';
  const isConfirmed = registration?.status === 'CONFIRMED';
  const isPendingPayment = registration?.status === 'PENDING_PAYMENT' || registration?.status === 'PAYMENT_SUBMITTED';

  return (
    <div className="group bg-[#14141F] hover:bg-[#181825] border border-zinc-800/80 hover:border-[#FF6A00]/50 rounded-xl overflow-hidden transition-all duration-300 cut-corner flex flex-col justify-between hover:shadow-[0_4px_25px_rgba(255,106,0,0.15)] relative">
      {/* Top Banner & Chips */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-zinc-900">
        <img
          src={tournament.bannerUrl}
          alt={tournament.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14141F] via-[#14141F]/40 to-transparent" />

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          {isLive ? (
            <span className="bg-rose-600 text-white text-[11px] font-score font-bold px-2.5 py-1 rounded shadow-[0_0_12px_rgba(225,29,72,0.8)] flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white"></span> LIVE MATCH
            </span>
          ) : isCompleted ? (
            <span className="bg-zinc-800 text-zinc-300 text-[11px] font-semibold px-2.5 py-0.5 rounded border border-zinc-700">
              FINISHED
            </span>
          ) : isCancelled ? (
            <span className="bg-red-950/80 text-red-400 text-[11px] font-semibold px-2.5 py-0.5 rounded border border-red-800">
              CANCELLED
            </span>
          ) : isFull ? (
            <span className="bg-amber-950/80 text-amber-400 text-[11px] font-semibold px-2.5 py-0.5 rounded border border-amber-800">
              SLOTS FULL
            </span>
          ) : (
            <span className="bg-emerald-950/80 text-emerald-400 text-[11px] font-semibold px-2.5 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#FF6A00]" /> OPEN
            </span>
          )}

          {isConfirmed && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Slot #{registration.slotNumber}
            </span>
          )}
          {isPendingPayment && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[11px] font-semibold px-2 py-0.5 rounded">
              Verification Pending
            </span>
          )}
        </div>

        {/* Entry Fee & Countdown in Header */}
        <div className="absolute top-3 right-3 text-right">
          <div className="bg-black/75 backdrop-blur-md border border-zinc-700/70 px-2.5 py-1 rounded-md">
            <span className="text-[10px] uppercase text-zinc-400 block font-semibold">Entry Fee</span>
            <span className="font-score text-sm font-bold text-white">
              {tournament.entryFee === 0 ? (
                <span className="text-emerald-400">FREE</span>
              ) : (
                formatBDT(tournament.entryFee)
              )}
            </span>
          </div>
        </div>

        {/* Mode / Map chips overlaying bottom banner */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="bg-black/80 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 text-zinc-300 border border-zinc-800">
              <Users className="w-3 h-3 text-[#FF6A00]" /> {tournament.mode}
            </span>
            <span className="bg-black/80 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 text-zinc-300 border border-zinc-800">
              <MapPin className="w-3 h-3 text-amber-400" /> {tournament.map}
            </span>
            <span className="bg-black/80 px-2 py-0.5 rounded text-[11px] font-semibold text-zinc-400 border border-zinc-800 hidden sm:inline-block">
              {tournament.matchType.replace('_', ' ')}
            </span>
          </div>
          {!isCompleted && !isCancelled && (
            <CountdownTimer targetDate={tournament.startsAt} compact />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onSelect(tournament)}
            className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-white hover:text-[#FF6A00] transition-colors cursor-pointer line-clamp-1"
          >
            {tournament.title}
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 mb-3.5">
            {tournament.description}
          </p>

          {/* Prize pool strip */}
          <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-2.5 mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FFC107]">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-zinc-400 font-semibold block">Prize Pool</span>
                <span className="font-score text-base font-bold text-[#FFC107]">
                  {formatBDT(tournament.prizePool)}
                </span>
              </div>
            </div>

            {tournament.perKillPrize && (
              <div className="text-right">
                <span className="text-[10px] uppercase text-zinc-400 font-semibold block">Per Kill</span>
                <span className="font-score text-xs font-semibold text-emerald-400">
                  +{formatBDT(tournament.perKillPrize)}
                </span>
              </div>
            )}
          </div>

          {/* Slot Progress Bar */}
          <div className="mb-4">
            <SlotProgressBar filled={tournament.filledSlots} max={tournament.maxSlots} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between gap-2">
          <div className="text-[11px] text-zinc-400">
            <span>{formatBangladeshTime(tournament.startsAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(tournament)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
            >
              Details
            </button>

            {!isCompleted && !isCancelled && (
              <button
                disabled={isFull && !registration}
                onClick={() => onJoin(tournament)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cut-corner ${
                  isConfirmed
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : isPendingPayment
                    ? 'bg-amber-600 hover:bg-amber-500 text-black'
                    : isFull
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#FF6A00] to-[#FF8800] hover:brightness-110 text-black font-extrabold shadow-[0_0_15px_rgba(255,106,0,0.4)]'
                }`}
              >
                {isConfirmed ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Room ID
                  </>
                ) : isPendingPayment ? (
                  'Review'
                ) : isFull ? (
                  'Full'
                ) : (
                  <>
                    Join Now <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
