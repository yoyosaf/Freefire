import React, { useState } from 'react';
import { 
  ArrowDownToLine, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Check, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { User, Withdrawal } from '../../types';
import { storage } from '../../lib/storage';
import { formatBDT, formatBangladeshTime } from '../../lib/points';
import { hasPermission } from '../../lib/permissions';

interface AdminWithdrawalsProps {
  currentUser: User;
}

export const AdminWithdrawals: React.FC<AdminWithdrawalsProps> = ({ currentUser }) => {
  const [filter, setFilter] = useState<'REQUESTED' | 'PAID' | 'REJECTED' | 'ALL'>('REQUESTED');
  const [refreshKey, setRefreshKey] = useState(0);

  const withdrawals = storage.getWithdrawals();
  const canProcess = hasPermission(currentUser, 'withdrawals.process');

  const filtered = withdrawals.filter((w) => {
    if (filter === 'ALL') return true;
    return w.status === filter;
  });

  const handleMarkPaid = (withdrawalId: string) => {
    const trxId = prompt('Enter the outgoing bKash/Nagad/Rocket Transaction ID (TrxID):', 'BKH' + Math.floor(Math.random() * 899999 + 100000));
    if (!trxId) return;

    try {
      storage.processWithdrawal(withdrawalId, 'PAID', trxId, currentUser);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert(err?.message || 'Error marking withdrawal as paid');
    }
  };

  const handleReject = (withdrawalId: string) => {
    const reason = prompt('Reason for rejecting withdrawal (funds will be refunded to player wallet):', 'Account number incorrect or unreachable');
    if (reason === null) return;

    try {
      storage.processWithdrawal(withdrawalId, 'REJECTED', '', currentUser, reason);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert(err?.message || 'Error rejecting withdrawal');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Withdrawal Payout Queue
          </h1>
          <p className="text-xs text-zinc-400">
            Process player prize cashouts to verified bKash, Nagad, and Rocket mobile numbers
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('REQUESTED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'REQUESTED'
              ? 'bg-[#FF6A00] text-black font-bold shadow-[0_0_12px_rgba(255,106,0,0.4)]'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Pending Payouts ({withdrawals.filter((w) => w.status === 'REQUESTED').length})
        </button>
        <button
          onClick={() => setFilter('PAID')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'PAID'
              ? 'bg-emerald-600 text-white font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Paid ({withdrawals.filter((w) => w.status === 'PAID').length})
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'REJECTED'
              ? 'bg-red-600 text-white font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Rejected ({withdrawals.filter((w) => w.status === 'REJECTED').length})
        </button>
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'ALL'
              ? 'bg-zinc-700 text-white font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          All
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-score">
              <tr>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status & TrxID</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                    No withdrawal requests in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{w.userDisplayName}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Phone: {w.userPhone}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        w.method === 'BKASH' ? 'bg-[#E2136E]/20 text-[#E2136E] border border-[#E2136E]/40' :
                        w.method === 'NAGAD' ? 'bg-[#F7941D]/20 text-[#F7941D] border border-[#F7941D]/40' :
                        'bg-[#8C3494]/20 text-[#8C3494] border border-[#8C3494]/40'
                      }`}>
                        {w.method}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-score text-amber-400 font-bold">
                      {w.accountNumber}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-score text-sm font-bold text-white">
                      {formatBDT(w.amount)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {w.status === 'PAID' ? (
                        <div className="flex flex-col">
                          <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> PAID
                          </span>
                          {w.paidTrxId && (
                            <span className="font-mono text-[10px] text-zinc-400 mt-0.5">
                              Trx: {w.paidTrxId}
                            </span>
                          )}
                        </div>
                      ) : w.status === 'REJECTED' ? (
                        <div className="flex flex-col">
                          <span className="bg-red-950/80 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-700/60 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> REJECTED
                          </span>
                          {w.rejectReason && (
                            <span className="text-[10px] text-zinc-500 mt-0.5 max-w-[150px] truncate" title={w.rejectReason}>
                              {w.rejectReason}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="bg-amber-950/80 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-700/60 flex items-center gap-1 w-fit animate-pulse">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400 text-[11px]">
                      {formatBangladeshTime(w.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {w.status === 'REQUESTED' && canProcess ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleMarkPaid(w.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark Paid
                          </button>
                          <button
                            onClick={() => handleReject(w.id)}
                            className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-red-900/60 hover:text-red-300 text-zinc-400 text-xs font-medium transition-colors border border-zinc-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">
                          {w.processedAt ? 'Processed' : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
