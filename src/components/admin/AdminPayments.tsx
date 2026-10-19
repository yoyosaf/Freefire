import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  ExternalLink,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { User, Payment, PaymentStatus } from '../../types';
import { storage } from '../../lib/storage';
import { formatBDT, formatBangladeshTime } from '../../lib/points';
import { hasPermission } from '../../lib/permissions';

interface AdminPaymentsProps {
  currentUser: User;
}

export const AdminPayments: React.FC<AdminPaymentsProps> = ({ currentUser }) => {
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'ALL'>('SUBMITTED');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewScreenshot, setViewScreenshot] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const payments = storage.getPayments();
  const canVerify = hasPermission(currentUser, 'payments.verify');

  const filtered = payments.filter((p) => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.trxId.toLowerCase().includes(q) ||
        p.senderNumber.includes(q) ||
        (p.userDisplayName && p.userDisplayName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleApprove = (paymentId: string) => {
    try {
      storage.approvePayment(paymentId, currentUser);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert(err?.message || 'Error approving payment');
    }
  };

  const handleReject = (paymentId: string) => {
    const reason = prompt('Enter rejection reason (will be visible to the player):', 'Invalid Transaction ID or amount mismatch');
    if (reason === null) return;
    try {
      storage.rejectPayment(paymentId, reason, currentUser);
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
            Manual Payments Verification Queue
          </h1>
          <p className="text-xs text-zinc-400">
            Verify bKash, Nagad, and Rocket incoming transaction SMS against player submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg">
            Total Submissions: <strong className="text-white font-score">{payments.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#14141F] border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 cut-corner">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('SUBMITTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'SUBMITTED'
                ? 'bg-[#FF6A00] text-black font-bold shadow-[0_0_12px_rgba(255,106,0,0.4)]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Pending Review ({payments.filter((p) => p.status === 'SUBMITTED').length})
          </button>
          <button
            onClick={() => setFilterStatus('VERIFIED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'VERIFIED'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Verified ({payments.filter((p) => p.status === 'VERIFIED').length})
          </button>
          <button
            onClick={() => setFilterStatus('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'REJECTED'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Rejected ({payments.filter((p) => p.status === 'REJECTED').length})
          </button>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-zinc-700 text-white font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            All Submissions
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search TrxID, number, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-score">
              <tr>
                <th className="py-3 px-4">Method & Player</th>
                <th className="py-3 px-4">Sender Number</th>
                <th className="py-3 px-4">TrxID (SMS)</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Receiving Account</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                    No payment submissions match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Player & Method */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            p.method === 'BKASH' ? 'bg-[#E2136E]/20 text-[#E2136E] border border-[#E2136E]/40' :
                            p.method === 'NAGAD' ? 'bg-[#F7941D]/20 text-[#F7941D] border border-[#F7941D]/40' :
                            p.method === 'ROCKET' ? 'bg-[#8C3494]/20 text-[#8C3494] border border-[#8C3494]/40' :
                            'bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40'
                          }`}>
                            {p.method}
                          </span>
                          <div>
                            <span className="font-bold text-white block">{p.userDisplayName}</span>
                            <span className="text-[10px] text-zinc-400 block truncate max-w-[150px]">{p.tournamentTitle}</span>
                          </div>
                        </div>
                      </td>

                      {/* Sender Number */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-score text-zinc-300">
                        {p.senderNumber}
                      </td>

                      {/* TrxID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-score font-bold text-amber-400 bg-black/60 px-2 py-0.5 rounded border border-amber-500/20 tracking-wider">
                          {p.trxId}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-score font-bold text-white">
                        {formatBDT(p.amount)}
                      </td>

                      {/* Paid to Account */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                        {p.paidToAccount || 'Admin Primary'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.status === 'VERIFIED' ? (
                          <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                          </span>
                        ) : p.status === 'REJECTED' ? (
                          <div className="flex flex-col">
                            <span className="bg-red-950/80 text-red-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-red-700/60 flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" /> REJECTED
                            </span>
                            {p.rejectReason && (
                              <span className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[140px]" title={p.rejectReason}>
                                {p.rejectReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="bg-amber-950/80 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-amber-700/60 flex items-center gap-1 w-fit animate-pulse">
                            SUBMITTED
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {p.status === 'SUBMITTED' && canVerify ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(p.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                              title="Verify TrxID & Confirm Slot"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(p.id)}
                              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-red-900/60 hover:text-red-300 text-zinc-400 text-xs font-medium transition-colors flex items-center gap-1 border border-zinc-700"
                              title="Reject submission with reason"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500">
                            {p.verifiedAt ? formatBangladeshTime(p.verifiedAt) : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
