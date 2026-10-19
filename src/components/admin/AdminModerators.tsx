import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Power, 
  Key, 
  Check, 
  X, 
  AlertCircle, 
  Lock,
  Edit,
  Shield
} from 'lucide-react';
import { User } from '../../types';
import { storage } from '../../lib/storage';
import { PERMISSION_GROUPS, PERMISSION_PRESETS, Permission, PERMISSIONS } from '../../lib/permissions';

interface AdminModeratorsProps {
  currentUser: User;
}

export const AdminModerators: React.FC<AdminModeratorsProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [isAdding, setIsAdding] = useState(false);
  const [editingModId, setEditingModId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('PAYMENT_MODERATOR');
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([
    ...PERMISSION_PRESETS.PAYMENT_MODERATOR.permissions,
  ]);
  const [confirmPassword, setConfirmPassword] = useState('');

  const moderators = users.filter((u) => u.role === 'MODERATOR' || u.role === 'SUPER_ADMIN');

  const handlePresetSelect = (presetKey: string) => {
    setSelectedPreset(presetKey);
    if (presetKey === 'CUSTOM') {
      return;
    }
    const preset = PERMISSION_PRESETS[presetKey];
    if (preset) {
      setSelectedPermissions([...preset.permissions]);
    }
  };

  const togglePermission = (permKey: Permission) => {
    setSelectedPreset('CUSTOM');
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const handleToggleActive = (mod: User) => {
    try {
      storage.toggleModeratorActive(mod.id, currentUser.id);
      setUsers(storage.getUsers());
      setSuccess(`Moderator ${mod.displayName} status toggled.`);
    } catch (err: any) {
      setError(err?.message || 'Error updating moderator');
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingModId(null);
    setDisplayName('');
    setEmail('');
    setPhone('');
    setSelectedPreset('PAYMENT_MODERATOR');
    setSelectedPermissions([...PERMISSION_PRESETS.PAYMENT_MODERATOR.permissions]);
    setConfirmPassword('');
    setError(null);
  };

  const startEdit = (mod: User) => {
    setEditingModId(mod.id);
    setDisplayName(mod.displayName);
    setEmail(mod.email);
    setPhone(mod.phone || '');
    setSelectedPreset('CUSTOM');
    setSelectedPermissions((mod.permissions as Permission[]) || []);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!confirmPassword) {
      setError('Please verify your Super Admin master password to authorize staff changes.');
      return;
    }

    try {
      if (editingModId) {
        storage.updateModeratorPermissions(editingModId, selectedPermissions, currentUser.id);
        setSuccess('Staff permissions updated successfully!');
      } else {
        storage.addModerator(
          displayName.trim(),
          email.trim(),
          phone.trim(),
          selectedPermissions,
          currentUser.id
        );
        setSuccess(`New moderator account for ${displayName} was created.`);
      }

      setUsers(storage.getUsers());
      resetForm();
    } catch (err: any) {
      setError(err?.message || 'Error saving moderator');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
            Staff & Moderator RBAC Management
          </h1>
          <p className="text-xs text-zinc-400">
            Configure granular staff roles, payment authorization ceilings, and permission presets
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-[#FF6A00] hover:bg-[#FF8800] text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(255,106,0,0.3)] cut-corner flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> + Add Moderator
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

      {/* Add / Edit Form */}
      {isAdding && (
        <div className="bg-[#14141F] border border-amber-500/50 rounded-xl p-5 cut-corner shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF6A00]" />
              {editingModId ? 'Edit Moderator Permissions' : 'Onboard New Staff Moderator'}
            </h3>
            <button
              onClick={resetForm}
              className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Full Name / Alias <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Farhan Ahmed"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={Boolean(editingModId)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Staff Email <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="email"
                  placeholder="mod@booyah.gg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={Boolean(editingModId)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Role Preset Template
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-amber-400 font-semibold focus:outline-none focus:border-[#FF6A00]"
                >
                  <option value="PAYMENT_MODERATOR">Payment Moderator</option>
                  <option value="MATCH_MODERATOR">Match Moderator</option>
                  <option value="SUPPORT_MODERATOR">Support Moderator</option>
                  <option value="SENIOR_MODERATOR">Senior Moderator</option>
                  <option value="CUSTOM">Custom Permissions</option>
                </select>
              </div>
            </div>

            {/* Granular Permission Checkboxes Grouped by Category (Spec 19.3) */}
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wide block mb-2">
                Granular Permissions ({selectedPermissions.length} granted)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 max-h-72 overflow-y-auto">
                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
                  <div key={groupKey} className="space-y-1.5 p-2 bg-black/40 rounded-lg border border-zinc-800/80">
                    <span className="text-[11px] font-bold text-[#FF6A00] uppercase block border-b border-zinc-800 pb-1">
                      {group.label}
                    </span>
                    <div className="space-y-1 pt-1">
                      {group.permissions.map((p) => {
                        const checked = selectedPermissions.includes(p.key);
                        return (
                          <label
                            key={p.key}
                            className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(p.key)}
                              className="rounded border-zinc-700 text-[#FF6A00] focus:ring-[#FF6A00]"
                            />
                            <span className="truncate">{p.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Password Re-entry */}
            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex-1">
                <label className="text-[11px] text-amber-200 block font-semibold mb-1">
                  Super Admin Password Re-Verification
                </label>
                <input
                  type="password"
                  placeholder="Enter your administrative password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#FF6A00] hover:bg-[#FF8800] text-black shadow-lg"
              >
                {editingModId ? 'Update Permissions' : 'Create Staff Moderator'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Moderators List */}
      <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-score">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Active Status</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {moderators.map((mod) => {
                const isOwner = mod.role === 'SUPER_ADMIN';
                return (
                  <tr key={mod.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-amber-400">
                          {mod.displayName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{mod.displayName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{mod.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isOwner ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {mod.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {mod.isActive ? (
                        <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-emerald-700/60">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="bg-red-950/80 text-red-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-red-700/60">
                          DISABLED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isOwner ? (
                        <span className="text-amber-400 font-semibold text-[11px]">Full System Unrestricted Access</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {mod.permissions.slice(0, 4).map((p) => (
                            <span key={p} className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
                              {p.split('.')[1]}
                            </span>
                          ))}
                          {mod.permissions.length > 4 && (
                            <span className="text-[10px] text-zinc-500">
                              +{mod.permissions.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {!isOwner && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startEdit(mod)}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            title="Edit permissions"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(mod)}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              mod.isActive ? 'bg-zinc-800 text-zinc-400 hover:text-red-400' : 'bg-emerald-900/60 text-emerald-300'
                            }`}
                            title={mod.isActive ? 'Disable account' : 'Re-enable account'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
