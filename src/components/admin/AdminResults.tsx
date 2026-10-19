import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  CheckCircle, 
  Crosshair, 
  DollarSign, 
  Save, 
  Send,
  AlertCircle
} from 'lucide-react';
import { User, Tournament, Registration } from '../../types';
import { storage } from '../../lib/storage';
import { calcPoints, formatBDT } from '../../lib/points';
import { hasPermission } from '../../lib/permissions';

interface AdminResultsProps {
  currentUser: User;
}

export const AdminResults: React.FC<AdminResultsProps> = ({ currentUser }) => {
  const tournaments = storage.getTournaments();
  // Filter tournaments that are LIVE, FULL, or OPEN
  const activeOrPastTournaments = tournaments.filter((t) => t.status !== 'CANCELLED');

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    activeOrPastTournaments[0]?.id || ''
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedTournament = tournaments.find((t) => t.id === selectedTournamentId);
  const registrations = storage.getRegistrations(selectedTournamentId).filter((r) => r.status === 'CONFIRMED');
  const existingResults = storage.getMatchResults(selectedTournamentId);

  // Form state for each registration: placement & kills
  const [inputs, setInputs] = useState<Record<string, { placement: number; kills: number }>>(() => {
    const init: Record<string, { placement: number; kills: number }> = {};
    registrations.forEach((r, idx) => {
      const match = existingResults.find((er) => er.registrationId === r.id);
      init[r.id] = {
        placement: match ? match.placement : idx + 1,
        kills: match ? match.kills : 0,
      };
    });
    return init;
  });

  // Whenever selected tournament changes, sync form inputs
  const handleSelectTournament = (tId: string) => {
    setSelectedTournamentId(tId);
    setSuccessMessage(null);
    const regs = storage.getRegistrations(tId).filter((r) => r.status === 'CONFIRMED');
    const prevRes = storage.getMatchResults(tId);
    const init: Record<string, { placement: number; kills: number }> = {};
    regs.forEach((r, idx) => {
      const match = prevRes.find((er) => er.registrationId === r.id);
      init[r.id] = {
        placement: match ? match.placement : idx + 1,
        kills: match ? match.kills : 0,
      };
    });
    setInputs(init);
  };

  const handleInputChange = (regId: string, field: 'placement' | 'kills', value: number) => {
    setInputs((prev) => ({
      ...prev,
      [regId]: {
        ...prev[regId],
        [field]: Math.max(0, value),
      },
    }));
  };

  const canEnterResults = hasPermission(currentUser, 'results.enter');
  const canPublishResults = hasPermission(currentUser, 'results.publish');

  const handlePublishResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;

    const payload = Object.entries(inputs).map(([regId, data]) => ({
      registrationId: regId,
      placement: Number(data.placement),
      kills: Number(data.kills),
    }));

    try {
      storage.publishResults(selectedTournament.id, payload, currentUser.id);
      setSuccessMessage('Results published successfully! Winner prize money has been credited directly to player wallets.');
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert(err?.message || 'Error publishing results');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Match Results & Point Calculation
        </h1>
        <p className="text-xs text-zinc-400">
          Enter placements and kills from post-match screenshot. Point calculation and wallet prize distribution execute automatically.
        </p>
      </div>

      {/* Select Tournament */}
      <div className="bg-[#14141F] border border-zinc-800 p-4 rounded-xl cut-corner flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1 uppercase">
            Select Tournament Match
          </label>
          <select
            value={selectedTournamentId}
            onChange={(e) => handleSelectTournament(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#FF6A00] min-w-[280px]"
          >
            {activeOrPastTournaments.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.status}] {t.title} ({t.mode} · {t.map})
              </option>
            ))}
          </select>
        </div>

        {selectedTournament && (
          <div className="flex items-center gap-4 text-xs">
            <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Prize Pool</span>
              <span className="font-score text-amber-400 font-bold">{formatBDT(selectedTournament.prizePool)}</span>
            </div>
            <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Kill Bounty</span>
              <span className="font-score text-emerald-400 font-bold">
                {selectedTournament.perKillPrize ? `+${formatBDT(selectedTournament.perKillPrize)}/kill` : 'Standard'}
              </span>
            </div>
            <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Match Status</span>
              <span className={`font-score font-bold ${selectedTournament.status === 'COMPLETED' ? 'text-zinc-400' : 'text-[#FF6A00]'}`}>
                {selectedTournament.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-600 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Participants Input Form */}
      {registrations.length === 0 ? (
        <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-xs">
          No confirmed participants registered for this tournament yet.
        </div>
      ) : (
        <form onSubmit={handlePublishResults} className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
          <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF6A00]" />
              Confirmed Combatants ({registrations.length} slots)
            </h3>
            <span className="text-[11px] text-zinc-400">
              Placement Points Formula: 1st=12, 2nd=9, 3rd=8, 4th=7... + 1 pt/kill
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-score">
                <tr>
                  <th className="py-3 px-4">Slot</th>
                  <th className="py-3 px-4">Player & IGN</th>
                  <th className="py-3 px-4">Placement (1-12+)</th>
                  <th className="py-3 px-4">Kills</th>
                  <th className="py-3 px-4 text-center">Calculated Points</th>
                  <th className="py-3 px-4 text-right">Prize Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {registrations.map((reg) => {
                  const currentInput = inputs[reg.id] || { placement: 1, kills: 0 };
                  const points = selectedTournament
                    ? calcPoints(currentInput.placement, currentInput.kills, selectedTournament.pointsConfig)
                    : 0;

                  // Estimated prize
                  const placePrize = selectedTournament?.prizeDistribution[String(currentInput.placement)] || 0;
                  const killPrize = (selectedTournament?.perKillPrize || 0) * currentInput.kills;
                  const totalEstPrize = placePrize + killPrize;

                  return (
                    <tr key={reg.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4 font-score font-bold text-amber-400">
                        #{reg.slotNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{reg.userDisplayName}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {reg.ffIgn} (UID: {reg.ffUid})
                          </span>
                        </div>
                      </td>

                      {/* Placement Input */}
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="1"
                          max="48"
                          value={currentInput.placement}
                          onChange={(e) => handleInputChange(reg.id, 'placement', parseInt(e.target.value) || 1)}
                          disabled={!canEnterResults}
                          className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white font-score focus:outline-none focus:border-[#FF6A00]"
                        />
                      </td>

                      {/* Kills Input */}
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={currentInput.kills}
                          onChange={(e) => handleInputChange(reg.id, 'kills', parseInt(e.target.value) || 0)}
                          disabled={!canEnterResults}
                          className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white font-score focus:outline-none focus:border-[#FF6A00]"
                        />
                      </td>

                      {/* Calculated points */}
                      <td className="py-3 px-4 text-center font-score font-bold text-white text-sm">
                        {points} <span className="text-[10px] text-zinc-500 font-sans">PTS</span>
                      </td>

                      {/* Prize */}
                      <td className="py-3 px-4 text-right font-score font-bold whitespace-nowrap">
                        {totalEstPrize > 0 ? (
                          <span className="text-[#FFC107]">{formatBDT(totalEstPrize)}</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action strip */}
          <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Note: Clicking "Publish Results" completes tournament and pays out cash prizes to winners.
            </span>
            {canPublishResults && (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-xs font-extrabold bg-gradient-to-r from-[#FF6A00] to-[#FF8800] hover:brightness-110 text-black shadow-[0_0_20px_rgba(255,106,0,0.4)] transition-all cut-corner flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Publish Results & Credit Prizes
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
