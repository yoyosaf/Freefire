import React, { useState } from 'react';
import { Settings, Save, CheckCircle, Bell, MessageSquare, Phone } from 'lucide-react';
import { User, SiteSettings } from '../../types';
import { storage } from '../../lib/storage';
import { hasPermission } from '../../lib/permissions';

interface AdminSettingsProps {
  currentUser: User;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => storage.getSiteSettings());
  const [success, setSuccess] = useState(false);

  const canEdit = hasPermission(currentUser, 'settings.site');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    storage.updateSiteSettings(settings, currentUser.id);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Platform Configuration & Announcements
        </h1>
        <p className="text-xs text-zinc-400">
          Set live broadcast announcements, player support contact channels, and payout thresholds
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-600 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Platform settings updated and broadcasted across all user sessions.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Site Branding & Announcement */}
        <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-5 cut-corner space-y-4">
          <h3 className="font-display text-sm font-bold uppercase text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FF6A00]" />
            Announcement Bar & Site Branding
          </h3>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Top Announcement Ticker (Broadcasted to all players)
            </label>
            <input
              type="text"
              value={settings.announcementBanner}
              onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Minimum Cash Withdrawal (BDT ৳)
              </label>
              <input
                type="number"
                min="50"
                step="10"
                value={settings.minimumWithdrawalAmount}
                onChange={(e) => setSettings({ ...settings, minimumWithdrawalAmount: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-score focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>
        </div>

        {/* Support & Community Contact Links */}
        <div className="bg-[#14141F] border border-zinc-800 rounded-xl p-5 cut-corner space-y-4">
          <h3 className="font-display text-sm font-bold uppercase text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#FFC107]" />
            Official Support Contacts (Bangladesh)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                WhatsApp Support Link
              </label>
              <input
                type="text"
                value={settings.supportWhatsapp}
                onChange={(e) => setSettings({ ...settings, supportWhatsapp: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Telegram Channel Link
              </label>
              <input
                type="text"
                value={settings.supportTelegram}
                onChange={(e) => setSettings({ ...settings, supportTelegram: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-xs font-extrabold bg-[#FF6A00] hover:bg-[#FF8800] text-black shadow-lg flex items-center gap-1.5 cut-corner"
            >
              <Save className="w-4 h-4" /> Save Platform Configuration
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
