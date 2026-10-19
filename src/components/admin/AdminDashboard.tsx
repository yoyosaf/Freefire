import React, { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  Trophy, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Unlock, 
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { User, Tournament, Payment } from '../../types';
import { storage } from '../../lib/storage';
import { formatBDT, formatBangladeshTime } from '../../lib/points';
import { hasPermission } from '../../lib/permissions';

interface AdminDashboardProps {
  currentUser: User;
  onNavigateSubPage: (subPage: string) => void;
  onOpenReleaseModal: (tournament: Tournament) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onNavigateSubPage,
  onOpenReleaseModal,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const tournaments = storage.getTournaments();
  const registrations = storage.getRegistrations();
  const payments = storage.getPayments();
  const users = storage.getUsers();
  const auditLogs = storage.getAuditLogs();

  const totalPlayers = users.filter((u) => u.role === 'PLAYER').length;
  const activeTournaments = tournaments.filter((t) => t.status === 'OPEN' || t.status === 'LIVE' || t.status === 'FULL').length;
  const pendingPayments = payments.filter((p) => p.status === 'SUBMITTED');
  const verifiedPayments = payments.filter((p) => p.status === 'VERIFIED');
  const totalRevenue = verifiedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const canVerifyPayments = hasPermission(currentUser, 'payments.verify');
  const canReleaseRoom = hasPermission(currentUser, 'tournaments.release_room');
  const canViewAudit = hasPermission(currentUser, 'audit.view');

  const handleQuickApprove = (paymentId: string) => {
    try {
      storage.approvePayment(paymentId, currentUser);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert(err?.message || 'Error approving payment');
    }
  };

  const handleQuickReject = (paymentId: string) => {
    const reason = prompt('Reason for rejecting payment:');
    if (reason === null) return;
    try {
      storage.rejectPayment(paymentId, reason || 'Transaction ID not verified', currentUser);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert(err?.message || 'Error rejecting payment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Operations Command Center
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time tournament health, queue validation, and participant slots
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission(currentUser, 'tournaments.create') && (
            <button
              onClick={() => onNavigateSubPage('tournaments')}
              className="px-3.5 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#FF8800] text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(255,106,0,0.3)] cut-corner flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" /> + Create Tournament
            </button>
          )}
        </div>
      </div>

      {/* Top 5 Metric Cards (Spec 19.10) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#14141F] border border-zinc-800 p-4 rounded-xl cut-corner">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Total Players</span>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <span className="font-score text-xl sm:text-2xl font-bold text-white">
            {totalPlayers}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">Free Fire IDs</span>
        </div>

        <div className="bg-[#14141F] border border-zinc-800 p-4 rounded-xl cut-corner">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Registrations</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-score text-xl sm:text-2xl font-bold text-emerald-400">
            {registrations.length}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">Total slots engaged</span>
        </div>

        <div className="bg-[#14141F] border border-[#FF6A00]/40 p-4 rounded-xl cut-corner bg-gradient-to-br from-[#14141F] to-[#251810]">
          <div className="flex items-center justify-between text-[#FF6A00] text-xs mb-1 font-semibold">
            <span>Pending Payments</span>
            <CreditCard className="w-4 h-4 text-[#FF6A00]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-score text-xl sm:text-2xl font-extrabold text-[#FF6A00]">
              {pendingPayments.length}
            </span>
            {pendingPayments.length > 0 && (
              <span className="bg-[#FF6A00] text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                ACTION
              </span>
            )}
          </div>
          <span className="text-[10px] text-zinc-400 block mt-1">Need verification</span>
        </div>

        <div className="bg-[#14141F] border border-zinc-800 p-4 rounded-xl cut-corner">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Revenue</span>
            <DollarSign className="w-4 h-4 text-[#FFC107]" />
          </div>
          <span className="font-score text-xl sm:text-2xl font-bold text-[#FFC107]">
            {formatBDT(totalRevenue)}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">Entry fees collected</span>
        </div>

        <div className="bg-[#14141F] border border-zinc-800 p-4 rounded-xl cut-corner col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Active Matches</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <span className="font-score text-xl sm:text-2xl font-bold text-white">
            {activeTournaments}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-1">Open & live tournaments</span>
        </div>
      </div>

      {/* Main Grid: Pending Payments Widget & Upcoming Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pending Payments Queue (2 cols) */}
        <div className="lg:col-span-2 bg-[#14141F] border border-zinc-800 rounded-xl p-5 cut-corner space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#FF6A00]" />
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-white">
                Pending Verification Queue
              </h3>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-score px-2 py-0.5 rounded font-bold">
                {pendingPayments.length} awaiting
              </span>
            </div>
            <button
              onClick={() => onNavigateSubPage('payments')}
              className="text-xs text-[#FF6A00] hover:underline flex items-center gap-1 font-semibold"
            >
              Full Queue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              <CheckCircle className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
              All clear! No incoming payments waiting for manual approval.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.slice(0, 4).map((pay) => (
                <div
                  key={pay.id}
                  className="bg-zinc-900/90 border border-zinc-800/90 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        pay.method === 'BKASH' ? 'bg-[#E2136E]/20 text-[#E2136E] border border-[#E2136E]/40' :
                        pay.method === 'NAGAD' ? 'bg-[#F7941D]/20 text-[#F7941D] border border-[#F7941D]/40' :
                        'bg-[#8C3494]/20 text-[#8C3494] border border-[#8C3494]/40'
                      }`}>
                        {pay.method}
                      </span>
                      <span className="text-xs font-bold text-white">{pay.userDisplayName}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">({pay.senderNumber})</span>
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-2 flex-wrap">
                      <span>Tournament: <strong className="text-zinc-200">{pay.tournamentTitle}</strong></span>
                      <span>·</span>
                      <span>TrxID: <strong className="text-amber-400 font-mono">{pay.trxId}</strong></span>
                      <span>·</span>
                      <span className="font-score text-white font-bold">{formatBDT(pay.amount)}</span>
                    </div>
                  </div>

                  {canVerifyPayments && (
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleQuickApprove(pay.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleQuickReject(pay.id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/50 hover:text-red-300 text-zinc-400 text-xs font-medium transition-colors flex items-center gap-1 border border-zinc-700"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Tournaments & Release Room Shortcut */}
        <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-5 cut-corner space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FFC107]" />
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-white">
                Upcoming Tournaments
              </h3>
            </div>
            <button
              onClick={() => onNavigateSubPage('tournaments')}
              className="text-xs text-zinc-400 hover:text-white"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {tournaments.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{t.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    t.status === 'LIVE' ? 'bg-rose-600 text-white animate-pulse' :
                    t.status === 'COMPLETED' ? 'bg-zinc-800 text-zinc-400' :
                    'bg-emerald-950/80 text-emerald-400'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>{t.mode} · {t.map}</span>
                  <span className="font-score text-zinc-300">{t.filledSlots}/{t.maxSlots} Slots</span>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">{formatBangladeshTime(t.startsAt)}</span>
                  {canReleaseRoom && !t.roomReleasedAt && t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
                    <button
                      onClick={() => onOpenReleaseModal(t)}
                      className="px-2.5 py-1 rounded bg-[#FF6A00]/20 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-black border border-[#FF6A00]/50 text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <Unlock className="w-3 h-3" /> Release Room
                    </button>
                  )}
                  {t.roomReleasedAt && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Room Released
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Audit Trail Activity (Admin Only) */}
      {canViewAudit && (
        <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-5 cut-corner space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
              Recent Staff Audit Activity
            </h3>
            <button
              onClick={() => onNavigateSubPage('audit-logs')}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Full Audit Trail
            </button>
          </div>

          <div className="divide-y divide-zinc-800/60 text-xs">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-zinc-500 text-[10px]">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-bold text-white">{log.actorName}</span>
                  <span className="text-zinc-400">performed</span>
                  <span className="bg-zinc-800 text-amber-400 px-2 py-0.5 rounded font-mono text-[10px] font-semibold">
                    {log.action}
                  </span>
                  <span className="text-zinc-500 text-[11px] hidden sm:inline">({log.entityType})</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">{log.ipAddress}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
