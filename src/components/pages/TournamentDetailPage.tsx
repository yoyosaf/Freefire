import React from 'react';
import { 
  ChevronLeft, 
  Trophy, 
  Users, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Award, 
  Flame, 
  ArrowRight,
  Crosshair
} from 'lucide-react';
import { Tournament, Registration, User } from '../../types';
import { RoomCard } from '../RoomCard';
import { SlotProgressBar } from '../SlotProgressBar';
import { CountdownTimer } from '../CountdownTimer';
import { LeaderboardTable } from '../LeaderboardTable';
import { formatBDT, formatBangladeshTime } from '../../lib/points';
import { storage } from '../../lib/storage';

interface TournamentDetailPageProps {
  tournament: Tournament;
  registration?: Registration;
  currentUser: User;
  onBack: () => void;
  onJoin: (tournament: Tournament) => void;
  onViewRoomDetails?: () => void;
}

export const TournamentDetailPage: React.FC<TournamentDetailPageProps> = ({
  tournament,
  registration,
  currentUser,
  onBack,
  onJoin,
}) => {
  const isFull = tournament.filledSlots >= tournament.maxSlots;
  const isLive = tournament.status === 'LIVE';
  const isCompleted = tournament.status === 'COMPLETED';
  const isCancelled = tournament.status === 'CANCELLED';
  const isConfirmed = registration?.status === 'CONFIRMED';
  const isPendingPayment = registration?.status === 'PENDING_PAYMENT' || registration?.status === 'PAYMENT_SUBMITTED';

  const results = storage.getMatchResults(tournament.id);
  const isStaff = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'MODERATOR';

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Tournaments
      </button>

      {/* Main Banner Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 cut-corner">
        <div className="h-56 sm:h-72 w-full relative">
          <img
            src={tournament.bannerUrl}
            alt={tournament.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-[#0B0B12]/60 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {isLive ? (
              <span className="bg-rose-600 text-white text-xs font-bold font-score px-3 py-1 rounded shadow-lg flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span> LIVE MATCH
              </span>
            ) : isCompleted ? (
              <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded border border-zinc-700">
                MATCH CONCLUDED
              </span>
            ) : isCancelled ? (
              <span className="bg-red-950 text-red-400 text-xs font-bold px-3 py-1 rounded border border-red-800">
                CANCELLED
              </span>
            ) : isFull ? (
              <span className="bg-amber-950 text-amber-400 text-xs font-bold px-3 py-1 rounded border border-amber-800">
                SLOTS FULL
              </span>
            ) : (
              <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-3 py-1 rounded border border-emerald-800 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#FF6A00]" /> OPEN REGISTRATION
              </span>
            )}
          </div>

          {/* Bottom Title & Chips */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold uppercase text-white tracking-tight drop-shadow-md">
                {tournament.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-zinc-300 mt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#FF6A00]" /> {tournament.mode}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FFC107]" /> {tournament.map}
                </span>
                <span>·</span>
                <span className="font-mono">{tournament.matchType.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Countdown to match */}
            {!isCompleted && !isCancelled && (
              <div className="bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-700/80">
                <CountdownTimer targetDate={tournament.startsAt} label="Starts In" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Room Details Protected Card */}
      <RoomCard tournament={tournament} registration={registration} isStaff={isStaff} />

      {/* Registration Status or Join CTA Bar */}
      <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-5 cut-corner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-semibold uppercase">Your Registration:</span>
            {isConfirmed ? (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-2.5 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Confirmed (Slot #{registration?.slotNumber})
              </span>
            ) : isPendingPayment ? (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-2.5 py-0.5 rounded">
                Payment Submitted · Awaiting Verification
              </span>
            ) : (
              <span className="text-zinc-500 text-xs font-semibold">Not Registered</span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            {formatBangladeshTime(tournament.startsAt)} (BST Timezone)
          </p>
        </div>

        {/* Join button */}
        {!isCompleted && !isCancelled && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!registration && (
              <button
                disabled={isFull}
                onClick={() => onJoin(tournament)}
                className={`w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cut-corner ${
                  isFull
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#FF6A00] to-[#FF8800] hover:brightness-110 text-black shadow-[0_0_20px_rgba(255,106,0,0.4)]'
                }`}
              >
                {isFull ? (
                  'Slots Full'
                ) : (
                  <>
                    Join Tournament · {tournament.entryFee === 0 ? 'FREE' : formatBDT(tournament.entryFee)}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {isPendingPayment && (
              <button
                onClick={() => onJoin(tournament)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-extrabold text-xs transition-colors"
              >
                View Payment Details
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid: Financials & Slots Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 cols: Details & Rules */}
        <div className="md:col-span-2 space-y-6">
          {/* Slot Progress */}
          <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-5 cut-corner space-y-3">
            <h3 className="font-display text-sm font-bold uppercase text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF6A00]" />
              Tournament Slot Status
            </h3>
            <SlotProgressBar filled={tournament.filledSlots} max={tournament.maxSlots} />
            <p className="text-xs text-zinc-400">
              Slots are locked permanently upon admin verification of payment or free entry registration.
            </p>
          </div>

          {/* Official Rules */}
          <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-5 cut-corner space-y-3">
            <h3 className="font-display text-sm font-bold uppercase text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FFC107]" />
              Rules & Fair Play Guidelines
            </h3>
            <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/60 p-4 rounded-lg border border-zinc-800/80">
              {tournament.rules}
            </div>
          </div>

          {/* Completed Leaderboard */}
          {isCompleted && results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-base font-bold uppercase text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FFC107]" />
                Official Match Leaderboard
              </h3>
              <LeaderboardTable results={results} />
            </div>
          )}
        </div>

        {/* Right col: Prize Pool & Points System */}
        <div className="space-y-6">
          {/* Prize Pool Breakdown Card */}
          <div className="bg-[#14141F] border border-amber-500/40 rounded-xl p-5 cut-corner shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Prize Pool</span>
              <span className="font-score text-xl font-extrabold text-[#FFC107]">
                {formatBDT(tournament.prizePool)}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide block">
                Rank Prize Split
              </span>
              {Object.entries(tournament.prizeDistribution).map(([rank, prize]) => (
                <div
                  key={rank}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-xs"
                >
                  <span className="font-semibold text-white">
                    {rank === '1' ? '🥇 1st Place (Booyah)' : rank === '2' ? '🥈 2nd Place' : rank === '3' ? '🥉 3rd Place' : `Rank #${rank}`}
                  </span>
                  <span className="font-score font-bold text-[#FFC107]">{formatBDT(prize)}</span>
                </div>
              ))}

              {tournament.perKillPrize && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs mt-2">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5" /> Kill Bounty
                  </span>
                  <span className="font-score font-bold text-emerald-400">+{formatBDT(tournament.perKillPrize)} / kill</span>
                </div>
              )}
            </div>
          </div>

          {/* Points System Card */}
          <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-5 cut-corner space-y-3">
            <h4 className="font-display text-xs font-bold uppercase text-zinc-300">
              Scoring System
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-zinc-900 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-400">1st (Booyah):</span>
                <span className="font-score font-bold text-white">12 pts</span>
              </div>
              <div className="p-2 bg-zinc-900 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-400">2nd Place:</span>
                <span className="font-score font-bold text-white">9 pts</span>
              </div>
              <div className="p-2 bg-zinc-900 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-400">3rd Place:</span>
                <span className="font-score font-bold text-white">8 pts</span>
              </div>
              <div className="p-2 bg-zinc-900 rounded border border-zinc-800 flex justify-between">
                <span className="text-zinc-400">Each Kill:</span>
                <span className="font-score font-bold text-emerald-400">1 pt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
