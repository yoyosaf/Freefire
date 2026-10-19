import React, { useState } from 'react';
import { 
  Trophy, 
  Plus, 
  Unlock, 
  Ban, 
  Users, 
  MapPin, 
  Eye, 
  AlertTriangle,
  X,
  CheckCircle2,
  Calendar,
  Flame,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
  Check
} from 'lucide-react';
import { User, Tournament, TournamentMode, TournamentMap, MatchType } from '../../types';
import { storage } from '../../lib/storage';
import { formatBDT, formatBangladeshTime, DEFAULT_POINTS_CONFIG } from '../../lib/points';
import { hasPermission } from '../../lib/permissions';
import { MEDIA_PRESETS } from './AdminMedia';

interface AdminTournamentsProps {
  currentUser: User;
  onOpenReleaseModal: (tournament: Tournament) => void;
}

export const AdminTournaments: React.FC<AdminTournamentsProps> = ({
  currentUser,
  onOpenReleaseModal,
}) => {
  const [tournaments, setTournaments] = useState<Tournament[]>(() => storage.getTournaments());
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New Tournament form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<TournamentMode>('SQUAD');
  const [map, setMap] = useState<TournamentMap>('BERMUDA');
  const [matchType, setMatchType] = useState<MatchType>('BR_RANKED');
  const [entryFee, setEntryFee] = useState<number>(50);
  const [prizePool, setPrizePool] = useState<number>(2000);
  const [prizeDist1, setPrizeDist1] = useState<number>(1200);
  const [prizeDist2, setPrizeDist2] = useState<number>(500);
  const [prizeDist3, setPrizeDist3] = useState<number>(300);
  const [perKillPrize, setPerKillPrize] = useState<number>(10);
  const [maxSlots, setMaxSlots] = useState<number>(48);
  const [hoursFromNow, setHoursFromNow] = useState<number>(3);
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [rules, setRules] = useState(
    'No emulator players allowed. Gun skins attributes: OFF. Character skills: ON. No teaming in Solo.'
  );

  // Quick photo editor modal state
  const [editingPhotoTournament, setEditingPhotoTournament] = useState<Tournament | null>(null);
  const [photoEditUrl, setPhotoEditUrl] = useState<string>('');

  const canCreate = hasPermission(currentUser, 'tournaments.create');
  const canCancel = hasPermission(currentUser, 'tournaments.cancel');
  const canReleaseRoom = hasPermission(currentUser, 'tournaments.release_room');

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('Please provide a tournament title.');
      return;
    }

    const now = Date.now();
    const startsAt = new Date(now + hoursFromNow * 3600 * 1000).toISOString();
    const registrationClosesAt = new Date(now + (hoursFromNow * 3600 - 900) * 1000).toISOString(); // 15 mins before start

    // Determine banner URL from state or default preset
    const finalBannerUrl = bannerUrl.trim() || (
      map === 'BERMUDA' ? '/src/assets/images/bermuda_tournament_banner_1792421959844.jpg' :
      map === 'PURGATORY' ? '/src/assets/images/purgatory_rush_banner_1792421959821.jpg' :
      matchType === 'CLASH_SQUAD' ? '/src/assets/images/clash_squad_arena_1792421959604.jpg' :
      '/src/assets/images/hero_booyah_epic_1792421958285.jpg'
    );

    try {
      const created = storage.createTournament(
        {
          title: title.trim(),
          description: description.trim() || `${mode} clash on ${map}. Fight for Booyah!`,
          bannerUrl: finalBannerUrl,
          mode,
          map,
          matchType,
          entryFee: Number(entryFee),
          prizePool: Number(prizePool),
          prizeDistribution: {
            '1': Number(prizeDist1),
            '2': Number(prizeDist2),
            '3': Number(prizeDist3),
          },
          perKillPrize: perKillPrize > 0 ? Number(perKillPrize) : undefined,
          maxSlots: Number(maxSlots),
          startsAt,
          registrationClosesAt,
          status: 'OPEN',
          rules,
          pointsConfig: DEFAULT_POINTS_CONFIG,
          createdBy: currentUser.id,
        },
        currentUser.id
      );

      setTournaments(storage.getTournaments());
      setIsCreating(false);
      setTitle('');
      setDescription('');
      setSuccess(`Tournament "${created.title}" successfully created and opened for registration!`);
    } catch (err: any) {
      setError(err?.message || 'Error creating tournament');
    }
  };

  const handleCancel = (tournament: Tournament) => {
    if (!canCancel) return;
    const confirmMsg = `Cancel "${tournament.title}"? This will automatically refund all confirmed participants' entry fees back to their in-app wallets.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      storage.cancelTournament(tournament.id, currentUser.id, 'Cancelled by admin');
      setTournaments(storage.getTournaments());
      setSuccess(`Tournament "${tournament.title}" was cancelled and refunds were credited.`);
    } catch (err: any) {
      setError(err?.message || 'Error cancelling tournament');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Tournaments Management
          </h1>
          <p className="text-xs text-zinc-400">
            Create battle royale rooms, manage slot limits, release room credentials, and handle cancellations
          </p>
        </div>
        {canCreate && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#FF8800] text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(255,106,0,0.3)] cut-corner flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> + Create Tournament
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300">
          {success}
        </div>
      )}

      {/* Create Tournament Form */}
      {isCreating && (
        <div className="bg-[#14141F] border border-[#FF6A00]/50 rounded-xl p-5 sm:p-6 cut-corner shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="font-display text-base font-bold uppercase tracking-wide text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FF6A00]" />
              Create New Free Fire Tournament
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateTournament} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Tournament Title <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Night Squad Showdown #5"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Mode, Map & Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                  >
                    <option value="SOLO">SOLO</option>
                    <option value="DUO">DUO</option>
                    <option value="SQUAD">SQUAD</option>
                  </select>
                  <select
                    value={map}
                    onChange={(e) => setMap(e.target.value as any)}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                  >
                    <option value="BERMUDA">BERMUDA</option>
                    <option value="KALAHARI">KALAHARI</option>
                    <option value="PURGATORY">PURGATORY</option>
                    <option value="ALPINE">ALPINE</option>
                    <option value="NEXTERRA">NEXTERRA</option>
                  </select>
                  <select
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value as any)}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                  >
                    <option value="BR_RANKED">BR Ranked</option>
                    <option value="CLASH_SQUAD">Clash Squad</option>
                    <option value="LONE_WOLF">Lone Wolf</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Description / Highlights
              </label>
              <input
                type="text"
                placeholder="Brief match overview or hype sentence"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            {/* Financials & Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Entry Fee (BDT ৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={entryFee}
                  onChange={(e) => setEntryFee(Number(e.target.value))}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-score focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Prize Pool (BDT ৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={prizePool}
                  onChange={(e) => setPrizePool(Number(e.target.value))}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-amber-400 font-score font-bold focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Max Slots
                </label>
                <input
                  type="number"
                  min="4"
                  max="48"
                  value={maxSlots}
                  onChange={(e) => setMaxSlots(Number(e.target.value))}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-score focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Per Kill Bonus (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={perKillPrize}
                  onChange={(e) => setPerKillPrize(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-score focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>

            {/* Prize Distribution Split */}
            <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-2">
              <span className="text-xs font-bold text-zinc-300 block">
                Prize Distribution (1st, 2nd, 3rd)
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-amber-400 block uppercase font-semibold">1st Place (Booyah)</label>
                  <input
                    type="number"
                    value={prizeDist1}
                    onChange={(e) => setPrizeDist1(Number(e.target.value))}
                    className="w-full bg-black/60 border border-zinc-700 rounded px-2.5 py-1 text-xs text-white font-score"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block uppercase font-semibold">2nd Place</label>
                  <input
                    type="number"
                    value={prizeDist2}
                    onChange={(e) => setPrizeDist2(Number(e.target.value))}
                    className="w-full bg-black/60 border border-zinc-700 rounded px-2.5 py-1 text-xs text-white font-score"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block uppercase font-semibold">3rd Place</label>
                  <input
                    type="number"
                    value={prizeDist3}
                    onChange={(e) => setPrizeDist3(Number(e.target.value))}
                    className="w-full bg-black/60 border border-zinc-700 rounded px-2.5 py-1 text-xs text-white font-score"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Starts In (Hours from now)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={hoursFromNow}
                  onChange={(e) => setHoursFromNow(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-score focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Custom Match Rules
                </label>
                <input
                  type="text"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>
            </div>

            {/* Tournament Banner Graphic Selection */}
            <div className="space-y-2 p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#FF6A00]" />
                  Tournament Banner Photo
                </label>
                <span className="text-[10px] text-zinc-500">Pick preset or upload custom file</span>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MEDIA_PRESETS.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setBannerUrl(p.url)}
                    className={`p-1.5 rounded-lg border text-left transition-all flex items-center gap-2 ${
                      bannerUrl === p.url ? 'border-[#FF6A00] bg-[#FF6A00]/10 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <img src={p.url} alt="" referrerPolicy="no-referrer" className="w-10 h-7 rounded object-cover" />
                    <span className="text-[10px] font-bold truncate">{p.title}</span>
                  </button>
                ))}
              </div>

              {/* Upload file or enter URL */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Paste banner image URL or select from above..."
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="flex-1 bg-black/60 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white"
                />
                <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const b64 = ev.target?.result as string;
                        if (b64) setBannerUrl(b64);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#FF6A00] hover:bg-[#FF8800] text-black shadow-lg"
              >
                Launch Tournament
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tournaments List Table */}
      <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-score">
              <tr>
                <th className="py-3 px-4">Tournament</th>
                <th className="py-3 px-4">Mode / Map</th>
                <th className="py-3 px-4">Slots</th>
                <th className="py-3 px-4">Entry / Prize</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {tournaments.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => {
                          setEditingPhotoTournament(t);
                          setPhotoEditUrl(t.bannerUrl);
                        }}
                        className="w-14 h-9 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-700 shrink-0 relative group cursor-pointer"
                        title="Click to change banner photo"
                      >
                        <img src={t.bannerUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ImageIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-white text-sm block truncate max-w-xs">{t.title}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {t.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-zinc-200 font-bold">{t.mode}</span>
                    <span className="text-zinc-500 block text-[11px]">{t.map} · {t.matchType}</span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-score">
                    <span className={t.filledSlots >= t.maxSlots ? 'text-rose-400 font-bold' : 'text-zinc-300'}>
                      {t.filledSlots}/{t.maxSlots}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-zinc-300 font-score">{formatBDT(t.entryFee)}</span>
                    <span className="text-[#FFC107] block font-score font-bold">{formatBDT(t.prizePool)}</span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400 text-[11px]">
                    {formatBangladeshTime(t.startsAt)}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.status === 'LIVE' ? 'bg-rose-600 text-white animate-pulse' :
                      t.status === 'COMPLETED' ? 'bg-zinc-800 text-zinc-400' :
                      t.status === 'CANCELLED' ? 'bg-red-950 text-red-400 border border-red-800' :
                      t.status === 'FULL' ? 'bg-amber-950 text-amber-400' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {t.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingPhotoTournament(t);
                          setPhotoEditUrl(t.bannerUrl);
                        }}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors border border-zinc-700 flex items-center gap-1"
                        title="Change tournament banner photo"
                      >
                        <ImageIcon className="w-3 h-3 text-[#FF6A00]" />
                        <span>Photo</span>
                      </button>

                      {canReleaseRoom && !t.roomReleasedAt && t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
                        <button
                          onClick={() => onOpenReleaseModal(t)}
                          className="px-2.5 py-1 rounded bg-[#FF6A00]/20 hover:bg-[#FF6A00] text-[#FF6A00] hover:text-black border border-[#FF6A00]/50 text-xs font-bold transition-all flex items-center gap-1"
                          title="Enter Room ID & Password"
                        >
                          <Unlock className="w-3 h-3" /> Release
                        </button>
                      )}

                      {canCancel && t.status !== 'LIVE' && t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancel(t)}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-red-950 hover:text-red-300 text-zinc-400 text-xs font-medium transition-colors border border-zinc-700"
                          title="Cancel tournament & refund all participants"
                        >
                          <Ban className="w-3 h-3" /> Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Photo Change Modal */}
      {editingPhotoTournament && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141F] border border-zinc-700 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] text-[#FF6A00] font-bold uppercase block">Change Banner Photo</span>
                <h3 className="font-display text-base font-bold text-white">{editingPhotoTournament.title}</h3>
              </div>
              <button
                onClick={() => setEditingPhotoTournament(null)}
                className="w-7 h-7 rounded bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Preview */}
            <div className="relative h-44 w-full bg-black rounded-xl overflow-hidden border border-zinc-700">
              <img
                src={photoEditUrl}
                alt="Banner Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-400 font-bold block uppercase">Choose from Presets</label>
              <div className="grid grid-cols-4 gap-2">
                {MEDIA_PRESETS.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPhotoEditUrl(p.url)}
                    className={`h-12 rounded-lg overflow-hidden border transition-all ${
                      photoEditUrl === p.url ? 'border-[#FF6A00] ring-2 ring-[#FF6A00]' : 'border-zinc-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Upload or URL */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Image URL..."
                value={photoEditUrl}
                onChange={(e) => setPhotoEditUrl(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                <Upload className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const b64 = ev.target?.result as string;
                      if (b64) setPhotoEditUrl(b64);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingPhotoTournament(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs rounded-lg font-semibold hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!photoEditUrl.trim()) return;
                  storage.updateTournament(editingPhotoTournament.id, { bannerUrl: photoEditUrl }, currentUser.id);
                  setTournaments(storage.getTournaments());
                  setSuccess(`Banner photo for "${editingPhotoTournament.title}" updated successfully!`);
                  setEditingPhotoTournament(null);
                }}
                className="px-5 py-2 bg-gradient-to-r from-[#FF6A00] to-amber-500 text-black text-xs font-extrabold rounded-lg shadow-md hover:brightness-110 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Apply Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
