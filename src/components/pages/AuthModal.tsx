import React, { useState } from 'react';
import { X, Flame, ShieldAlert, UserPlus, LogIn, Check } from 'lucide-react';
import { User } from '../../types';
import { storage } from '../../lib/storage';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [ffUid, setFfUid] = useState('');
  const [ffIgn, setFfIgn] = useState('');
  const [error, setError] = useState<string | null>(null);

  const users = storage.getUsers();

  const handleSelectQuickUser = (user: User) => {
    storage.setCurrentUser(user.id);
    onLoginSuccess(user);
    onClose();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName || !email || !phone || !ffUid || !ffIgn) {
      setError('All fields including Free Fire UID and IGN are mandatory.');
      return;
    }

    try {
      const newUser = storage.registerUser(displayName, email, phone, ffUid, ffIgn);
      onLoginSuccess(newUser);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      setError('No account found with this email. Use quick select below or sign up.');
      return;
    }

    storage.setCurrentUser(user.id);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#14141F] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative cut-corner space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF6A00]" />
            <h2 className="font-display text-lg font-bold uppercase text-white tracking-wide">
              {mode === 'LOGIN' ? 'Player Authentication' : 'Create Tournament Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        {/* 1-Click Fast Persona Switcher */}
        <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-[#FF6A00] block tracking-wide">
            ⚡ Quick 1-Click Persona Login
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectQuickUser(u)}
                className="p-2 rounded-lg bg-zinc-800/80 hover:bg-[#FF6A00]/20 hover:border-[#FF6A00]/40 border border-zinc-700/60 text-left transition-colors"
              >
                <span className="font-bold text-white block truncate">{u.displayName}</span>
                <span className="text-[10px] text-zinc-400">{u.role}</span>
              </button>
            ))}
          </div>
        </div>

        {mode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Registered Email
              </label>
              <input
                type="email"
                placeholder="e.g. tanvir@ff.bd or admin@booyah.gg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('SIGNUP')}
                className="text-xs text-[#FF6A00] hover:underline"
              >
                Need an account? Register here
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#FF6A00] hover:bg-[#FF8800] text-black shadow-lg"
              >
                Log In
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">BD Mobile Number</label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Free Fire UID</label>
                <input
                  type="text"
                  placeholder="249018471"
                  value={ffUid}
                  onChange={(e) => setFfUid(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">In-Game Name (IGN)</label>
              <input
                type="text"
                placeholder="亗・S N I P E R・亗"
                value={ffIgn}
                onChange={(e) => setFfIgn(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Already registered? Sign in
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#FF6A00] hover:bg-[#FF8800] text-black shadow-lg"
              >
                Create Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
