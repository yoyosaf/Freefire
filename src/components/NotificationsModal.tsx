import React from 'react';
import { X, Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { Notification } from '../types';
import { getRelativeTime } from '../lib/points';

interface NotificationsModalProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (link: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#14141F] border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden mt-12 sm:mt-14 cut-corner flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FF6A00]" />
            <h3 className="font-display text-base font-bold uppercase tracking-wide text-white">
              Notifications
            </h3>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="bg-[#FF6A00] text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Read All
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-zinc-800/80 overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No notifications yet. You will get alerts for room credentials and prize winnings here!
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) onMarkRead(notif.id);
                  if (notif.link) {
                    onNavigate(notif.link);
                    onClose();
                  }
                }}
                className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                  notif.isRead ? 'bg-transparent hover:bg-zinc-900/50' : 'bg-amber-950/20 hover:bg-amber-950/30'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.isRead ? 'bg-zinc-700' : 'bg-[#FF6A00]'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold ${notif.isRead ? 'text-zinc-300' : 'text-white'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-zinc-400 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {notif.body}
                  </p>
                  {notif.link && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#FF6A00] mt-1.5 font-semibold">
                      View Details <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
