import React, { useState } from 'react';
import { Award, Trophy, Crown, Crosshair, Medal, Flame } from 'lucide-react';
import { MatchResult, Tournament } from '../../types';
import { LeaderboardTable } from '../LeaderboardTable';
import { storage } from '../../lib/storage';

interface LeaderboardPageProps {
  tournaments: Tournament[];
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ tournaments }) => {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('GLOBAL');

  const matchResults = storage.getMatchResults();
  const completedTournaments = tournaments.filter((t) => t.status === 'COMPLETED');

  // Compute Global Aggregated Leaderboard
  const globalStats: Record<string, { userId: string; displayName: string; ffIgn: string; kills: number; points: number; matches: number; booyahs: number }> = {};

  matchResults.forEach((res) => {
    if (!globalStats[res.userId]) {
      globalStats[res.userId] = {
        userId: res.userId,
        displayName: res.displayName,
        ffIgn: res.ffIgn,
        kills: 0,
        points: 0,
        matches: 0,
        booyahs: 0,
      };
    }
    globalStats[res.userId].kills += res.kills;
    globalStats[res.userId].points += res.points;
    globalStats[res.userId].matches += 1;
    if (res.placement === 1) {
      globalStats[res.userId].booyahs += 1;
    }
  });

  const globalList = Object.values(globalStats).sort((a, b) => b.points - a.points || b.kills - a.kills);

  const activeResults = selectedTournamentId === 'GLOBAL'
    ? []
    : storage.getMatchResults(selectedTournamentId);

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-[#FFC107]" />
            Free Fire Hall of Fame & Rankings
          </h1>
          <p className="text-xs text-zinc-400">
            Top combatants ranked by official placement points and kill bounties across all tournaments
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedTournamentId('GLOBAL')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cut-corner flex items-center gap-1.5 ${
            selectedTournamentId === 'GLOBAL'
              ? 'bg-[#FFC107] text-black shadow-[0_0_15px_rgba(255,193,7,0.4)]'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <Crown className="w-3.5 h-3.5" /> Global Season Rankings
        </button>

        {completedTournaments.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTournamentId(t.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              selectedTournamentId === t.id
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      {selectedTournamentId === 'GLOBAL' ? (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          {globalList.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Rank 2 (Silver) */}
              <div className="bg-[#14141F] border border-slate-700 rounded-xl p-5 cut-corner order-2 sm:order-1 flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-300 text-black flex items-center justify-center font-bold font-score text-lg shadow-md">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{globalList[1].displayName}</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">{globalList[1].ffIgn}</span>
                </div>
                <div className="flex items-center gap-3 pt-2 text-xs">
                  <span className="text-zinc-400">Kills: <strong className="text-rose-400">{globalList[1].kills}</strong></span>
                  <span className="text-zinc-400">PTS: <strong className="text-white font-score">{globalList[1].points}</strong></span>
                </div>
              </div>

              {/* Rank 1 (Gold) */}
              <div className="bg-gradient-to-b from-[#1C1C2B] to-[#14141F] border-2 border-[#FFC107] rounded-xl p-6 cut-corner order-1 sm:order-2 flex flex-col items-center text-center space-y-2 shadow-[0_0_25px_rgba(255,193,7,0.25)] relative sm:-translate-y-3">
                <div className="w-14 h-14 rounded-full bg-[#FFC107] text-black flex items-center justify-center font-black font-score text-2xl shadow-[0_0_15px_rgba(255,193,7,0.7)]">
                  <Crown className="w-7 h-7 fill-black" />
                </div>
                <div>
                  <div className="inline-block bg-[#FFC107]/20 text-[#FFC107] border border-[#FFC107]/40 text-[9px] font-extrabold px-2 py-0.2 rounded uppercase mb-1">
                    CHAMPION
                  </div>
                  <h3 className="font-bold text-white text-base">{globalList[0].displayName}</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">{globalList[0].ffIgn}</span>
                </div>
                <div className="flex items-center gap-4 pt-2 text-xs">
                  <span className="text-zinc-300">Booyahs: <strong className="text-[#FFC107]">{globalList[0].booyahs}</strong></span>
                  <span className="text-zinc-300">Kills: <strong className="text-rose-400">{globalList[0].kills}</strong></span>
                  <span className="text-zinc-300">PTS: <strong className="text-white font-score text-sm">{globalList[0].points}</strong></span>
                </div>
              </div>

              {/* Rank 3 (Bronze) */}
              <div className="bg-[#14141F] border border-amber-900 rounded-xl p-5 cut-corner order-3 flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-800 text-white flex items-center justify-center font-bold font-score text-lg shadow-md">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{globalList[2].displayName}</h3>
                  <span className="text-[11px] text-zinc-400 font-mono">{globalList[2].ffIgn}</span>
                </div>
                <div className="flex items-center gap-3 pt-2 text-xs">
                  <span className="text-zinc-400">Kills: <strong className="text-rose-400">{globalList[2].kills}</strong></span>
                  <span className="text-zinc-400">PTS: <strong className="text-white font-score">{globalList[2].points}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Full Global Table */}
          <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-score">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Player & IGN</th>
                    <th className="py-3 px-4 text-center">Matches</th>
                    <th className="py-3 px-4 text-center">Booyahs</th>
                    <th className="py-3 px-4 text-center">Total Kills</th>
                    <th className="py-3 px-4 text-right">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {globalList.map((player, idx) => (
                    <tr key={player.userId} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4 text-center font-score font-bold">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{player.displayName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{player.ffIgn}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-score text-zinc-300">
                        {player.matches}
                      </td>
                      <td className="py-3 px-4 text-center font-score text-[#FFC107] font-bold">
                        {player.booyahs}
                      </td>
                      <td className="py-3 px-4 text-center font-score text-rose-400 font-bold">
                        {player.kills}
                      </td>
                      <td className="py-3 px-4 text-right font-score text-sm font-bold text-white">
                        {player.points} <span className="text-[10px] text-zinc-500 font-sans">PTS</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <LeaderboardTable results={activeResults} />
      )}
    </div>
  );
};
