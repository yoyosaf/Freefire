import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Trophy, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  ArrowDown,
  Users, 
  Clock, 
  Smartphone, 
  ChevronRight, 
  Award,
  LayoutList,
  LayoutGrid,
  Plus,
  UserPlus,
  MoreHorizontal,
  Crosshair,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Tournament, Registration, User } from '../../types';
import { TournamentCard } from '../TournamentCard';
import { MatchRowItem } from '../MatchRowItem';
import { CountdownTimer } from '../CountdownTimer';
import { formatBDT, formatBangladeshTime } from '../../lib/points';
import { Language, translations } from '../../lib/translations';
import { storage } from '../../lib/storage';

// Bundled static image imports to avoid any 404 or CDN issues
import heroBooyahEpic from '../../assets/images/hero_booyah_epic_1792421958285.jpg';
import ffGamePoster from '../../assets/images/ff_game_poster_1792421958800.jpg';
import bermudaBanner from '../../assets/images/bermuda_tournament_banner_1792421959844.jpg';
import clashSquadBanner from '../../assets/images/clash_squad_arena_1792421959604.jpg';
import purgatoryBanner from '../../assets/images/purgatory_rush_banner_1792421959821.jpg';

interface HomePageProps {
  tournaments: Tournament[];
  registrations: Registration[];
  currentUser: User;
  onNavigate: (tab: string) => void;
  onSelectTournament: (t: Tournament) => void;
  onJoinTournament: (t: Tournament) => void;
  language: Language;
}

export const HomePage: React.FC<HomePageProps> = ({
  tournaments,
  registrations,
  currentUser,
  onNavigate,
  onSelectTournament,
  onJoinTournament,
  language,
}) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'OPEN' | 'LIVE' | 'SQUAD' | 'SOLO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[language];

  // Dynamic media configured from admin panel
  const siteSettings = storage.getSiteSettings();
  const currentHeroBanner = siteSettings.heroBannerUrl || heroBooyahEpic;
  const currentGamePoster = siteSettings.gamePosterUrl || ffGamePoster;

  // Find next upcoming open or live match for the hero spotlight ticker
  const upcomingMatch = tournaments.find((m) => m.status === 'LIVE') || 
    tournaments.find((m) => m.status === 'OPEN') || 
    tournaments[0];

  // Filter tournaments for the "All Matches" section
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tour) => {
      // Filter by category
      if (selectedFilter === 'OPEN' && tour.status !== 'OPEN') return false;
      if (selectedFilter === 'LIVE' && tour.status !== 'LIVE') return false;
      if (selectedFilter === 'SQUAD' && tour.mode !== 'SQUAD') return false;
      if (selectedFilter === 'SOLO' && tour.mode !== 'SOLO') return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = tour.title.toLowerCase().includes(q);
        const matchesMap = tour.map.toLowerCase().includes(q);
        const matchesMode = tour.mode.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMap && !matchesMode) return false;
      }

      return true;
    });
  }, [tournaments, selectedFilter, searchQuery]);

  // Total active prize pool
  const totalPrizePool = useMemo(() => {
    return tournaments
      .filter((m) => m.status !== 'CANCELLED')
      .reduce((acc, curr) => acc + (curr.prizePool || 0), 0);
  }, [tournaments]);

  // Smooth scroll handler to the "Available Tournament Listings / All Matches"
  const handleScrollToTournaments = () => {
    const el = document.getElementById('available-tournaments');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.classList.add('transition-all', 'duration-500', 'ring-2', 'ring-[#FF6A00]', 'ring-offset-4', 'ring-offset-[#0B0B12]');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#FF6A00]', 'ring-offset-4', 'ring-offset-[#0B0B12]');
      }, 1600);
    } else {
      onNavigate('tournaments');
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-16 max-w-7xl mx-auto">
      {/* HIGH-IMPACT HERO SECTION: Big Panoramic Photo + Prominent 'Join Tournament' CTA */}
      <section className="relative rounded-2xl overflow-hidden border border-zinc-800/90 bg-[#0B0E14] shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        {/* Large Visually Striking Background Banner */}
        <div className="relative min-h-[500px] sm:min-h-[560px] md:min-h-[620px] w-full overflow-hidden bg-black flex flex-col justify-between">
          <img
            src={currentHeroBanner}
            alt="Free Fire Tournament Arena Championship"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.10] scale-[1.01] transform transition-transform duration-1000"
          />

          {/* Cinematic Scrims & Atmospheric Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/75 to-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF6A00]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Live Ticker Strip */}
          <div className="relative z-10 px-4 sm:px-8 pt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFC107] bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/40 flex items-center gap-1.5 shadow-md">
                <Flame className="w-3.5 h-3.5 text-[#FF6A00] fill-[#FF6A00]" />
                Bangladesh Official Esports Arena
              </span>
            </div>

            {upcomingMatch && (
              <div 
                onClick={() => onSelectTournament(upcomingMatch)}
                className="hidden sm:flex items-center gap-2.5 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-zinc-700/80 text-xs hover:border-amber-500/60 transition-colors cursor-pointer group shadow-lg"
              >
                <span className="text-zinc-400 font-semibold uppercase text-[10px]">Next Match:</span>
                <span className="font-bold text-white group-hover:text-amber-400 transition-colors truncate max-w-[170px]">
                  {upcomingMatch.title}
                </span>
                <span className="text-amber-400 font-score font-bold">{formatBDT(upcomingMatch.prizePool)}</span>
                <div className="scale-90 origin-right">
                  <CountdownTimer targetDate={upcomingMatch.startsAt} compact />
                </div>
              </div>
            )}
          </div>

          {/* Main Hero Body: Headline, Poster Card & High-Impact CTA */}
          <div className="relative z-10 px-4 sm:px-8 py-8 flex flex-col justify-end space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              {/* Left: Poster Box + Headline */}
              <div className="flex items-start sm:items-end gap-4 sm:gap-6">
                {/* Poster Cover Box */}
                <div className="w-24 h-34 sm:w-32 sm:h-46 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.9)] border-2 border-white/20 shrink-0 bg-zinc-900 group relative">
                  <img
                    src={currentGamePoster}
                    alt="Free Fire Hero Warrior"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-center">
                    <span className="text-[9px] font-score font-black tracking-widest text-amber-300 uppercase bg-black/85 px-1.5 py-0.5 rounded border border-amber-500/30 block">
                      GARENA FF
                    </span>
                  </div>
                </div>

                {/* Headline Text */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-score font-bold uppercase tracking-wider text-amber-400 bg-black/80 px-2.5 py-0.5 rounded border border-amber-500/40">
                      BATTLE ROYALE
                    </span>
                    <span className="text-xs text-zinc-300 font-medium hidden sm:inline">
                      Ranked & Clash Squad
                    </span>
                    <span className="text-xs text-emerald-400 font-score font-bold hidden md:inline">
                      • {tournaments.filter(t => t.status === 'OPEN').length} Open Matches Now
                    </span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-none drop-shadow-2xl">
                    DROP IN. FIGHT. <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] via-[#FFC107] to-amber-200">
                      BOOYAH!
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-300 font-medium max-w-xl leading-relaxed drop-shadow">
                    Bangladesh’s premier Free Fire tournament platform. Compete in daily custom rooms, verify entry fees via bKash/Nagad/Rocket, and withdraw prize winnings directly to your wallet.
                  </p>
                </div>
              </div>

              {/* Right: High-Impact Call-To-Action Button & Action Cluster */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-stretch lg:self-end">
                {/* PROMINENT 'JOIN TOURNAMENT' CTA BUTTON */}
                <button
                  onClick={handleScrollToTournaments}
                  className="group relative px-8 py-4 sm:py-4.5 rounded-xl bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-amber-500 hover:from-[#FF6600] hover:to-amber-400 text-black font-display font-black text-base sm:text-lg uppercase tracking-wider transition-all duration-200 shadow-[0_0_35px_rgba(255,106,0,0.7)] hover:shadow-[0_0_55px_rgba(255,106,0,0.95)] cut-corner flex items-center justify-center gap-3 cursor-pointer transform hover:-translate-y-1 active:translate-y-0"
                >
                  <div className="w-6 h-6 rounded-md bg-black/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame className="w-4.5 h-4.5 text-black fill-black" />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-black font-black text-base sm:text-lg">Join Tournament</span>
                    <span className="text-[10px] font-sans font-extrabold text-black/80 tracking-normal normal-case">
                      View All Matches ↓
                    </span>
                  </div>
                  <ArrowDown className="w-5 h-5 text-black stroke-[3] group-hover:translate-y-0.5 transition-transform" />
                </button>

                {/* Secondary 'Add account' Button */}
                <button
                  onClick={() => onNavigate('profile')}
                  className="px-5 py-3.5 sm:py-4 rounded-xl bg-[#00c5ff] hover:bg-[#00b0e6] text-black text-xs sm:text-sm font-extrabold transition-all shadow-[0_0_20px_rgba(0,197,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>{currentUser.ffUid ? `UID: ${currentUser.ffUid}` : 'Add account'}</span>
                </button>

                {/* Organizer 'Create' Button */}
                <button
                  onClick={() => onNavigate('admin')}
                  className="px-4 py-3.5 sm:py-4 rounded-xl bg-[#1c2230]/90 hover:bg-[#252d40] text-white text-xs sm:text-sm font-semibold transition-all border border-zinc-700/80 shadow-md backdrop-blur-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Host Custom Match"
                >
                  <Plus className="w-4 h-4 text-zinc-400" />
                  <span>Create</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs Bar */}
        <div className="bg-[#0e121a] border-t border-zinc-800/80 px-4 sm:px-8">
          <div className="flex items-center gap-8 overflow-x-auto">
            <button
              onClick={() => onNavigate('home')}
              className="py-3.5 text-xs sm:text-sm font-bold text-white relative whitespace-nowrap"
            >
              <span>Overview</span>
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00c5ff] shadow-[0_0_10px_#00c5ff]" />
            </button>
            <button
              onClick={handleScrollToTournaments}
              className="py-3.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white whitespace-nowrap cursor-pointer"
            >
              All Matches ({tournaments.length})
            </button>
            <button
              onClick={() => onNavigate('tournaments')}
              className="py-3.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white whitespace-nowrap"
            >
              Tournaments
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="py-3.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white whitespace-nowrap"
            >
              Ranking & Points
            </button>
            <button
              onClick={() => onNavigate('wallet')}
              className="py-3.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white whitespace-nowrap"
            >
              Spaces & Wallet
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Payment Channels Strip (bKash, Nagad, Rocket, Upay) */}
      <section className="bg-[#11141c] border border-zinc-800/80 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
                Instant Verification & Safe Payouts
              </h4>
              <p className="text-xs text-zinc-400">
                Supports verified mobile banking across Bangladesh with 0% platform withdrawal fee
              </p>
            </div>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded bg-[#E2136E]/15 border border-[#E2136E]/40 text-[#E2136E] text-xs font-bold font-score">
              bKash
            </span>
            <span className="px-3 py-1 rounded bg-[#F7941D]/15 border border-[#F7941D]/40 text-[#F7941D] text-xs font-bold font-score">
              Nagad
            </span>
            <span className="px-3 py-1 rounded bg-[#8C3494]/15 border border-[#8C3494]/40 text-[#8C3494] text-xs font-bold font-score">
              Rocket
            </span>
            <span className="px-3 py-1 rounded bg-[#005BAC]/15 border border-cyan-500/40 text-cyan-400 text-xs font-bold font-score hidden sm:inline-block">
              Upay
            </span>
          </div>
        </div>
      </section>

      {/* AVAILABLE TOURNAMENT LISTINGS (ALL MATCHES) */}
      <section id="available-tournaments" className="space-y-5 scroll-mt-20">
        {/* Section Header & Live Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF6A00] uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-[#FF6A00]" />
              Available Tournament Listings
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white flex items-center gap-3">
              <span>All Matches & Showdowns</span>
              <span className="text-xs font-score font-bold bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40 px-2.5 py-0.5 rounded-full">
                {tournaments.length} Matches
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Choose your match, review slot availability, and claim your protected custom room credentials.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="bg-[#141824] border border-zinc-800 px-3.5 py-2 rounded-xl text-left">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Total Prize Pool</span>
              <span className="text-sm font-bold font-score text-amber-400">{formatBDT(totalPrizePool)}</span>
            </div>
            <div className="bg-[#141824] border border-zinc-800 px-3.5 py-2 rounded-xl text-left">
              <span className="text-[10px] uppercase font-semibold text-zinc-400 block">Open Registrations</span>
              <span className="text-sm font-bold font-score text-emerald-400">
                {tournaments.filter(m => m.status === 'OPEN').length} Active
              </span>
            </div>
          </div>
        </div>

        {/* Filter Chips + Search + View Mode Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedFilter === 'ALL'
                  ? 'bg-[#FF6A00] text-black shadow-[0_0_15px_rgba(255,106,0,0.4)]'
                  : 'bg-[#151924] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              All Matches ({tournaments.length})
            </button>
            <button
              onClick={() => setSelectedFilter('OPEN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedFilter === 'OPEN'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-[#151924] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Open Now ({tournaments.filter(m => m.status === 'OPEN').length})
            </button>
            <button
              onClick={() => setSelectedFilter('LIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedFilter === 'LIVE'
                  ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                  : 'bg-[#151924] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live ({tournaments.filter(m => m.status === 'LIVE').length})
            </button>
            <button
              onClick={() => setSelectedFilter('SQUAD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedFilter === 'SQUAD'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-[#151924] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Squad 4v4
            </button>
            <button
              onClick={() => setSelectedFilter('SOLO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedFilter === 'SOLO'
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-[#151924] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              Solo 1v1
            </button>
          </div>

          {/* Search Input & View Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search map or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#151924] border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            {/* List / Grid View Switch */}
            <div className="bg-[#151924] border border-zinc-700/80 rounded-lg p-0.5 flex items-center shrink-0">
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'LIST' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="List View (Esports Rows)"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'GRID' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Grid View (Cards)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Display Matches */}
        {filteredTournaments.length === 0 ? (
          <div className="bg-[#11141c] border border-zinc-800/80 rounded-xl p-8 text-center space-y-3">
            <p className="text-sm text-zinc-400">No tournaments matched your filter criteria.</p>
            <button
              onClick={() => {
                setSelectedFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-zinc-800 text-cyan-400 rounded-lg text-xs font-bold hover:bg-zinc-700"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'LIST' ? (
          <div className="space-y-3">
            {filteredTournaments.map((tournament) => {
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
            {filteredTournaments.map((tournament) => {
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
      </section>

      {/* How It Works (4 Steps) */}
      <section className="bg-[#11141c] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            {t.howItWorks}
          </h2>
          <p className="text-xs text-zinc-400">
            Four easy steps to compete and withdraw real prize money
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#151924] border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center font-score font-bold text-sm">
              01
            </div>
            <h3 className="text-sm font-bold text-white">{t.step1Title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{t.step1Desc}</p>
          </div>

          <div className="bg-[#151924] border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-score font-bold text-sm">
              02
            </div>
            <h3 className="text-sm font-bold text-white">{t.step2Title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{t.step2Desc}</p>
          </div>

          <div className="bg-[#151924] border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-score font-bold text-sm">
              03
            </div>
            <h3 className="text-sm font-bold text-white">{t.step3Title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{t.step3Desc}</p>
          </div>

          <div className="bg-[#151924] border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-score font-bold text-sm">
              04
            </div>
            <h3 className="text-sm font-bold text-white">{t.step4Title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{t.step4Desc}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
