import React from 'react';
import { 
  Trophy, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Key, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Registration, Tournament, User } from '../../types';
import { formatBDT, formatBangladeshTime } from '../../lib/points';

interface MyTournamentsPageProps {
  currentUser: User;
  registrations: Registration[];
  tournaments: Tournament[];
  onSelectTournament: (tournament: Tournament) => void;
  onOpenPaymentModal: (tournament: Tournament, reg: Registration) => void;
  onBrowseTournaments: () => void;
}

export const MyTournamentsPage: React.FC<MyTournamentsPageProps> = ({
  currentUser,
  registrations,
  tournaments,
  onSelectTournament,
  onOpenPaymentModal,
  onBrowseTournaments,
}) => {
  const userRegs = registrations.filter((r) => r.userId === currentUser.id);

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FF6A00]" />
            My Tournament Registrations
          </h1>
          <p className="text-xs text-zinc-400">
            Track your slot confirmations, payment status, and unlock custom room credentials
          </p>
        </div>
        <span className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg w-fit">
          Active Registrations: <strong className="text-white font-score">{userRegs.length}</strong>
        </span>
      </div>

      {userRegs.length === 0 ? (
        <div className="bg-[#14141F] border border-zinc-800 rounded-2xl p-10 text-center space-y-4 cut-corner">
          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 mx-auto">
            <Trophy className="w-6 h-6 text-[#FF6A00]" />
          </div>
          <h3 className="font-display text-base font-bold uppercase text-white">
            No Registrations Found
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            You haven't registered for any Free Fire tournaments yet. Browse the tournament board to join your first clash!
          </p>
          <button
            onClick={onBrowseTournaments}
            className="px-5 py-2.5 rounded-lg text-xs font-extrabold bg-[#FF6A00] hover:bg-[#FF8800] text-black shadow-lg cut-corner inline-flex items-center gap-1.5"
          >
            Browse Tournaments <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {userRegs.map((reg) => {
            const tournament = tournaments.find((t) => t.id === reg.tournamentId);
            if (!tournament) return null;

            const isConfirmed = reg.status === 'CONFIRMED';
            const isPendingReview = reg.status === 'PAYMENT_SUBMITTED';
            const isPendingPayment = reg.status === 'PENDING_PAYMENT';
            const isRoomReleased = Boolean(tournament.roomReleasedAt && tournament.roomId);

            return (
              <div
                key={reg.id}
                className="bg-[#14141F] border border-zinc-800 rounded-xl p-5 cut-corner space-y-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div>
                    <h3
                      onClick={() => onSelectTournament(tournament)}
                      className="font-display text-lg font-bold uppercase tracking-wide text-white hover:text-[#FF6A00] transition-colors cursor-pointer"
                    >
                      {tournament.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span>{tournament.mode}</span>
                      <span>·</span>
                      <span>{tournament.map}</span>
                      <span>·</span>
                      <span>{formatBangladeshTime(tournament.startsAt)}</span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {isConfirmed ? (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> CONFIRMED · SLOT #{reg.slotNumber}
                      </span>
                    ) : isPendingReview ? (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded flex items-center gap-1">
                        <Clock className="w-4 h-4 animate-spin" /> PAYMENT REVIEW PENDING
                      </span>
                    ) : isPendingPayment ? (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold px-3 py-1 rounded flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> PAYMENT REQUIRED (15M HOLD)
                      </span>
                    ) : (
                      <span className="bg-zinc-800 text-zinc-400 text-xs font-bold px-3 py-1 rounded">
                        {reg.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub details: Room Credentials state */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    {isConfirmed ? (
                      isRoomReleased ? (
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                          <Key className="w-4 h-4" /> Room details are ready! Room ID: {tournament.roomId}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Clock className="w-4 h-4 text-amber-500" /> Room details will be unlocked 10-15m before match start.
                        </div>
                      )
                    ) : isPendingPayment ? (
                      <div className="text-amber-400">
                        Please submit your bKash/Nagad TrxID before the slot hold expires!
                      </div>
                    ) : (
                      <div className="text-zinc-400">
                        Staff is checking your transaction ID against carrier SMS.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPendingPayment && (
                      <button
                        onClick={() => onOpenPaymentModal(tournament, reg)}
                        className="px-4 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#FF8800] text-black text-xs font-extrabold transition-all"
                      >
                        Submit TrxID Now
                      </button>
                    )}

                    <button
                      onClick={() => onSelectTournament(tournament)}
                      className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      Match Room <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
