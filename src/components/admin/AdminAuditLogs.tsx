import React, { useState } from 'react';
import { ClipboardList, ShieldAlert, Search, Clock } from 'lucide-react';
import { User, AuditLog } from '../../types';
import { storage } from '../../lib/storage';
import { formatBangladeshTime } from '../../lib/points';

interface AdminAuditLogsProps {
  currentUser: User;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = () => {
  const [logs] = useState<AuditLog[]>(() => storage.getAuditLogs());
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = logs.filter((log) => {
    if (filterAction !== 'ALL' && log.action !== filterAction) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const actions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Immutable Staff Audit Trail
        </h1>
        <p className="text-xs text-zinc-400">
          Permanent chronological log of all room credentials releases, payment approvals, result edits, and settings modifications.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-[#14141F] border border-zinc-800 p-4 rounded-xl cut-corner flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-zinc-400 font-semibold uppercase">Filter Action:</label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF6A00]"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#14141F] border border-zinc-800 rounded-xl overflow-hidden cut-corner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/70 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800 font-score">
              <tr>
                <th className="py-3 px-4">Timestamp (BST)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-zinc-400">
                    {formatBangladeshTime(log.createdAt)}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-sans font-bold text-white">
                    {log.actorName}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="bg-zinc-900 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap font-sans text-zinc-300">
                    {log.entityType}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-zinc-500 text-[11px]">
                    {log.entityId}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap text-zinc-400">
                    {log.ipAddress}
                  </td>

                  <td className="py-3 px-4 text-right text-zinc-400 font-sans text-[11px]">
                    {log.newValue ? JSON.stringify(log.newValue).substring(0, 35) + '...' : '—'}
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
