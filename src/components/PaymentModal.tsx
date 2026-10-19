import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Wallet, 
  ArrowRight,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { Tournament, Registration, User, PaymentAccount, PaymentMethod } from '../types';
import { storage } from '../lib/storage';
import { formatBDT } from '../lib/points';

interface PaymentModalProps {
  tournament: Tournament;
  registration: Registration;
  currentUser: User;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  tournament,
  registration,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('BKASH');
  const [senderNumber, setSenderNumber] = useState(currentUser.phone || '');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSubmitted, setSuccessSubmitted] = useState(false);
  const [step, setStep] = useState<number>(1); // 1: Choose, 2: Send Money, 3: Verify TrxID, 4: Done

  // 15-minute countdown for hold
  const [holdSecondsRemaining, setHoldSecondsRemaining] = useState<number>(15 * 60);

  useEffect(() => {
    const accounts = storage.getPaymentAccounts(true);
    setPaymentAccounts(accounts);
    if (accounts.length > 0) {
      setSelectedMethod(accounts[0].method);
    }

    if (registration.holdExpiresAt) {
      const diff = Math.floor((new Date(registration.holdExpiresAt).getTime() - Date.now()) / 1000);
      setHoldSecondsRemaining(Math.max(0, diff));
    }

    const interval = setInterval(() => {
      setHoldSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [registration]);

  const activeAccount = paymentAccounts.find((a) => a.method === selectedMethod) || paymentAccounts[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedMethod !== 'WALLET') {
      if (!senderNumber || senderNumber.length < 11) {
        setError('Please enter a valid 11-digit sender phone number (e.g. 017XXXXXXXX)');
        return;
      }
      if (!trxId || trxId.trim().length < 5) {
        setError('Please enter a valid Transaction ID from your payment SMS');
        return;
      }
    } else {
      if (currentUser.walletBalance < tournament.entryFee) {
        setError(`Insufficient wallet balance. You need ${formatBDT(tournament.entryFee)}, but have ${formatBDT(currentUser.walletBalance)}.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      storage.submitPayment(
        registration.id,
        currentUser,
        selectedMethod,
        selectedMethod === 'WALLET' ? currentUser.phone || '01700000000' : senderNumber,
        trxId,
        undefined,
        activeAccount?.accountNumber
      );
      setSuccessSubmitted(true);
      setStep(4);
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err: any) {
      setError(err?.message || 'Payment submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#14141F] border border-zinc-800 rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative cut-corner my-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#FF6A00]/20 border border-[#FF6A00]/40 flex items-center justify-center text-[#FF6A00]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-white">
                Complete Tournament Entry
              </h2>
              <p className="text-xs text-zinc-400">
                {tournament.title} · Entry Fee: <strong className="text-white">{formatBDT(tournament.entryFee)}</strong>
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

        {/* 15-Minute Slot Hold Notice */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-3 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-200">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Slot held for you. Submit payment within:</span>
          </div>
          <span className="font-score text-sm font-bold text-amber-400 bg-black/60 px-2.5 py-0.5 rounded border border-amber-500/40">
            {formatTimer(holdSecondsRemaining)}
          </span>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-1.5 mb-6 text-center text-[10px] font-semibold uppercase tracking-wider">
          <div className={`p-2 rounded ${step >= 1 ? 'bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40' : 'bg-zinc-800 text-zinc-500'}`}>
            1. Select
          </div>
          <div className={`p-2 rounded ${step >= 2 ? 'bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40' : 'bg-zinc-800 text-zinc-500'}`}>
            2. Send
          </div>
          <div className={`p-2 rounded ${step >= 3 ? 'bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40' : 'bg-zinc-800 text-zinc-500'}`}>
            3. TrxID
          </div>
          <div className={`p-2 rounded ${step >= 4 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500'}`}>
            4. Verify
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 4: Success confirmation screen */}
        {successSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-white">
              Payment Submitted Successfully!
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Our tournament verification staff is reviewing your Transaction ID ({trxId}). Your slot number will be permanently confirmed within a few minutes!
            </p>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 inline-block font-mono">
              Status: <span className="text-amber-400 font-bold">PAYMENT_SUBMITTED</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('BKASH'); setStep(2); }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedMethod === 'BKASH'
                      ? 'bg-[#E2136E]/15 border-[#E2136E] text-white shadow-[0_0_15px_rgba(226,19,110,0.3)]'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xs font-bold text-[#E2136E]">bKash</span>
                  <span className="text-[10px] text-zinc-500 mt-1">Personal / App</span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('NAGAD'); setStep(2); }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedMethod === 'NAGAD'
                      ? 'bg-[#F7941D]/15 border-[#F7941D] text-white shadow-[0_0_15px_rgba(247,148,29,0.3)]'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xs font-bold text-[#F7941D]">Nagad</span>
                  <span className="text-[10px] text-zinc-500 mt-1">Personal / App</span>
                </button>

                {/* Rocket */}
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('ROCKET'); setStep(2); }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedMethod === 'ROCKET'
                      ? 'bg-[#8C3494]/15 border-[#8C3494] text-white shadow-[0_0_15px_rgba(140,52,148,0.3)]'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xs font-bold text-[#8C3494]">Rocket</span>
                  <span className="text-[10px] text-zinc-500 mt-1">DBBL Rocket</span>
                </button>

                {/* In-app Wallet */}
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('WALLET'); setStep(3); }}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedMethod === 'WALLET'
                      ? 'bg-[#FF6A00]/15 border-[#FF6A00] text-white shadow-[0_0_15px_rgba(255,106,0,0.3)]'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#FF6A00]">Wallet</span>
                    <Wallet className="w-3.5 h-3.5 text-[#FF6A00]" />
                  </div>
                  <span className="text-[10px] text-emerald-400 mt-1 font-score font-semibold">
                    {formatBDT(currentUser.walletBalance)}
                  </span>
                </button>
              </div>
            </div>

            {/* Wallet Direct Payment Option */}
            {selectedMethod === 'WALLET' ? (
              <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Current Wallet Balance:</span>
                  <span className="font-score font-bold text-white">{formatBDT(currentUser.walletBalance)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Tournament Entry Fee:</span>
                  <span className="font-score font-bold text-[#FF6A00]">{formatBDT(tournament.entryFee)}</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Balance After Payment:</span>
                  <span className="font-score font-bold text-emerald-400">
                    {formatBDT(currentUser.walletBalance - tournament.entryFee)}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 italic">
                  Instant confirmation! Your slot will be locked immediately without manual admin review.
                </p>
              </div>
            ) : (
              <>
                {/* Send Money Instructions & Account Card */}
                {activeAccount && (
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">
                        {activeAccount.label}
                      </span>
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-semibold">
                        {activeAccount.accountType}
                      </span>
                    </div>

                    {/* Amount & Number Display */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/60 p-3.5 rounded-lg border border-zinc-800">
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 font-semibold block">Receiving Number</span>
                        <span className="font-score text-xl font-bold text-amber-400 tracking-wider">
                          {activeAccount.accountNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(activeAccount.accountNumber)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#FF6A00] hover:text-black text-xs font-semibold text-zinc-200 transition-colors flex items-center gap-1.5 border border-zinc-700"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copied' : 'Copy Number'}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-2.5 rounded border border-zinc-800/80">
                      💡 {activeAccount.instructions}
                    </p>
                  </div>
                )}

                {/* Form fields: Sender Number & TrxID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">
                      Your {selectedMethod} Number <span className="text-[#FF6A00]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 01712345678"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      required
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">
                      Transaction ID (TrxID) <span className="text-[#FF6A00]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BKH9988220"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      required
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#FF6A00] to-[#FF8800] hover:brightness-110 text-black shadow-[0_0_20px_rgba(255,106,0,0.4)] transition-all cut-corner flex items-center gap-2"
              >
                {isSubmitting ? (
                  'Processing...'
                ) : selectedMethod === 'WALLET' ? (
                  <>Pay ৳{tournament.entryFee} from Wallet</>
                ) : (
                  <>Submit Payment for Verification <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
