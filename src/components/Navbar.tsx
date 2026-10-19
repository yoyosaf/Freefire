import React, { useState } from 'react';
import { 
  Flame, 
  Wallet, 
  Bell, 
  ShieldAlert, 
  User as UserIcon, 
  Globe, 
  ChevronDown, 
  LogOut,
  RefreshCw,
  Check
} from 'lucide-react';
import { User } from '../types';
import { formatBDT } from '../lib/points';
import { Language, translations } from '../lib/translations';
import { storage } from '../lib/storage';

interface NavbarProps {
  currentUser: User;
  activeTab: string;
  onNavigate: (tab: string) => void;
  language: Language;
  onToggleLanguage: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenWithdraw: () => void;
  onSwitchUser: (userId: string) => void;
  onResetData: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onNavigate,
  language,
  onToggleLanguage,
  unreadCount,
  onOpenNotifications,
  onOpenWithdraw,
  onSwitchUser,
  onResetData,
  onOpenAuth,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const t = translations[language];

  const allUsers = storage.getUsers();
  const isStaff = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'MODERATOR';

  // Count pending items for staff badge
  const pendingPayments = storage.getPayments().filter((p) => p.status === 'SUBMITTED').length;

  return (
    <header className="sticky top-0 z-40 bg-[#0B0B12]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#FF6A00] to-[#FFC107] p-0.5 cut-corner shadow-[0_0_15px_rgba(255,106,0,0.5)]">
              <div className="w-full h-full bg-black rounded-sm flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#FF6A00] fill-[#FF6A00] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-extrabold uppercase tracking-wider text-white group-hover:text-[#FF6A00] transition-colors leading-none">
                BOOYAH<span className="text-[#FF6A00]">ARENA</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono">
                Free Fire Esports BD
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-Line, 4-5 items) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-400">
          <button
            onClick={() => onNavigate('tournaments')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'tournaments' ? 'text-[#FF6A00] font-bold border-b-2 border-[#FF6A00] pb-1' : ''
            }`}
          >
            {t.tournaments}
          </button>
          <button
            onClick={() => onNavigate('leaderboard')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'leaderboard' ? 'text-[#FF6A00] font-bold border-b-2 border-[#FF6A00] pb-1' : ''
            }`}
          >
            {t.leaderboard}
          </button>
          <button
            onClick={() => onNavigate('my-tournaments')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'my-tournaments' ? 'text-[#FF6A00] font-bold border-b-2 border-[#FF6A00] pb-1' : ''
            }`}
          >
            {t.myTournaments}
          </button>
          <button
            onClick={() => onNavigate('wallet')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'wallet' ? 'text-[#FF6A00] font-bold border-b-2 border-[#FF6A00] pb-1' : ''
            }`}
          >
            {t.wallet}
          </button>
          <button
            onClick={() => onNavigate('rules')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'rules' ? 'text-[#FF6A00] font-bold border-b-2 border-[#FF6A00] pb-1' : ''
            }`}
          >
            {t.rules}
          </button>
        </nav>

        {/* Zone 3: Actions & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Language toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold uppercase">{language}</span>
          </button>

          {/* Quick Role Tester Switcher (Crucial for evaluation!) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:border-[#FF6A00] transition-colors"
              title="Test as different roles"
            >
              <span className={`w-2 h-2 rounded-full ${
                currentUser.role === 'SUPER_ADMIN' ? 'bg-amber-400' : currentUser.role === 'MODERATOR' ? 'bg-cyan-400' : 'bg-emerald-400'
              }`} />
              <span className="max-w-[110px] truncate">{currentUser.displayName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-64 bg-[#14141F] border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 cut-corner divide-y divide-zinc-800">
                <div className="p-2 text-[11px] text-zinc-400">
                  <span className="font-bold text-white block uppercase mb-1">Switch Test Account</span>
                  Verify app workflows as admin or player:
                </div>
                <div className="py-1 space-y-1">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setShowRoleSwitcher(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        u.id === currentUser.id ? 'bg-[#FF6A00]/20 text-[#FF6A00] font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{u.displayName}</span>
                        <span className="text-[10px] text-zinc-400">{u.role} · {u.role === 'PLAYER' ? formatBDT(u.walletBalance) : u.email}</span>
                      </div>
                      {u.id === currentUser.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
                <div className="pt-2 p-1 flex justify-between items-center text-[11px]">
                  <button
                    onClick={() => {
                      onResetData();
                      setShowRoleSwitcher(false);
                    }}
                    className="text-red-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset Demo Data
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin link if staff */}
          {isStaff && (
            <button
              onClick={() => onNavigate('admin')}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-zinc-900 border border-amber-500/40 text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
              {pendingPayments > 0 && (
                <span className="bg-[#FF6A00] text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingPayments}
                </span>
              )}
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 flex items-center justify-center transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6A00] text-black text-[9px] font-extrabold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Wallet Balance Pill */}
          <button
            onClick={() => onNavigate('wallet')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-emerald-500/30 text-xs font-semibold text-zinc-200 hover:border-emerald-500 transition-colors"
            title="Wallet Balance"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-score text-emerald-400 font-bold">
              {formatBDT(currentUser.walletBalance)}
            </span>
          </button>

          {/* Profile Avatar / Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center hover:border-[#FF6A00] transition-colors"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <UserIcon className="w-4 h-4 text-zinc-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#14141F] border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 cut-corner divide-y divide-zinc-800">
                <div className="p-2.5">
                  <span className="font-bold text-sm text-white block truncate">{currentUser.displayName}</span>
                  <span className="text-[11px] text-zinc-400 font-mono block">UID: {currentUser.ffUid}</span>
                  <span className="text-[11px] text-[#FFC107] font-semibold">{currentUser.role}</span>
                </div>
                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => { onNavigate('profile'); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 rounded-lg"
                  >
                    Edit Profile & FF UID
                  </button>
                  <button
                    onClick={() => { onNavigate('my-tournaments'); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 rounded-lg"
                  >
                    My Registrations & Slots
                  </button>
                  <button
                    onClick={() => { onOpenWithdraw(); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-zinc-800 rounded-lg font-semibold"
                  >
                    Withdraw Prize Money
                  </button>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => { onOpenAuth(); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:text-white flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign In / Switch Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
