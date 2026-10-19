import React from 'react';
import { MoreHorizontal, Plus, UserPlus, Flame, Shield, Check, Gamepad2 } from 'lucide-react';
import { User } from '../types';
import { storage } from '../lib/storage';
import heroBooyahEpic from '../assets/images/hero_booyah_epic_1792421958285.jpg';
import ffGamePoster from '../assets/images/ff_game_poster_1792421958800.jpg';

interface GameHubHeroProps {
  currentUser: User;
  activeNavTab: string;
  onSelectNavTab: (tab: string) => void;
  onCreateMatch: () => void;
  onAddAccount: () => void;
}

export const GameHubHero: React.FC<GameHubHeroProps> = ({
  currentUser,
  activeNavTab,
  onSelectNavTab,
  onCreateMatch,
  onAddAccount,
}) => {
  const siteSettings = storage.getSiteSettings();
  const heroBanner = siteSettings.heroBannerUrl || heroBooyahEpic;
  const gamePoster = siteSettings.gamePosterUrl || ffGamePoster;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tournaments', label: 'Tournaments' },
    { id: 'team-finder', label: 'Team Finder' },
    { id: 'ranking', label: 'Ranking' },
    { id: 'spaces', label: 'Spaces' },
  ];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800/80 bg-[#0B0E14] shadow-2xl mb-6">
      {/* Big Panoramic Photo Background */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-black">
        <img
          src={heroBanner}
          alt="Garena Free Fire Battle Royale"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-95 contrast-110"
        />
        {/* Soft Vignette and bottom fade to match screenshot dark background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

        {/* Foreground Content: Poster Card + Title + Call to Action Buttons */}
        <div className="absolute bottom-6 left-4 right-4 sm:left-8 sm:right-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          {/* Left: Poster Box + Title */}
          <div className="flex items-end gap-4 sm:gap-6">
            {/* Free Fire Game Poster Box Art */}
            <div className="w-20 h-28 sm:w-28 sm:h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 shrink-0 bg-zinc-900 group">
              <img
                src={gamePoster}
                alt="Free Fire Poster Cover"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Title */}
            <div className="space-y-1 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
                  Battle Royale
                </span>
                <span className="text-xs text-zinc-400 hidden sm:inline">Official Esports Hub</span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
                Garena Free Fire
              </h1>
              <p className="text-xs text-zinc-300 font-medium hidden sm:block">
                Daily custom rooms, automatic slot holds, bKash/Nagad verification, and cash prizes.
              </p>
            </div>
          </div>

          {/* Right: Exact Call To Action Buttons from Screenshot */}
          <div className="flex items-center gap-2.5 self-start md:self-end shrink-0">
            {/* More Options Button ... */}
            <button
              onClick={() => onSelectNavTab('overview')}
              className="w-10 h-10 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-700/60 shadow-md backdrop-blur-sm"
              title="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Create Button (dark translucent button) */}
            <button
              onClick={onCreateMatch}
              className="px-5 py-2.5 rounded-lg bg-[#1c2230]/90 hover:bg-[#252d40] text-white text-xs sm:text-sm font-semibold transition-all border border-zinc-700/80 shadow-md backdrop-blur-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-zinc-400" />
              <span>Create</span>
            </button>

            {/* Add account / Link Game UID CTA Button (Bright Cyan Pill!) */}
            <button
              onClick={onAddAccount}
              className="px-5 py-2.5 rounded-lg bg-[#00c5ff] hover:bg-[#00b0e6] text-black text-xs sm:text-sm font-extrabold transition-all shadow-[0_0_20px_rgba(0,197,255,0.45)] flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>{currentUser.ffUid ? `UID: ${currentUser.ffUid}` : 'Add account'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="bg-[#0e121a] border-t border-zinc-800/80 px-4 sm:px-8">
        <div className="flex items-center gap-8 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeNavTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectNavTab(tab.id)}
                className={`py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors relative ${
                  isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00c5ff] shadow-[0_0_10px_#00c5ff]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
