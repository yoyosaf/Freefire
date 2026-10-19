import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  CreditCard, 
  Users, 
  Award, 
  ArrowDownToLine, 
  Settings, 
  ShieldCheck, 
  ClipboardList, 
  Smartphone,
  ChevronLeft,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';
import { User } from '../../types';
import { hasPermission } from '../../lib/permissions';
import { storage } from '../../lib/storage';

interface AdminLayoutProps {
  currentUser: User;
  currentSubPage: string;
  onNavigateSubPage: (subPage: string) => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  currentSubPage,
  onNavigateSubPage,
  onExitAdmin,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingPaymentsCount = storage.getPayments().filter((p) => p.status === 'SUBMITTED').length;
  const pendingWithdrawalsCount = storage.getWithdrawals().filter((w) => w.status === 'REQUESTED').length;

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Navigation items with permissions from Section 19.9
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowed: true, // Any staff
    },
    {
      id: 'tournaments',
      label: 'Tournaments',
      icon: Trophy,
      allowed: hasPermission(currentUser, 'tournaments.view'),
    },
    {
      id: 'payments',
      label: 'Payments Queue',
      icon: CreditCard,
      badge: pendingPaymentsCount,
      allowed: hasPermission(currentUser, 'payments.view'),
    },
    {
      id: 'results',
      label: 'Enter Results',
      icon: Award,
      allowed: hasPermission(currentUser, 'results.enter'),
    },
    {
      id: 'withdrawals',
      label: 'Payout Queue',
      icon: ArrowDownToLine,
      badge: pendingWithdrawalsCount,
      allowed: hasPermission(currentUser, 'withdrawals.view'),
    },
    {
      id: 'payment-accounts',
      label: 'Payment Numbers',
      icon: Smartphone,
      allowed: hasPermission(currentUser, 'settings.payment_accounts'),
    },
    {
      id: 'users',
      label: 'Player Directory',
      icon: Users,
      allowed: hasPermission(currentUser, 'users.view'),
    },
    {
      id: 'moderators',
      label: 'Staff & Roles',
      icon: ShieldCheck,
      allowed: isSuperAdmin, // SUPER_ADMIN only (Spec 19.7)
    },
    {
      id: 'audit-logs',
      label: 'Audit Trail',
      icon: ClipboardList,
      allowed: hasPermission(currentUser, 'audit.view'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      allowed: hasPermission(currentUser, 'settings.site'),
    },
  ];

  // Check if current requested page is allowed
  const currentNav = navItems.find((n) => n.id === currentSubPage);
  const isCurrentPageForbidden = currentNav && !currentNav.allowed;

  return (
    <div className="min-h-screen bg-[#0B0B12] text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#14141F] border-r border-zinc-800/80 shrink-0">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base uppercase text-white tracking-wider">
              Staff Portal
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
              isSuperAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}>
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* User preview */}
        <div className="p-3.5 mx-3 my-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-[#FF6A00]">
            {currentUser.displayName.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">{currentUser.displayName}</span>
            <span className="text-[10px] text-zinc-400 truncate">{currentUser.email}</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => item.allowed)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentSubPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateSubPage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#FF6A00] text-black font-bold shadow-[0_0_12px_rgba(255,106,0,0.4)]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-black text-[#FF6A00]' : 'bg-[#FF6A00] text-black'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* Bottom Back Button */}
        <div className="p-3 border-t border-zinc-800">
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors border border-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" /> Exit to Public Arena
          </button>
        </div>
      </aside>

      {/* Mobile Header for Admin */}
      <div className="md:hidden bg-[#14141F] border-b border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <span className="font-display font-bold uppercase text-sm text-white">
            Staff Portal: {currentNav?.label || 'Dashboard'}
          </span>
        </div>
        <button
          onClick={onExitAdmin}
          className="text-xs text-[#FF6A00] font-bold hover:underline"
        >
          Exit Admin
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#14141F] border-b border-zinc-800 p-3 space-y-1">
          {navItems
            .filter((item) => item.allowed)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentSubPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigateSubPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium ${
                    isActive ? 'bg-[#FF6A00] text-black font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-[#FF6A00] text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {isCurrentPageForbidden ? (
          <div className="p-8 bg-red-950/20 border border-red-800/40 rounded-xl text-center space-y-3 cut-corner">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="text-lg font-display font-bold uppercase text-white">403 Forbidden</h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Your staff account does not possess the requisite permission to access this section. Please contact the Super Admin to request an authorization upgrade.
            </p>
            <button
              onClick={() => onNavigateSubPage('dashboard')}
              className="px-4 py-2 bg-zinc-800 text-xs text-white rounded-lg hover:bg-zinc-700"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};
