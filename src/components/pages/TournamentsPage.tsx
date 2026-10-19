import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  Filter, 
  Flame, 
  ChevronDown, 
  LayoutList, 
  LayoutGrid, 
  Users, 
  Plus, 
  UserPlus, 
  ShieldCheck, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Tournament, Registration, User } from '../../types';
import { TournamentCard } from '../TournamentCard';
import { MatchRowItem } from '../MatchRowItem';
import { GameHubHero } from '../GameHubHero';
import { Language, translations } from '../../lib/translations';

interface TournamentsPageProps {
  tournaments: Tournament[];
  registrations: Registration[];
  currentUser: User;
  onSelectTournament: (t: Tournament) => void;
  onJoinTournament: (t: Tournament) => void;
  onNavigate: (tab: string) => void;
  language: Language;
}

export const TournamentsPage: React.FC<TournamentsPageProps> = ({
  tournaments,
  registrations,
  currentUser,
  onSelectTournament,
  onJoinTournament,
  onNavigate,
  language,
}) => {
  const [activeNavTab, setActiveNavTab] = useState<string>('tournaments');
  const [scheduleFilter, setScheduleFilter] = useState<'UPCOMING' | 'LIVE' | 'TODAY' | 'COMPLETED' | 'ALL'>('UPCOMING');
  const [formatFilter, setFormatFilter] = useState<string>('ALL'); // 1v1, 2v2, 3v3, 4v4, 5v5, ALL
  const [filterMap, setFilterMap] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST'); // Defaults to LIST matching screenshot!

  const t = translations[language];

  // Map format buttons: 1v1 -> SOLO, 2v2 -> DUO, 4v4 -> SQUAD
  const formatMap: Record<string, string> = {
    '1v1': 'SOLO',
    '2v2': 'DUO',
    '4v4': 'SQUAD',
  };

  const filtered = tournaments.filter((tournament) => {
    // Schedule filter
    if (scheduleFilter === 'UPCOMING' && (tournament.status === 'COMPLETED' || tournament.status === 'CANCELLED')) return false;
    if (scheduleFilter === 'LIVE' && tournament.status !== 'LIVE') return false;
    if (scheduleFilter === 'COMPLETED' && tournament.status !== 'COMPLETED') return false;
    if (scheduleFilter === 'TODAY') {
      const today = new Date().toDateString();
      if (new Date(tournament.startsAt).toDateString() !== today) return false;
    }

    // Format filter (1v1, 2v2, 3v3, 4v4, 5v5)
    if (formatFilter !== 'ALL') {
      const targetMode = formatMap[formatFilter];
      if (targetMode && tournament.mode !== targetMode) return false;
      if (!targetMode && formatFilter === '3v3') return false; // FF doesn't have 3v3 standard
      if (!targetMode && formatFilter === '5v5') return false;
    }

    // Map filter
    if (filterMap !== 'ALL' && tournament.map !== filterMap) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tournament.title.toLowerCase().includes(q) ||
        tournament.map.toLowerCase().includes(q) ||
        tournament.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Big Photo Hero with Garena Free Fire Title, Create Button and Add Account CTA */}
      <GameHubHero
        currentUser={currentUser}
        activeNavTab={activeNavTab}
        onSelectNavTab={(tab) => {
          if (tab === 'ranking') {
            onNavigate('leaderboard');
          } else if (tab === 'spaces') {
            onNavigate('wallet');
          } else {
            setActiveNavTab(tab);
          }
        }}
        onCreateMatch={() => onNavigate('admin')}
        onAddAccount={() => onNavigate('profile')}
      />

      {/* Main Tab: Tournaments (Matches List) */}
      {activeNavTab === 'tournaments' && (
        <div className="space-y-5">
          {/* Exact Filter Bar from Screenshot */}
          <div className="bg-[#0e121a] border border-zinc-800/80 p-3 sm:p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
            {/* Left: Schedule Dropdown (Upcoming ⌵) */}
            <div className="relative min-w-[150px]">
              <select
                value={scheduleFilter}
                onChange={(e) => setScheduleFilter(e.target.value as any)}
                className="w-full appearance-none bg-[#151924] hover:bg-[#1a202e] border border-zinc-700/80 text-white rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer pr-8"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="LIVE">Live Now</option>
                <option value="TODAY">Today's Matches</option>
                <option value="COMPLETED">Finished</option>
                <option value="ALL">All Matches</option>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Middle: Format Pills (1v1, 2v2, 3v3, 4v4, 5v5) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 justify-start md:justify-center">
              <button
                onClick={() => setFormatFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  formatFilter === 'ALL'
                    ? 'bg-zinc-800 text-white border-zinc-600 font-bold'
                    : 'bg-[#151924] text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                All
              </button>
              {['1v1', '2v2', '3v3', '4v4', '5v5'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormatFilter(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    formatFilter === fmt
                      ? 'bg-zinc-800 text-cyan-400 border-cyan-500/50 font-bold shadow-[0_0_10px_rgba(0,197,255,0.2)]'
                      : 'bg-[#151924] text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Right: Filters Toggle & View Switcher */}
            <div className="flex items-center gap-2 justify-end">
              {/* Search input */}
              <div className="relative hidden lg:block w-48">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search match..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#151924] border border-zinc-700/80 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  showFilterDrawer || filterMap !== 'ALL'
                    ? 'bg-zinc-800 text-cyan-400 border-cyan-500/60'
                    : 'bg-[#151924] hover:bg-[#1a202e] text-white border-zinc-700/80'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <span>Filters</span>
                {filterMap !== 'ALL' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>

              {/* View toggle (List vs Grid) */}
              <div className="bg-[#151924] border border-zinc-700/80 rounded-lg p-0.5 flex items-center">
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'LIST' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="List View"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('GRID')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'GRID' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Filter Options (Map, Search on mobile) */}
          {showFilterDrawer && (
            <div className="bg-[#11141c] border border-zinc-800 p-4 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px]">Map:</span>
                  <select
                    value={filterMap}
                    onChange={(e) => setFilterMap(e.target.value)}
                    className="bg-[#151924] border border-zinc-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="ALL">All Maps</option>
                    <option value="BERMUDA">Bermuda</option>
                    <option value="KALAHARI">Kalahari</option>
                    <option value="PURGATORY">Purgatory</option>
                    <option value="ALPINE">Alpine</option>
                    <option value="NEXTERRA">Nexterra</option>
                  </select>
                </div>

                <div className="lg:hidden flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search match..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#151924] border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                {(filterMap !== 'ALL' || searchQuery || formatFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setFilterMap('ALL');
                      setSearchQuery('');
                      setFormatFilter('ALL');
                    }}
                    className="text-xs text-rose-400 hover:underline font-semibold"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* All Matches Section Header */}
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-semibold uppercase tracking-wider">
              All Matches ({filtered.length})
            </span>
            <span>Live custom room allocations verified</span>
          </div>

          {/* Match Display: List View (Exact Screenshot Style) or Grid View */}
          {filtered.length === 0 ? (
            <div className="bg-[#0e121a] border border-zinc-800 rounded-xl p-12 text-center text-zinc-500 text-xs">
              No matches found matching the selected schedule or format filters.
            </div>
          ) : viewMode === 'LIST' ? (
            <div className="space-y-3">
              {filtered.map((tournament) => {
                const userReg = registrations.find(
                  (r) => r.tournamentId === tournament.id && r.userId === currentUser.id
                );
                return (
                  <MatchRowItem
                    key={tournament.id}
                    tournament={tournament}
                    registration={userReg}
                    onSelect={onSelectTournament}
                    onJoin={onJoinTournament}
                  />
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((tournament) => {
                const userReg = registrations.find(
                  (r) => r.tournamentId === tournament.id && r.userId === currentUser.id
                );
                return (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    registration={userReg}
                    onSelect={onSelectTournament}
                    onJoin={onJoinTournament}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab: Overview */}
      {activeNavTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#0e121a] border border-zinc-800 rounded-xl p-6 space-y-4">
              <h2 className="font-display text-xl font-bold uppercase text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#FF6A00]" />
                About Garena Free Fire BOOYAH Arena
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                BOOYAH Arena is the official community hub for competitive Free Fire players across Bangladesh.
                We host automated daily tournaments for Solo (1v1), Duo (2v2), and Squad (4v4) formats with manual bKash, Nagad, and Rocket verification.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <div className="bg-[#151924] p-3 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Total Active Matches</span>
                  <span className="font-score text-xl font-bold text-white">{tournaments.length}</span>
                </div>
                <div className="bg-[#151924] p-3 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Room Release Window</span>
                  <span className="font-score text-xl font-bold text-cyan-400">10-15m</span>
                </div>
                <div className="bg-[#151924] p-3 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Payout Time</span>
                  <span className="font-score text-xl font-bold text-emerald-400">Instant</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#0e121a] border border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-display text-sm font-bold uppercase text-white">
                Player Hub
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('my-tournaments')}
                  className="w-full text-left p-3 rounded-lg bg-[#151924] hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-white flex items-center justify-between transition-colors"
                >
                  <span>My Active Matches</span>
                  <span className="bg-[#00c5ff]/20 text-[#00c5ff] px-2 py-0.5 rounded text-[10px] font-bold">
                    {registrations.filter((r) => r.userId === currentUser.id).length}
                  </span>
                </button>
                <button
                  onClick={() => onNavigate('wallet')}
                  className="w-full text-left p-3 rounded-lg bg-[#151924] hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-white flex items-center justify-between transition-colors"
                >
                  <span>Prize Wallet</span>
                  <span className="text-emerald-400 font-score font-bold">
                    ৳{currentUser.walletBalance}
                  </span>
                </button>
                <button
                  onClick={() => onNavigate('leaderboard')}
                  className="w-full text-left p-3 rounded-lg bg-[#151924] hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-white flex items-center justify-between transition-colors"
                >
                  <span>Leaderboard Podium</span>
                  <Trophy className="w-4 h-4 text-[#FFC107]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab: Team Finder */}
      {activeNavTab === 'team-finder' && (
        <div className="bg-[#0e121a] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div>
              <h2 className="font-display text-xl font-bold uppercase text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Free Fire Squad & Duo Team Finder
              </h2>
              <p className="text-xs text-zinc-400">
                Connect with verified high-KD players in Bangladesh to form competitive rosters
              </p>
            </div>
            <button
              onClick={() => alert('LFG recruitment post submitted! Players can now invite your UID.')}
              className="px-4 py-2 rounded-lg bg-[#00c5ff] hover:bg-[#00b0e6] text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Post Squad Request
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[#151924] border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Delta Squad [Recruiting]</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-bold">4v4 Squad</span>
              </div>
              <p className="text-xs text-zinc-400">
                Looking for an aggressive rusher with KD &gt; 3.5 for Night Squad Showdown.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800">
                <span>Captain: Siam Predator</span>
                <span className="text-cyan-400 font-mono">UID: 819204910</span>
              </div>
            </div>

            <div className="bg-[#151924] border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Duo Partner Wanted</span>
                <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded font-bold">2v2 Duo</span>
              </div>
              <p className="text-xs text-zinc-400">
                Sniper specialist looking for a support player in Kalahari Desert Rush. Mic required.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800">
                <span>Player: Tanvir SniperGod</span>
                <span className="text-amber-400 font-mono">UID: 249018471</span>
              </div>
            </div>

            <div className="bg-[#151924] border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Apex Kings</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold">BR Ranked</span>
              </div>
              <p className="text-xs text-zinc-400">
                Looking for 2 players to complete tournament roster for weekly ৳10,000 championship.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800">
                <span>Captain: Rafi Headshot</span>
                <span className="text-emerald-400 font-mono">UID: 918204128</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
