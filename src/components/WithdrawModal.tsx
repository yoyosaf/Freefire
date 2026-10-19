import React, { useState } from 'react';
import { X, Wallet, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { User, Withdrawal } from '../types';
import { storage } from '../lib/storage';
import { formatBDT } from '../lib/points';

interface WithdrawModalProps {
  user: User;
  onClose: () => void;
  onSuccess: (withdrawal: Withdrawal) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [method, setMethod] = useState<'BKASH' | 'NAGAD' | 'ROCKET'>('BKASH');
  const [amount, setAmount] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>(user.phone || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const minWithdraw = storage.getSiteSettings().minimumWithdrawalAmount || 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < minWithdraw) {
      setError(`Minimum withdrawal amount is ${formatBDT(minWithdraw)}.`);
      return;
    }

    if (numAmount > user.walletBalance) {
      setError(`Cannot withdraw ${formatBDT(numAmount)}. Your current balance is ${formatBDT(user.walletBalance)}.`);
      return;
    }

    if (!accountNumber || accountNumber.trim().length < 11) {
      setError('Please provide a valid 11-digit Bangladesh wallet account number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const wd = storage.requestWithdrawal(user, numAmount, method, accountNumber.trim());
      setSuccess(true);
      setTimeout(() => {
        onSuccess(wd);
      }, 1800);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit withdrawal request.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#14141F] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative cut-corner">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#FFC107]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
                Withdraw Prize Money
              </h2>
              <p className="text-xs text-zinc-400">
                Available Balance: <strong className="text-emerald-400">{formatBDT(user.walletBalance)}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 animate-bounce" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase text-white">
              Payout Request Received!
            </h3>
            <p className="text-xs text-zinc-400">
              Admin will disburse {formatBDT(Number(amount))} to your {method} account ({accountNumber}) within 2-12 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Method selection */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5 uppercase">
                Select Payout Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('BKASH')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    method === 'BKASH'
                      ? 'bg-[#E2136E]/20 border-[#E2136E] text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  bKash
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('NAGAD')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    method === 'NAGAD'
                      ? 'bg-[#F7941D]/20 border-[#F7941D] text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Nagad
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('ROCKET')}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                    method === 'ROCKET'
                      ? 'bg-[#8C3494]/20 border-[#8C3494] text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  Rocket
                </button>
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Your {method} Number <span className="text-[#FF6A00]">*</span>
              </label>
              <input
                type="text"
                placeholder="017XXXXXXXX"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-400">
                  Withdrawal Amount (BDT ৳) <span className="text-[#FF6A00]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(String(Math.floor(user.walletBalance)))}
                  className="text-[11px] text-[#FF6A00] hover:underline font-semibold"
                >
                  Withdraw All
                </button>
              </div>
              <input
                type="number"
                min={minWithdraw}
                max={user.walletBalance}
                step="1"
                placeholder={`Min: ৳${minWithdraw}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-score focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-950/60 p-2.5 rounded border border-zinc-800">
              Note: Withdrawals are processed daily between 10:00 AM and 11:00 PM BST. No transaction fee is deducted from your prize money.
            </p>

            {/* Actions */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || user.walletBalance < minWithdraw}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#FFC107] to-amber-500 hover:brightness-110 text-black shadow-[0_0_15px_rgba(255,193,7,0.3)] transition-all cut-corner flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Requesting...' : <>Submit Request <ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
