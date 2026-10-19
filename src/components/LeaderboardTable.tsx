import React from 'react';
import { Crown, Medal, Crosshair, Trophy } from 'lucide-react';
import { MatchResult } from '../types';

interface LeaderboardTableProps {
  results: MatchResult[];
  tournamentTitle?: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  results,
  tournamentTitle,
}) => {
  if (results.length === 0) {
    return (
      <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-xs">
        No match results published yet. Leaderboard will be generated once match is completed and kills/placements are verified.
      </div>
    );
  }

  return (
    <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
      {tournamentTitle && (
        <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FFC107]" />
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">
              {tournamentTitle} Rankings
            </h4>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {results.length} Combatants
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Sticky header */}
          <thead className="bg-black/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 sticky top-0 z-10 font-score">
            <tr>
              <th className="py-3 px-4 w-14 text-center">Rank</th>
              <th className="py-3 px-4">Player / Team</th>
              <th className="py-3 px-4">Slot</th>
              <th className="py-3 px-4 text-center">Kills</th>
              <th className="py-3 px-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-medium">
            {results.map((res, idx) => {
              const rank = idx + 1;
              const isRank1 = rank === 1;
              const isRank2 = rank === 2;
              const isRank3 = rank === 3;

              let rowStyle = 'hover:bg-zinc-900/50 text-zinc-300';
              if (isRank1) {
                rowStyle = 'bg-amber-950/20 hover:bg-amber-950/30 text-amber-200 border-l-2 border-[#FFC107]';
              } else if (isRank2) {
                rowStyle = 'bg-slate-900/30 hover:bg-slate-900/50 text-zinc-200 border-l-2 border-slate-400';
              } else if (isRank3) {
                rowStyle = 'bg-amber-950/10 hover:bg-amber-950/20 text-zinc-300 border-l-2 border-amber-700';
              }

              return (
                <tr key={res.id} className={`transition-colors ${rowStyle}`}>
                  {/* Rank Column */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {isRank1 ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#FFC107] text-black font-extrabold shadow-[0_0_12px_rgba(255,193,7,0.7)]">
                        <Crown className="w-4 h-4 fill-black" />
                      </div>
                    ) : isRank2 ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-black font-bold">
                        <Medal className="w-4 h-4" />
                      </div>
                    ) : isRank3 ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-bold">
                        <Medal className="w-4 h-4" />
                      </div>
                    ) : (
                      <span className="font-score text-zinc-500 font-bold">{rank}</span>
                    )}
                  </td>

                  {/* Player Name & IGN */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        {res.displayName}
                        {isRank1 && (
                          <span className="bg-[#FFC107]/20 text-[#FFC107] border border-[#FFC107]/40 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                            BOOYAH!
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {res.ffIgn}
                      </span>
                    </div>
                  </td>

                  {/* Slot */}
                  <td className="py-3 px-4 whitespace-nowrap text-zinc-400 font-score">
                    #{res.slotNumber}
                  </td>

                  {/* Kills */}
                  <td className="py-3 px-4 text-center whitespace-nowrap font-score font-bold">
                    <span className="inline-flex items-center gap-1 text-rose-400">
                      <Crosshair className="w-3 h-3 text-rose-500" /> {res.kills}
                    </span>
                  </td>

                  {/* Points */}
                  <td className="py-3 px-4 text-right whitespace-nowrap font-score text-sm font-extrabold">
                    <span className={isRank1 ? 'text-[#FFC107] text-base' : 'text-white'}>
                      {res.points} <span className="text-[10px] text-zinc-500 font-sans">PTS</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
