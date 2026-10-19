import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  Trophy,
  Flame,
  Layout,
  Layers,
  ArrowRight
} from 'lucide-react';
import { User, Tournament, SiteSettings } from '../../types';
import { storage } from '../../lib/storage';
import { hasPermission } from '../../lib/permissions';

// Import local bundled images as reference presets
import heroBooyahEpic from '../../assets/images/hero_booyah_epic_1792421958285.jpg';
import ffGamePoster from '../../assets/images/ff_game_poster_1792421958800.jpg';
import bermudaBanner from '../../assets/images/bermuda_tournament_banner_1792421959844.jpg';
import clashSquadBanner from '../../assets/images/clash_squad_arena_1792421959604.jpg';
import purgatoryBanner from '../../assets/images/purgatory_rush_banner_1792421959821.jpg';
import avatarPro from '../../assets/images/avatar_esports_pro_1792418533019.jpg';

export interface MediaPreset {
  id: string;
  title: string;
  tag: string;
  aspectRatio: string;
  url: string;
  description: string;
}

export const MEDIA_PRESETS: MediaPreset[] = [
  {
    id: 'hero-championship',
    title: 'World Series Championship Arena',
    tag: 'Hero Panoramic',
    aspectRatio: '16:9',
    url: heroBooyahEpic,
    description: 'Esports stage arena with fiery squad, trophy, spotlights and airdrop yellow smoke',
  },
  {
    id: 'poster-cyborg',
    title: 'Cyborg Ember Warrior',
    tag: 'Cover Poster',
    aspectRatio: '3:4',
    url: ffGamePoster,
    description: 'Dynamic 3D battle royale character with flaming jacket and tactical assault rifle',
  },
  {
    id: 'bermuda-clocktower',
    title: 'Bermuda Clocktower & Factory',
    tag: 'Match Banner',
    aspectRatio: '16:9',
    url: bermudaBanner,
    description: 'Sunset island drop zone with clocktower, factory complex, and descending airdrop',
  },
  {
    id: 'clash-squad-shipyard',
    title: 'Clash Squad 4v4 Shipyard',
    tag: 'Match Banner',
    aspectRatio: '16:9',
    url: clashSquadBanner,
    description: 'High-contrast cyan & fiery orange laser shootout between industrial shipping containers',
  },
  {
    id: 'purgatory-canyon',
    title: 'Purgatory Canyon Ziplines',
    tag: 'Match Banner',
    aspectRatio: '16:9',
    url: purgatoryBanner,
    description: 'Suspended ziplines and bridge combat over deep mountain canyon under fiery clouds',
  },
  {
    id: 'avatar-pro',
    title: 'Esports Pro Visor Avatar',
    tag: 'Player Avatar',
    aspectRatio: '1:1',
    url: avatarPro,
    description: 'Gamer mascot with headset and glowing amber holographic visor',
  },
];

interface AdminMediaProps {
  currentUser: User;
  onPhotosUpdated?: () => void;
}

export const AdminMedia: React.FC<AdminMediaProps> = ({ currentUser, onPhotosUpdated }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => storage.getSiteSettings());
  const [tournaments, setTournaments] = useState<Tournament[]>(() => storage.getTournaments());
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'TOURNAMENTS' | 'GALLERY'>('GLOBAL');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal for editing a specific photo target
  const [editingTarget, setEditingTarget] = useState<{
    type: 'HERO_BANNER' | 'GAME_POSTER' | 'TOURNAMENT_BANNER';
    tournamentId?: string;
    title: string;
    currentUrl: string;
  } | null>(null);

  const [inputUrl, setInputUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const canEdit = hasPermission(currentUser, 'tournaments.edit') || hasPermission(currentUser, 'settings.site');

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // Open the photo change modal
  const handleOpenEditor = (
    type: 'HERO_BANNER' | 'GAME_POSTER' | 'TOURNAMENT_BANNER',
    title: string,
    currentUrl: string,
    tournamentId?: string
  ) => {
    setEditingTarget({ type, title, currentUrl, tournamentId });
    setInputUrl(currentUrl);
    setPreviewUrl(currentUrl);
  };

  // Handle local file upload via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file (JPG, PNG, WEBP)');
      return;
    }

    // Check size limit (max 3MB for localStorage capacity)
    if (file.size > 3.5 * 1024 * 1024) {
      showError('Image file is too large (max 3.5 MB). Please choose a compressed image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setInputUrl(base64);
        setPreviewUrl(base64);
      }
    };
    reader.onerror = () => {
      showError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  // Save the selected photo
  const handleSavePhoto = () => {
    if (!editingTarget) return;
    if (!previewUrl.trim()) {
      showError('Please provide a photo URL or upload an image');
      return;
    }

    try {
      if (editingTarget.type === 'HERO_BANNER') {
        storage.updateSiteSettings({ heroBannerUrl: previewUrl }, currentUser.id);
        setSiteSettings(storage.getSiteSettings());
        showToast('Hero panoramic background updated successfully!');
      } else if (editingTarget.type === 'GAME_POSTER') {
        storage.updateSiteSettings({ gamePosterUrl: previewUrl }, currentUser.id);
        setSiteSettings(storage.getSiteSettings());
        showToast('Game poster cover updated successfully!');
      } else if (editingTarget.type === 'TOURNAMENT_BANNER' && editingTarget.tournamentId) {
        storage.updateTournament(editingTarget.tournamentId, { bannerUrl: previewUrl }, currentUser.id);
        setTournaments(storage.getTournaments());
        showToast(`Tournament banner for "${editingTarget.title}" updated successfully!`);
      }

      setEditingTarget(null);
      if (onPhotosUpdated) onPhotosUpdated();
    } catch (err: any) {
      showError(err?.message || 'Failed to update photo');
    }
  };

  // Reset target photo to default artwork
  const handleResetToDefault = (type: 'HERO_BANNER' | 'GAME_POSTER' | 'TOURNAMENT_BANNER', tournamentId?: string) => {
    if (!window.confirm('Reset this photo back to the default high-definition artwork?')) return;

    try {
      if (type === 'HERO_BANNER') {
        storage.updateSiteSettings({ heroBannerUrl: heroBooyahEpic }, currentUser.id);
        setSiteSettings(storage.getSiteSettings());
        showToast('Hero banner restored to default!');
      } else if (type === 'GAME_POSTER') {
        storage.updateSiteSettings({ gamePosterUrl: ffGamePoster }, currentUser.id);
        setSiteSettings(storage.getSiteSettings());
        showToast('Game poster restored to default!');
      } else if (type === 'TOURNAMENT_BANNER' && tournamentId) {
        // Find default banner based on map or id
        const tour = tournaments.find((t) => t.id === tournamentId);
        const defaultBanner = tour?.map === 'BERMUDA' ? bermudaBanner :
          tour?.matchType === 'CLASH_SQUAD' ? clashSquadBanner :
          tour?.map === 'PURGATORY' ? purgatoryBanner : heroBooyahEpic;

        storage.updateTournament(tournamentId, { bannerUrl: defaultBanner }, currentUser.id);
        setTournaments(storage.getTournaments());
        showToast('Tournament banner restored to default!');
      }

      if (onPhotosUpdated) onPhotosUpdated();
    } catch (err: any) {
      showError(err?.message || 'Failed to reset photo');
    }
  };

  const currentHeroBanner = siteSettings.heroBannerUrl || heroBooyahEpic;
  const currentGamePoster = siteSettings.gamePosterUrl || ffGamePoster;

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Page Title & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6A00] uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4 text-[#FF6A00]" />
            Visual Assets & Graphics Engine
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-white flex items-center gap-2">
            <span>Media & Photos Manager</span>
            <span className="text-xs font-score font-bold bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40 px-2.5 py-0.5 rounded-full">
              Live Customizer
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Change any image across the platform. Upload local files, choose from built-in high-octane esports presets, or link external graphics.
          </p>
        </div>

        {/* Global Action Chips */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Reset ALL platform banners and tournament photos back to initial defaults?')) {
                storage.updateSiteSettings({
                  heroBannerUrl: heroBooyahEpic,
                  gamePosterUrl: ffGamePoster,
                }, currentUser.id);
                setSiteSettings(storage.getSiteSettings());
                showToast('All global photos restored to original high-res defaults!');
                if (onPhotosUpdated) onPhotosUpdated();
              }
            }}
            className="px-3.5 py-2 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1.5"
            title="Reset All Photos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All to Default</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-950/70 border border-rose-500/80 rounded-xl text-xs text-rose-300 flex items-center gap-2.5 shadow-lg animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('GLOBAL')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'GLOBAL'
              ? 'bg-[#FF6A00] text-black shadow-[0_0_15px_rgba(255,106,0,0.4)]'
              : 'bg-[#151924] text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Hero & Global Banners (2)</span>
        </button>

        <button
          onClick={() => setActiveTab('TOURNAMENTS')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'TOURNAMENTS'
              ? 'bg-[#FF6A00] text-black shadow-[0_0_15px_rgba(255,106,0,0.4)]'
              : 'bg-[#151924] text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Tournament Match Banners ({tournaments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('GALLERY')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'GALLERY'
              ? 'bg-[#FF6A00] text-black shadow-[0_0_15px_rgba(255,106,0,0.4)]'
              : 'bg-[#151924] text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Esports Preset Library ({MEDIA_PRESETS.length})</span>
        </button>
      </div>

      {/* TAB 1: GLOBAL HERO & COVER PHOTOS */}
      {activeTab === 'GLOBAL' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hero Panoramic Banner (Spans 2 columns) */}
            <div className="lg:col-span-2 bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-score font-bold uppercase tracking-wider text-amber-400 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
                      16:9 Panoramic
                    </span>
                    <h3 className="font-display text-base font-bold text-white uppercase">
                      Main Hero Background Banner
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Displayed prominently at the top of the Homepage and Tournaments hub.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResetToDefault('HERO_BANNER')}
                    className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition-colors"
                    title="Restore Default Artwork"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditor('HERO_BANNER', 'Hero Panoramic Banner', currentHeroBanner)}
                    className="px-3.5 py-1.5 bg-[#FF6A00] hover:bg-[#FF8800] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Change Photo</span>
                  </button>
                </div>
              </div>

              {/* Preview Window */}
              <div className="relative h-64 sm:h-80 w-full bg-black overflow-hidden group">
                <img
                  src={currentHeroBanner}
                  alt="Current Hero Banner"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-zinc-300">
                  <span className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded border border-zinc-700/80 font-mono text-[11px] truncate max-w-sm">
                    {currentHeroBanner.startsWith('data:') ? 'Custom Uploaded Image (Base64)' : currentHeroBanner}
                  </span>
                  <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                    Active on Home
                  </span>
                </div>
              </div>
            </div>

            {/* Game Cover Poster (1 column) */}
            <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-score font-bold uppercase tracking-wider text-cyan-400 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      3:4 Portrait
                    </span>
                    <h3 className="font-display text-base font-bold text-white uppercase">
                      Hero Game Poster
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Vertical hero box art icon in hero section.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleResetToDefault('GAME_POSTER')}
                    className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs transition-colors"
                    title="Restore Default"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditor('GAME_POSTER', 'Hero Game Poster', currentGamePoster)}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Change</span>
                  </button>
                </div>
              </div>

              {/* Preview Window */}
              <div className="relative h-64 sm:h-80 w-full bg-black overflow-hidden flex items-center justify-center p-4 group">
                <div className="w-40 h-56 sm:w-44 sm:h-64 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 relative">
                  <img
                    src={currentGamePoster}
                    alt="Current Game Poster"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <span className="text-[9px] font-score font-black tracking-widest text-amber-300 uppercase bg-black/80 px-1.5 py-0.5 rounded block">
                      GARENA FF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOURNAMENT MATCH BANNERS */}
      {activeTab === 'TOURNAMENTS' && (
        <div className="space-y-4">
          <div className="bg-[#11141c] border border-zinc-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-sm font-bold uppercase text-white">
                Tournament Banners Directory
              </h3>
              <p className="text-xs text-zinc-400">
                Each tournament card and match row uses its own tailored banner graphic. Update individual matches below.
              </p>
            </div>
            <span className="text-xs text-amber-400 font-score font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              {tournaments.length} Active Tournaments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-[#14141F] border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all flex flex-col justify-between"
              >
                {/* Banner Thumbnail */}
                <div className="relative h-44 w-full bg-zinc-900 overflow-hidden group">
                  <img
                    src={tournament.bannerUrl}
                    alt={tournament.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14141F] via-[#14141F]/30 to-transparent" />

                  {/* Mode & Map Chips */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-amber-500/40">
                      {tournament.map}
                    </span>
                    <span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-cyan-400 border border-cyan-500/40">
                      {tournament.mode}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tournament.status === 'LIVE' ? 'bg-rose-600 text-white animate-pulse' :
                      tournament.status === 'OPEN' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {tournament.status}
                    </span>
                  </div>
                </div>

                {/* Tournament Info & Action Bar */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-display text-base font-bold text-white truncate">
                      {tournament.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      {tournament.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleResetToDefault('TOURNAMENT_BANNER', tournament.id)}
                      className="px-2.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs transition-colors flex items-center gap-1"
                      title="Reset Banner"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditor('TOURNAMENT_BANNER', tournament.title, tournament.bannerUrl, tournament.id)}
                      className="px-4 py-1.5 bg-gradient-to-r from-[#FF6A00] to-amber-500 hover:brightness-110 text-black font-extrabold text-xs rounded-lg transition-all shadow-[0_0_12px_rgba(255,106,0,0.4)] flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Change Banner</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ESPORTS PRESET GALLERY */}
      {activeTab === 'GALLERY' && (
        <div className="space-y-4">
          <div className="bg-[#11141c] border border-zinc-800/80 rounded-xl p-4">
            <h3 className="font-display text-sm font-bold uppercase text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFC107]" />
              Esports Preset Library
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Select any of these high-fidelity graphics to apply directly as the Hero background, poster cover, or tournament match banners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MEDIA_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="bg-[#14141F] border border-zinc-800 hover:border-amber-500/50 rounded-xl overflow-hidden transition-all group flex flex-col justify-between"
              >
                <div className="relative h-44 w-full bg-black overflow-hidden">
                  <img
                    src={preset.url}
                    alt={preset.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-black/80 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                      {preset.tag}
                    </span>
                    <span className="bg-black/80 text-zinc-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {preset.aspectRatio}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-display text-sm font-bold text-white">
                      {preset.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                      {preset.description}
                    </p>
                  </div>

                  {/* Apply Actions */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center gap-2">
                    <button
                      onClick={() => {
                        storage.updateSiteSettings({ heroBannerUrl: preset.url }, currentUser.id);
                        setSiteSettings(storage.getSiteSettings());
                        showToast(`"${preset.title}" set as Hero Panoramic Banner!`);
                        if (onPhotosUpdated) onPhotosUpdated();
                      }}
                      className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-[11px] font-bold transition-colors text-center"
                    >
                      Set as Hero
                    </button>
                    <button
                      onClick={() => {
                        storage.updateSiteSettings({ gamePosterUrl: preset.url }, currentUser.id);
                        setSiteSettings(storage.getSiteSettings());
                        showToast(`"${preset.title}" set as Cover Poster!`);
                        if (onPhotosUpdated) onPhotosUpdated();
                      }}
                      className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-[11px] font-bold transition-colors text-center"
                    >
                      Set as Poster
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHOTO EDITING / UPLOAD MODAL */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141F] border border-zinc-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-5 animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-score font-bold uppercase tracking-wider text-[#FF6A00] block">
                  Change Photo
                </span>
                <h3 className="font-display text-lg font-bold text-white">
                  {editingTarget.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingTarget(null)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-5 space-y-4">
              {/* Live Preview Container */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block flex items-center justify-between">
                  <span>Live Preview</span>
                  <span className="text-[11px] text-zinc-500 font-normal">Shows how it appears in the app</span>
                </label>
                <div className="relative h-48 sm:h-52 w-full bg-black rounded-xl overflow-hidden border border-zinc-700 flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={() => {
                        showError('Invalid image URL or failed to load image');
                      }}
                    />
                  ) : (
                    <div className="text-center text-zinc-500 text-xs">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                      <span>No image selected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Option A: Local File Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Option 1: Upload from Device (File)
                </label>
                <label className="w-full border-2 border-dashed border-zinc-700 hover:border-[#FF6A00] rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-900/50 hover:bg-zinc-900">
                  <Upload className="w-5 h-5 text-[#FF6A00] mb-1" />
                  <span className="text-xs font-semibold text-white">Click to Browse Local Photo</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Supports JPG, PNG, WebP (Max 3.5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option B: Choose from Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Option 2: Pick from Built-in Esports Presets
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {MEDIA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setInputUrl(preset.url);
                        setPreviewUrl(preset.url);
                      }}
                      className={`relative rounded-lg overflow-hidden border transition-all h-14 ${
                        previewUrl === preset.url
                          ? 'border-[#FF6A00] ring-2 ring-[#FF6A00]'
                          : 'border-zinc-700 opacity-70 hover:opacity-100'
                      }`}
                      title={preset.title}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Option C: Direct Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Option 3: Or Paste Direct Image URL
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg or /src/assets/images/..."
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-zinc-800 flex items-center justify-end gap-3 bg-zinc-900/60">
              <button
                type="button"
                onClick={() => setEditingTarget(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={!previewUrl}
                className="px-6 py-2 bg-gradient-to-r from-[#FF6A00] to-amber-500 hover:brightness-110 disabled:opacity-50 text-black font-extrabold text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(255,106,0,0.5)] flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save & Apply Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
