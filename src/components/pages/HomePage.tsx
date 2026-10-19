import React from 'react';
import { 
  Flame, 
  Trophy, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Users, 
  Clock, 
  Smartphone,
  ChevronRight,
  Award
} from 'lucide-react';
import { Tournament, Registration, User } from '../../types';
import { TournamentCard } from '../TournamentCard';
import { CountdownTimer } from '../CountdownTimer';
import { formatBDT } from '../../lib/points';
import { Language, translations } from '../../lib/translations';

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
  const t = translations[language];

  // Find next upcoming open or live match
  const upcomingMatch = tournaments.find((t) => t.status === 'LIVE') || 
    tournaments.find((t) => t.status === 'OPEN') || 
    tournaments[0];

  const featuredTournaments = tournaments.slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Hero Section (Spec 14 & Universal Design Constitution) */}
      <section className="relative rounded-2xl overflow-hidden cut-corner border border-zinc-800/80 bg-zinc-950">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/hero_booyah_arena_1792418531252.jpg"
            alt="BOOYAH Arena Stadium"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B12] via-[#0B0B12]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-transparent to-transparent" />
        </div>

        <div className="relative max-w-4xl px-6 py-12 sm:px-10 sm:py-20 flex flex-col justify-center space-y-6">
          {/* Eyebrow kicker */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF6A00] tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-ping" />
            <span>Daily Free Fire Custom Rooms · Bangladesh</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
            DROP IN. FIGHT. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] via-[#FFC107] to-amber-200">BOOYAH!</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed">
            {t.heroSubhead}
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('tournaments')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8800] hover:brightness-110 text-black font-extrabold text-sm transition-all shadow-[0_0_25px_rgba(255,106,0,0.5)] cut-corner flex items-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-black" />
              {t.joinTournament}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('rules')}
              className="px-5 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-sm transition-colors border border-zinc-700/80 flex items-center gap-2"
            >
              {t.howItWorks}
            </button>
          </div>

          {/* Upcoming Clash Live Strip */}
          {upcomingMatch && (
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t border-zinc-800/80 text-xs">
              <span className="text-zinc-400 font-semibold uppercase tracking-wider">
                {t.upcomingClash}:
              </span>
              <div className="flex items-center gap-3 bg-black/60 px-3 py-1.5 rounded-lg border border-zinc-800">
                <span className="font-bold text-white truncate max-w-[200px]">{upcomingMatch.title}</span>
                <span className="text-amber-400 font-score font-bold">{formatBDT(upcomingMatch.prizePool)}</span>
                <CountdownTimer targetDate={upcomingMatch.startsAt} compact />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust & Payment Channels Strip (bKash, Nagad, Rocket, Upay) */}
      <section className="bg-[#14141F] border border-zinc-800 rounded-xl p-4 sm:p-5 cut-corner">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
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

          {/* Logos / Brand pills */}
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

      {/* Featured & Live Tournaments */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FF6A00]" />
              Featured Tournaments
            </h2>
            <p className="text-xs text-zinc-400">
              Pick your map, reserve your slot, and secure your place in the custom room
            </p>
          </div>
          <button
            onClick={() => onNavigate('tournaments')}
            className="text-xs font-bold text-[#FF6A00] hover:underline flex items-center gap-1"
          >
            All Tournaments <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTournaments.map((tournament) => {
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
      </section>

      {/* How It Works (4 Steps) */}
      <section className="bg-[#14141F] border border-zinc-800 rounded-2xl p-6 sm:p-8 cut-corner space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            {t.howItWorks}
          </h2>
          <p className="text-xs text-zinc-400">
            Four easy steps to compete and withdraw real prize money
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center font-score font-bold text-sm">
              01
            </div>
            <h3 className="text-sm font-bold text-white">{t.step1Title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{t.step1Desc}</p>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFC107]/20 text-[#FFC107] flex items-center justify-center font-score font-bold text-sm">
              02
            </div>
            <h3 className="text-sm font-bold text-white">{t.step2Title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{t.step2Desc}</p>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-score font-bold text-sm">
              03
            </div>
            <h3 className="text-sm font-bold text-white">{t.step3Title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{t.step3Desc}</p>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-score font-bold text-sm">
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
