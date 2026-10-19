import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Ban, 
  CheckCircle, 
  ShieldAlert, 
  Wallet,
  Phone
} from 'lucide-react';
import { User } from '../../types';
import { storage } from '../../lib/storage';
import { formatBDT, formatBangladeshTime } from '../../lib/points';
import { hasPermission } from '../../lib/permissions';

interface AdminUsersProps {
  currentUser: User;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const canBan = hasPermission(currentUser, 'users.ban');

  const filtered = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.ffUid && u.ffUid.includes(q)) ||
      (u.ffIgn && u.ffIgn.toLowerCase().includes(q))
    );
  });

  const handleToggleBan = (u: User) => {
    if (!canBan) return;
    try {
      storage.toggleBanUser(u.id, currentUser.id);
      setUsers(storage.getUsers());
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      alert(err?.message || 'Error updating ban status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Free Fire Player Directory
          </h1>
          <p className="text-xs text-zinc-400">
            Audit player Free Fire UIDs, in-game tags, wallet balances, and enforce anti-cheat bans
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#14141F] border border-zinc-800 p-4 rounded-xl cut-corner flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by player name, phone, email, or Free Fire UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
          />
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          Showing {filtered.length} of {users.length} profiles
        </span>
      </div>

      {/* Table */}
      <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-score">
              <tr>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Free Fire UID & IGN</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{u.displayName}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{u.email}</span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-score text-amber-400 font-bold block">{u.ffUid || 'Not Set'}</span>
                    <span className="text-[11px] text-zinc-300 font-mono">{u.ffIgn || '—'}</span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-zinc-300">
                    {u.phone}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-score text-emerald-400 font-bold">
                    {formatBDT(u.walletBalance)}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      u.role === 'SUPER_ADMIN' ? 'bg-amber-500/20 text-amber-300' :
                      u.role === 'MODERATOR' ? 'bg-cyan-500/20 text-cyan-300' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {u.isBanned ? (
                      <span className="bg-red-950/80 text-red-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-red-700/60">
                        BANNED
                      </span>
                    ) : (
                      <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-emerald-700/60">
                        ACTIVE
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {u.role !== 'SUPER_ADMIN' && canBan && (
                      <button
                        onClick={() => handleToggleBan(u)}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
                          u.isBanned
                            ? 'bg-zinc-800 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-700/40'
                            : 'bg-zinc-800 text-red-400 hover:bg-red-900/40 border border-red-700/40'
                        }`}
                      >
                        <Ban className="w-3 h-3" />
                        {u.isBanned ? 'Lift Ban' : 'Ban Cheater'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
