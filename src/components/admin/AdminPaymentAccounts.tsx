import React, { useState } from 'react';
import { 
  Smartphone, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Power, 
  Eye, 
  ShieldAlert,
  Copy
} from 'lucide-react';
import { User, PaymentAccount, AccountType } from '../../types';
import { storage } from '../../lib/storage';
import { hasPermission } from '../../lib/permissions';

interface AdminPaymentAccountsProps {
  currentUser: User;
}

export const AdminPaymentAccounts: React.FC<AdminPaymentAccountsProps> = ({ currentUser }) => {
  const [accounts, setAccounts] = useState<PaymentAccount[]>(() => storage.getPaymentAccounts(false));
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [method, setMethod] = useState<'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY'>('BKASH');
  const [label, setLabel] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('PERSONAL');
  const [instructions, setInstructions] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [confirmPassword, setConfirmPassword] = useState('');

  const canEditAccounts = hasPermission(currentUser, 'settings.payment_accounts');

  // Bangladesh Mobile Number Validator: ^01[3-9][0-9]{8}$
  const isValidBDNumber = (num: string) => {
    return /^01[3-9][0-9]{8}$/.test(num.trim()) || (num.startsWith('01') && num.length >= 11 && num.length <= 12);
  };

  const handleToggleActive = (account: PaymentAccount) => {
    if (!canEditAccounts) return;
    try {
      const updated = storage.updatePaymentAccount(account.id, { isActive: !account.isActive }, currentUser.id);
      setAccounts(storage.getPaymentAccounts(false));
      setSuccess(`Account ${updated.label} is now ${updated.isActive ? 'Active' : 'Disabled'}.`);
    } catch (err: any) {
      setError(err?.message || 'Error updating status');
    }
  };

  const handleDelete = (id: string) => {
    if (!canEditAccounts) return;
    if (!window.confirm('Are you sure you want to delete this payment account?')) return;
    try {
      storage.deletePaymentAccount(id, currentUser.id);
      setAccounts(storage.getPaymentAccounts(false));
      setSuccess('Payment account deleted.');
    } catch (err: any) {
      setError(err?.message || 'Error deleting account');
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setLabel('');
    setAccountNumber('');
    setAccountName('');
    setInstructions('');
    setDisplayOrder(accounts.length + 1);
    setConfirmPassword('');
    setError(null);
  };

  const startEdit = (acc: PaymentAccount) => {
    setEditingId(acc.id);
    setMethod(acc.method);
    setLabel(acc.label);
    setAccountNumber(acc.accountNumber);
    setAccountName(acc.accountName || '');
    setAccountType(acc.accountType);
    setInstructions(acc.instructions);
    setDisplayOrder(acc.displayOrder);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isValidBDNumber(accountNumber)) {
      setError('Invalid Bangladesh phone number. Format must be 01XXXXXXXXX (11 digits).');
      return;
    }

    if (!label.trim()) {
      setError('Please provide a display label for players.');
      return;
    }

    // Spec 19.8 / 19.12: Sensitive action asks for admin password verification
    if (!confirmPassword) {
      setError('Please confirm your administrative authorization password.');
      return;
    }

    try {
      if (editingId) {
        storage.updatePaymentAccount(
          editingId,
          {
            method,
            label,
            accountNumber: accountNumber.trim(),
            accountName: accountName.trim(),
            accountType,
            instructions,
            displayOrder: Number(displayOrder),
          },
          currentUser.id
        );
        setSuccess('Payment receiving account updated successfully!');
      } else {
        storage.addPaymentAccount(
          {
            method,
            label,
            accountNumber: accountNumber.trim(),
            accountName: accountName.trim(),
            accountType,
            instructions,
            displayOrder: Number(displayOrder),
            isActive: true,
            updatedBy: currentUser.id,
          },
          currentUser.id
        );
        setSuccess('New payment account added successfully!');
      }

      setAccounts(storage.getPaymentAccounts(false));
      resetForm();
    } catch (err: any) {
      setError(err?.message || 'Error saving payment account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Editable Payment Receiving Numbers
          </h1>
          <p className="text-xs text-zinc-400">
            Dynamically manage receiving numbers shown to players during checkout (bKash, Nagad, Rocket, Upay).
          </p>
        </div>
        {canEditAccounts && !isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#FF8800] text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(255,106,0,0.3)] cut-corner flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> + Add Receiving Number
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300">
          {success}
        </div>
      )}

      {/* Add / Edit Form Modal or Inline Box */}
      {isAdding && (
        <div className="bg-[#14141F] border border-amber-500/40 rounded-xl p-5 cut-corner shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#FF6A00]" />
              {editingId ? 'Edit Receiving Account' : 'Add New Receiving Account'}
            </h3>
            <button
              onClick={resetForm}
              className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Provider Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                >
                  <option value="BKASH">bKash</option>
                  <option value="NAGAD">Nagad</option>
                  <option value="ROCKET">Rocket</option>
                  <option value="UPAY">Upay</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Display Label (e.g. bKash Personal 01)
                </label>
                <input
                  type="text"
                  placeholder="bKash Personal"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Account Type
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                >
                  <option value="PERSONAL">PERSONAL</option>
                  <option value="AGENT">AGENT</option>
                  <option value="MERCHANT">MERCHANT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  11-Digit BD Number (01XXXXXXXXX) <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="01711998822"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Account Holder Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="BOOYAH Arena Admin"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Player Instructions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Use Send Money, not Cash Out. Put your Free Fire UID in reference."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            {/* Live Preview Box */}
            <div className="p-3 bg-black/60 border border-zinc-800 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Live Player Preview:</span>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-white font-bold">{label || 'Sample Label'} ({accountType})</span>
                  <p className="text-zinc-400 text-[11px] mt-0.5">{instructions || 'Instructions will appear here.'}</p>
                </div>
                <span className="font-score text-amber-400 font-bold text-sm bg-zinc-900 px-2 py-1 rounded border border-zinc-700">
                  {accountNumber || '01XXXXXXXXX'}
                </span>
              </div>
            </div>

            {/* Security Confirmation */}
            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex-1">
                <label className="text-[11px] text-amber-200 block font-semibold mb-1">
                  Security Guard: Confirm Admin Password / Auth Code
                </label>
                <input
                  type="password"
                  placeholder="Enter staff authorization key"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#FF6A00] hover:bg-[#FF8800] text-black shadow-lg"
              >
                {editingId ? 'Save Changes' : 'Add Number'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Numbers */}
      <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
        <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
            Configured Numbers ({accounts.length})
          </h3>
          <span className="text-xs text-zinc-400">
            Active numbers rotate during player checkout
          </span>
        </div>

        <div className="divide-y divide-zinc-800/70">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                acc.isActive ? 'hover:bg-zinc-900/40' : 'bg-zinc-950/60 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    acc.method === 'BKASH' ? 'bg-[#E2136E]/20 text-[#E2136E] border border-[#E2136E]/40' :
                    acc.method === 'NAGAD' ? 'bg-[#F7941D]/20 text-[#F7941D] border border-[#F7941D]/40' :
                    acc.method === 'ROCKET' ? 'bg-[#8C3494]/20 text-[#8C3494] border border-[#8C3494]/40' :
                    'bg-[#005BAC]/20 text-cyan-400 border border-cyan-400/40'
                  }`}>
                    {acc.method}
                  </span>
                  <span className="font-bold text-white text-sm">{acc.label}</span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-semibold">
                    {acc.accountType}
                  </span>
                  {!acc.isActive && (
                    <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded font-semibold border border-red-800">
                      DISABLED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-score text-base font-bold text-amber-400">
                    {acc.accountNumber}
                  </span>
                  {acc.accountName && (
                    <span className="text-xs text-zinc-400">({acc.accountName})</span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 max-w-xl">
                  {acc.instructions}
                </p>
              </div>

              {canEditAccounts && (
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleActive(acc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      acc.isActive
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                    title={acc.isActive ? 'Disable number' : 'Activate number'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {acc.isActive ? 'Active' : 'Enable'}
                  </button>

                  <button
                    onClick={() => startEdit(acc)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="Edit account details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    title="Delete account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
