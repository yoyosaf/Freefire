import React, { useState } from 'react';
import { Trophy, Search, Filter, Flame } from 'lucide-react';
import { Tournament, Registration, User, TournamentMode, TournamentStatus } from '../../types';
import { TournamentCard } from '../TournamentCard';
import { Language, translations } from '../../lib/translations';

interface TournamentsPageProps {
  tournaments: Tournament[];
  registrations: Registration[];
  currentUser: User;
  onSelectTournament: (t: Tournament) => void;
  onJoinTournament: (t: Tournament) => void;
  language: Language;
}

export const TournamentsPage: React.FC<TournamentsPageProps> = ({
  tournaments,
  registrations,
  currentUser,
  onSelectTournament,
  onJoinTournament,
  language,
}) => {
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterMap, setFilterMap] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const t = translations[language];

  const filtered = tournaments.filter((tournament) => {
    if (filterMode !== 'ALL' && tournament.mode !== filterMode) return false;
    if (filterStatus !== 'ALL' && tournament.status !== filterStatus) return false;
    if (filterMap !== 'ALL' && tournament.map !== filterMap) return false;
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FF6A00]" />
            Free Fire Esports Tournaments
          </h1>
          <p className="text-xs text-zinc-400">
            Browse active battles across Bermuda, Purgatory, Kalahari, Alpine, and Nexterra
          </p>
        </div>
        <span className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg w-fit">
          Showing <strong className="text-white font-score">{filtered.length}</strong> Matches
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#14141F] border border-zinc-800 p-4 rounded-xl cut-corner space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'SOLO', 'DUO', 'SQUAD'].map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterMode === mode
                    ? 'bg-[#FF6A00] text-black font-bold shadow-[0_0_12px_rgba(255,106,0,0.4)]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {mode === 'ALL' ? 'All Modes' : mode}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tournament, map..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
            />
          </div>
        </div>

        {/* Secondary filters: Status and Map */}
        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-semibold uppercase text-[10px]">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#FF6A00]"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open for Registration</option>
              <option value="LIVE">Live Matches</option>
              <option value="FULL">Slots Full</option>
              <option value="COMPLETED">Finished</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-semibold uppercase text-[10px]">Map:</span>
            <select
              value={filterMap}
              onChange={(e) => setFilterMap(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#FF6A00]"
            >
              <option value="ALL">All Maps</option>
              <option value="BERMUDA">Bermuda</option>
              <option value="KALAHARI">Kalahari</option>
              <option value="PURGATORY">Purgatory</option>
              <option value="ALPINE">Alpine</option>
              <option value="NEXTERRA">Nexterra</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Tournament Cards */}
      {filtered.length === 0 ? (
        <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-12 text-center text-zinc-500 text-xs">
          No tournaments found matching the active filters. Try adjusting your search query or mode.
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
  );
};
