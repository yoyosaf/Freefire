import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './components/pages/HomePage';
import { TournamentsPage } from './components/pages/TournamentsPage';
import { TournamentDetailPage } from './components/pages/TournamentDetailPage';
import { MyTournamentsPage } from './components/pages/MyTournamentsPage';
import { WalletPage } from './components/pages/WalletPage';
import { LeaderboardPage } from './components/pages/LeaderboardPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { RulesPolicyPage } from './components/pages/RulesPolicyPage';
import { AuthModal } from './components/pages/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { WithdrawModal } from './components/WithdrawModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ReleaseRoomModal } from './components/ReleaseRoomModal';

// Admin imports
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminTournaments } from './components/admin/AdminTournaments';
import { AdminPayments } from './components/admin/AdminPayments';
import { AdminResults } from './components/admin/AdminResults';
import { AdminWithdrawals } from './components/admin/AdminWithdrawals';
import { AdminPaymentAccounts } from './components/admin/AdminPaymentAccounts';
import { AdminModerators } from './components/admin/AdminModerators';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminMedia } from './components/admin/AdminMedia';

import { storage } from './lib/storage';
import { User, Tournament, Registration } from './types';
import { Language } from './lib/translations';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => storage.getCurrentUser());
  const [tournaments, setTournaments] = useState<Tournament[]>(() => storage.getTournaments());
  const [registrations, setRegistrations] = useState<Registration[]>(() => storage.getRegistrations());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [adminSubPage, setAdminSubPage] = useState<string>('dashboard');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  // Modal triggers
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTournament, setPaymentTournament] = useState<Tournament | null>(null);
  const [paymentRegistration, setPaymentRegistration] = useState<Registration | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseTournament, setReleaseTournament] = useState<Tournament | null>(null);

  // Sync state helper
  const syncState = () => {
    setCurrentUser(storage.getCurrentUser());
    setTournaments(storage.getTournaments());
    setRegistrations(storage.getRegistrations());
  };

  // Synchronize route from browser URL
  const syncRouteFromLocation = () => {
    try {
      const path = window.location.pathname.replace(/\/$/, '') || '/';
      if (path === '/' || path === '') {
        setActiveTab('home');
      } else if (path.startsWith('/admin')) {
        setActiveTab('admin');
        const sub = path.replace('/admin', '').replace(/^\//, '');
        if (sub) {
          setAdminSubPage(sub);
        } else {
          setAdminSubPage('dashboard');
        }
      } else if (path.startsWith('/tournaments/')) {
        const id = path.replace('/tournaments/', '');
        const tour = storage.getTournamentById(id, currentUser);
        if (tour) {
          setSelectedTournament(tour);
          setActiveTab('tournament-detail');
        } else {
          setActiveTab('tournaments');
        }
      } else if (path === '/tournaments') {
        setActiveTab('tournaments');
      } else if (path === '/wallet') {
        setActiveTab('wallet');
      } else if (path === '/leaderboard') {
        setActiveTab('leaderboard');
      } else if (path === '/my-tournaments') {
        setActiveTab('my-tournaments');
      } else if (path === '/profile') {
        setActiveTab('profile');
      } else if (path === '/rules' || path === '/terms' || path === '/refund-policy' || path === '/contact') {
        setActiveTab('rules');
      } else {
        // Unknown route fallback to home
        setActiveTab('home');
      }
    } catch {
      setActiveTab('home');
    }
  };

  useEffect(() => {
    syncRouteFromLocation();
    const handlePopState = () => syncRouteFromLocation();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (tab: string, subPage?: string, tournamentId?: string) => {
    let targetPath = '/';
    if (tab === 'home') targetPath = '/';
    else if (tab === 'tournaments') targetPath = '/tournaments';
    else if (tab === 'tournament-detail' && tournamentId) targetPath = `/tournaments/${tournamentId}`;
    else if (tab === 'wallet') targetPath = '/wallet';
    else if (tab === 'leaderboard') targetPath = '/leaderboard';
    else if (tab === 'my-tournaments') targetPath = '/my-tournaments';
    else if (tab === 'profile') targetPath = '/profile';
    else if (tab === 'rules') targetPath = '/rules';
    else if (tab === 'admin') targetPath = subPage && subPage !== 'dashboard' ? `/admin/${subPage}` : '/admin';

    try {
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    } catch {}

    setActiveTab(tab);
    if (subPage) setAdminSubPage(subPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Periodic hold expiry check
  useEffect(() => {
    const timer = setInterval(() => {
      storage.expireUnpaidHolds();
      setRegistrations(storage.getRegistrations());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleSwitchUser = (userId: string) => {
    storage.setCurrentUser(userId);
    syncState();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data (tournaments, players, payments) back to initial factory state?')) {
      storage.resetToDefault();
      syncState();
      handleNavigate('home');
    }
  };

  const handleSelectTournament = (t: Tournament) => {
    const fresh = storage.getTournamentById(t.id, currentUser) || t;
    setSelectedTournament(fresh);
    handleNavigate('tournament-detail', undefined, t.id);
  };

  const handleJoinTournament = (t: Tournament) => {
    try {
      const reg = storage.joinTournament(t.id, currentUser);
      syncState();
      if (t.entryFee > 0 && reg.status === 'PENDING_PAYMENT') {
        setPaymentTournament(t);
        setPaymentRegistration(reg);
        setShowPaymentModal(true);
      } else {
        alert(`Successfully registered for "${t.title}"! You are confirmed in Slot #${reg.slotNumber}.`);
      }
    } catch (err: any) {
      // If already has pending registration, open payment modal directly
      const existing = registrations.find(
        (r) => r.tournamentId === t.id && r.userId === currentUser.id && r.status === 'PENDING_PAYMENT'
      );
      if (existing) {
        setPaymentTournament(t);
        setPaymentRegistration(existing);
        setShowPaymentModal(true);
      } else {
        alert(err?.message || 'Unable to join tournament.');
      }
    }
  };

  const handleOpenReleaseModal = (t: Tournament) => {
    setReleaseTournament(t);
    setShowReleaseModal(true);
  };

  const userNotifications = storage.getNotifications(currentUser.id);
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;
  const siteSettings = storage.getSiteSettings();

  return (
    <div className="min-h-screen bg-[#0B0B12] text-[#F5F5F7] flex flex-col font-sans selection:bg-[#FF6A00] selection:text-black">
      {/* Top Global Announcement Ticker */}
      {siteSettings.announcementBanner && (
        <div className="bg-gradient-to-r from-[#FF6A00] via-amber-500 to-[#FF6A00] text-black text-xs font-bold py-1.5 px-4 text-center tracking-wide overflow-hidden whitespace-nowrap text-ellipsis shadow-sm">
          {siteSettings.announcementBanner}
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onNavigate={(tab) => handleNavigate(tab)}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'bn' : 'en'))}
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenWithdraw={() => setShowWithdrawModal(true)}
        onSwitchUser={handleSwitchUser}
        onResetData={handleResetData}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {activeTab === 'admin' ? (
          <AdminLayout
            currentUser={currentUser}
            currentSubPage={adminSubPage}
            onNavigateSubPage={(sp) => handleNavigate('admin', sp)}
            onExitAdmin={() => handleNavigate('home')}
          >
            {adminSubPage === 'dashboard' && (
              <AdminDashboard
                currentUser={currentUser}
                onNavigateSubPage={(sp) => handleNavigate('admin', sp)}
                onOpenReleaseModal={handleOpenReleaseModal}
              />
            )}
            {adminSubPage === 'tournaments' && (
              <AdminTournaments
                currentUser={currentUser}
                onOpenReleaseModal={handleOpenReleaseModal}
              />
            )}
            {adminSubPage === 'payments' && <AdminPayments currentUser={currentUser} />}
            {adminSubPage === 'results' && <AdminResults currentUser={currentUser} />}
            {adminSubPage === 'withdrawals' && <AdminWithdrawals currentUser={currentUser} />}
            {adminSubPage === 'payment-accounts' && <AdminPaymentAccounts currentUser={currentUser} />}
            {adminSubPage === 'users' && <AdminUsers currentUser={currentUser} />}
            {adminSubPage === 'moderators' && <AdminModerators currentUser={currentUser} />}
            {adminSubPage === 'audit-logs' && <AdminAuditLogs currentUser={currentUser} />}
            {adminSubPage === 'media' && (
              <AdminMedia
                currentUser={currentUser}
                onPhotosUpdated={syncState}
              />
            )}
            {adminSubPage === 'settings' && <AdminSettings currentUser={currentUser} />}
          </AdminLayout>
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            {activeTab === 'home' && (
              <HomePage
                tournaments={tournaments}
                registrations={registrations}
                currentUser={currentUser}
                onNavigate={(tab) => handleNavigate(tab)}
                onSelectTournament={handleSelectTournament}
                onJoinTournament={handleJoinTournament}
                language={language}
              />
            )}

            {activeTab === 'tournaments' && (
              <TournamentsPage
                tournaments={tournaments}
                registrations={registrations}
                currentUser={currentUser}
                onSelectTournament={handleSelectTournament}
                onJoinTournament={handleJoinTournament}
                onNavigate={(tab) => handleNavigate(tab)}
                language={language}
              />
            )}

            {activeTab === 'tournament-detail' && selectedTournament && (
              <TournamentDetailPage
                tournament={storage.getTournamentById(selectedTournament.id, currentUser) || selectedTournament}
                registration={registrations.find(
                  (r) => r.tournamentId === selectedTournament.id && r.userId === currentUser.id
                )}
                currentUser={currentUser}
                onBack={() => handleNavigate('tournaments')}
                onJoin={handleJoinTournament}
              />
            )}

            {activeTab === 'my-tournaments' && (
              <MyTournamentsPage
                currentUser={currentUser}
                registrations={registrations}
                tournaments={tournaments}
                onSelectTournament={handleSelectTournament}
                onOpenPaymentModal={(t, reg) => {
                  setPaymentTournament(t);
                  setPaymentRegistration(reg);
                  setShowPaymentModal(true);
                }}
                onBrowseTournaments={() => handleNavigate('tournaments')}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletPage
                currentUser={currentUser}
                onOpenWithdraw={() => setShowWithdrawModal(true)}
              />
            )}

            {activeTab === 'leaderboard' && <LeaderboardPage tournaments={tournaments} />}

            {activeTab === 'profile' && (
              <ProfilePage
                currentUser={currentUser}
                onUpdateUser={(updated) => {
                  setCurrentUser(updated);
                  syncState();
                }}
              />
            )}

            {activeTab === 'rules' && <RulesPolicyPage />}
          </main>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {activeTab !== 'admin' && (
        <BottomNav
          activeTab={activeTab}
          onNavigate={(tab) => handleNavigate(tab)}
          language={language}
        />
      )}

      {/* Modals */}
      {showPaymentModal && paymentTournament && paymentRegistration && (
        <PaymentModal
          tournament={paymentTournament}
          registration={paymentRegistration}
          currentUser={currentUser}
          onClose={() => {
            setShowPaymentModal(false);
            syncState();
          }}
          onSuccess={() => {
            setShowPaymentModal(false);
            syncState();
            handleNavigate('my-tournaments');
          }}
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal
          user={currentUser}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={() => {
            setShowWithdrawModal(false);
            syncState();
          }}
        />
      )}

      {showNotificationsModal && (
        <NotificationsModal
          notifications={userNotifications}
          onClose={() => setShowNotificationsModal(false)}
          onMarkRead={(id) => {
            storage.markNotificationRead(id);
            syncState();
          }}
          onMarkAllRead={() => {
            storage.markAllNotificationsRead(currentUser.id);
            syncState();
          }}
          onNavigate={(link) => {
            if (link.startsWith('/tournaments/')) {
              const tourId = link.replace('/tournaments/', '');
              const t = tournaments.find((item) => item.id === tourId);
              if (t) handleSelectTournament(t);
            } else if (link === '/wallet') {
              handleNavigate('wallet');
            }
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(u) => {
            setCurrentUser(u);
            syncState();
          }}
        />
      )}

      {showReleaseModal && releaseTournament && (
        <ReleaseRoomModal
          tournament={releaseTournament}
          currentUser={currentUser}
          onClose={() => setShowReleaseModal(false)}
          onSuccess={(updated) => {
            syncState();
            if (selectedTournament?.id === updated.id) {
              setSelectedTournament(updated);
            }
          }}
        />
      )}
    </div>
  );
}
