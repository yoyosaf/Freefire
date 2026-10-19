import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ShieldCheck,
  RefreshCcw
} from 'lucide-react';
import { User, WalletTransaction, Withdrawal } from '../../types';
import { storage } from '../../lib/storage';
import { formatBDT, formatBangladeshTime } from '../../lib/points';

interface WalletPageProps {
  currentUser: User;
  onOpenWithdraw: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({
  currentUser,
  onOpenWithdraw,
}) => {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'WITHDRAWALS'>('TRANSACTIONS');

  const transactions = storage.getWalletTransactions(currentUser.id);
  const withdrawals = storage.getWithdrawals(currentUser.id);

  // Calculate statistics
  const totalWon = transactions
    .filter((tx) => tx.type === 'PRIZE')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalWithdrawn = withdrawals
    .filter((w) => w.status === 'PAID')
    .reduce((acc, w) => acc + w.amount, 0);

  const totalRefunded = transactions
    .filter((tx) => tx.type === 'REFUND')
    .reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-400" />
          Prize Wallet & Payouts
        </h1>
        <p className="text-xs text-zinc-400">
          Manage your tournament earnings, review ledger transactions, and withdraw cash to bKash, Nagad, or Rocket
        </p>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-[#1C1C2B] via-[#14141F] to-[#0e0e17] border border-emerald-500/40 rounded-2xl p-6 sm:p-8 cut-corner shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
              Available Wallet Balance
            </span>
            <div className="font-score text-3xl sm:text-5xl font-black text-emerald-400 tracking-tight">
              {formatBDT(currentUser.walletBalance)}
            </div>
            <p className="text-xs text-zinc-400 pt-1">
              Eligible for instant withdrawal · Minimum withdrawal is ৳100
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenWithdraw}
              disabled={currentUser.walletBalance < 100}
              className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#FFC107] to-amber-500 hover:brightness-110 text-black shadow-[0_0_20px_rgba(255,193,7,0.3)] transition-all cut-corner flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw to bKash / Nagad
            </button>
          </div>
        </div>

        {/* 3 Metrics Strips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-zinc-800/80">
          <div className="bg-black/40 border border-zinc-800 p-3 rounded-lg">
            <span className="text-[10px] uppercase text-zinc-400 font-semibold block">Total Tournament Prizes Won</span>
            <span className="font-score text-base font-bold text-[#FFC107]">{formatBDT(totalWon)}</span>
          </div>
          <div className="bg-black/40 border border-zinc-800 p-3 rounded-lg">
            <span className="text-[10px] uppercase text-zinc-400 font-semibold block">Total Withdrawn Cash</span>
            <span className="font-score text-base font-bold text-white">{formatBDT(totalWithdrawn)}</span>
          </div>
          <div className="bg-black/40 border border-zinc-800 p-3 rounded-lg">
            <span className="text-[10px] uppercase text-zinc-400 font-semibold block">Total Refunds Processed</span>
            <span className="font-score text-base font-bold text-cyan-400">{formatBDT(totalRefunded)}</span>
          </div>
        </div>
      </div>

      {/* Tabs: Ledger Transactions vs Withdrawal Requests */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-zinc-800 text-white font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Transaction History ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('WITHDRAWALS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'WITHDRAWALS'
              ? 'bg-zinc-800 text-white font-bold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Withdrawal Requests ({withdrawals.length})
        </button>
      </div>

      {/* Tab 1: Transaction History */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-score">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500 text-xs">
                      No wallet transactions recorded yet. Join tournaments to earn prizes!
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            tx.type === 'PRIZE' ? 'bg-amber-500/20 text-[#FFC107] border border-amber-500/30' :
                            tx.type === 'REFUND' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                            tx.type === 'WITHDRAWAL' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-white block">{tx.note}</span>
                          {tx.tournamentTitle && (
                            <span className="text-[11px] text-zinc-400 block">{tx.tournamentTitle}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-score text-sm font-bold">
                          <span className={isCredit ? 'text-emerald-400' : 'text-zinc-300'}>
                            {isCredit ? `+${formatBDT(tx.amount)}` : formatBDT(tx.amount)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-right text-zinc-500 text-[11px]">
                          {formatBangladeshTime(tx.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Withdrawal Requests */}
      {activeTab === 'WITHDRAWALS' && (
        <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-score">
                <tr>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Target Number</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status & TrxID</th>
                  <th className="py-3 px-4 text-right">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 text-xs">
                      No cash withdrawal requests yet.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          w.method === 'BKASH' ? 'bg-[#E2136E]/20 text-[#E2136E]' :
                          w.method === 'NAGAD' ? 'bg-[#F7941D]/20 text-[#F7941D]' :
                          'bg-[#8C3494]/20 text-[#8C3494]'
                        }`}>
                          {w.method}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-score text-white font-bold">
                        {w.accountNumber}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-score text-white font-bold">
                        {formatBDT(w.amount)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {w.status === 'PAID' ? (
                          <div className="flex flex-col">
                            <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> PAID
                            </span>
                            {w.paidTrxId && (
                              <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
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
                              <span className="text-[10px] text-zinc-500 mt-0.5 max-w-[150px] truncate">
                                {w.rejectReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="bg-amber-950/80 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-700/60 flex items-center gap-1 w-fit animate-pulse">
                            <Clock className="w-3 h-3" /> PENDING DISBURSEMENT
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right text-zinc-500 text-[11px]">
                        {formatBangladeshTime(w.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
