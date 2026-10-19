import { User } from '../types';

export const PERMISSIONS = [
  'tournaments.view',
  'tournaments.create',
  'tournaments.edit',
  'tournaments.cancel',
  'tournaments.release_room',
  'registrations.view',
  'registrations.manage',
  'payments.view',
  'payments.verify',
  'payments.refund',
  'results.enter',
  'results.edit',
  'results.publish',
  'withdrawals.view',
  'withdrawals.process',
  'users.view',
  'users.ban',
  'users.edit',
  'announcements.manage',
  'support.reply',
  'settings.payment_accounts',
  'settings.site',
  'audit.view',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_GROUPS: Record<string, { label: string; permissions: { key: Permission; label: string }[] }> = {
  Tournaments: {
    label: 'Tournaments',
    permissions: [
      { key: 'tournaments.view', label: 'View Tournaments' },
      { key: 'tournaments.create', label: 'Create Tournaments' },
      { key: 'tournaments.edit', label: 'Edit Tournaments' },
      { key: 'tournaments.cancel', label: 'Cancel Tournaments (Refunds)' },
      { key: 'tournaments.release_room', label: 'Release Room ID & Password' },
    ],
  },
  Registrations: {
    label: 'Registrations',
    permissions: [
      { key: 'registrations.view', label: 'View Player Lists & Slots' },
      { key: 'registrations.manage', label: 'Move / Add / Remove Player Slots' },
    ],
  },
  Payments: {
    label: 'Payments',
    permissions: [
      { key: 'payments.view', label: 'View Payment Submissions' },
      { key: 'payments.verify', label: 'Approve or Reject Payments' },
      { key: 'payments.refund', label: 'Refund Payments' },
    ],
  },
  Results: {
    label: 'Results & Points',
    permissions: [
      { key: 'results.enter', label: 'Enter Placement & Kills' },
      { key: 'results.edit', label: 'Edit Results' },
      { key: 'results.publish', label: 'Publish Results & Credit Prizes' },
    ],
  },
  Wallet: {
    label: 'Wallet & Withdrawals',
    permissions: [
      { key: 'withdrawals.view', label: 'View Withdrawal Requests' },
      { key: 'withdrawals.process', label: 'Mark Withdrawals Paid or Rejected' },
    ],
  },
  Users: {
    label: 'Users & Bans',
    permissions: [
      { key: 'users.view', label: 'Search & View Players' },
      { key: 'users.ban', label: 'Ban or Unban Players' },
      { key: 'users.edit', label: "Edit Player's Profile / FF UID" },
    ],
  },
  Support: {
    label: 'Support & Announcements',
    permissions: [
      { key: 'announcements.manage', label: 'Manage Banners & Announcements' },
      { key: 'support.reply', label: 'Reply to Player Inquiries' },
    ],
  },
  Settings: {
    label: 'Settings & Security',
    permissions: [
      { key: 'settings.payment_accounts', label: 'Manage bKash/Nagad/Rocket Numbers' },
      { key: 'settings.site', label: 'Site Name, Rules & Branding' },
    ],
  },
  Audit: {
    label: 'Audit Logs',
    permissions: [{ key: 'audit.view', label: 'View Immutable Audit Logs' }],
  },
};

export const PERMISSION_PRESETS: Record<string, { name: string; description: string; permissions: Permission[] }> = {
  PAYMENT_MODERATOR: {
    name: 'Payment Moderator',
    description: 'Verifies incoming bKash, Nagad, Rocket payments and slots',
    permissions: ['payments.view', 'payments.verify', 'registrations.view'],
  },
  MATCH_MODERATOR: {
    name: 'Match Moderator',
    description: 'Releases room IDs/passwords and enters match kills/placements',
    permissions: ['tournaments.view', 'tournaments.release_room', 'registrations.view', 'results.enter'],
  },
  SUPPORT_MODERATOR: {
    name: 'Support Moderator',
    description: 'Assists users and manages community announcements',
    permissions: ['users.view', 'registrations.view', 'announcements.manage', 'support.reply'],
  },
  SENIOR_MODERATOR: {
    name: 'Senior Moderator',
    description: 'Full tournament and user management access (excluding banking settings)',
    permissions: [
      'tournaments.view',
      'tournaments.create',
      'tournaments.edit',
      'tournaments.cancel',
      'tournaments.release_room',
      'registrations.view',
      'registrations.manage',
      'payments.view',
      'payments.verify',
      'results.enter',
      'results.edit',
      'results.publish',
      'withdrawals.view',
      'users.view',
      'users.ban',
      'users.edit',
      'announcements.manage',
      'support.reply',
      'audit.view',
    ],
  },
};

export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user || user.isBanned || !user.isActive) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'MODERATOR' || user.role === 'ADMIN') {
    return user.permissions?.includes(permission) ?? false;
  }
  return false;
}
