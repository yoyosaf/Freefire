import { PointsConfig } from '../types';

export const DEFAULT_POINTS_CONFIG: PointsConfig = {
  placement_points: {
    '1': 12,
    '2': 9,
    '3': 8,
    '4': 7,
    '5': 6,
    '6': 5,
    '7': 4,
    '8': 3,
    '9': 2,
    '10': 1,
    '11': 0,
    '12': 0,
  },
  kill_points: 1,
};

export function calcPoints(placement: number, kills: number, cfg: PointsConfig = DEFAULT_POINTS_CONFIG): number {
  const p = cfg.placement_points[String(placement)] ?? 0;
  return p + kills * (cfg.kill_points ?? 1);
}

/**
 * Format currency in Bangladeshi Taka (৳)
 */
export function formatBDT(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/**
 * Format date in Bangladesh Standard Time (Asia/Dhaka - UTC+6)
 */
export function formatBangladeshTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date) + ' BST';
  } catch {
    return isoString;
  }
}

/**
 * Format relative time (e.g. "Starts in 2h 15m" or "10m ago")
 */
export function getRelativeTime(isoString: string): string {
  try {
    const diff = new Date(isoString).getTime() - Date.now();
    const isPast = diff < 0;
    const absDiff = Math.abs(diff);

    const minutes = Math.floor(absDiff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return isPast ? `${days}d ago` : `in ${days}d ${hours % 24}h`;
    if (hours > 0) return isPast ? `${hours}h ago` : `in ${hours}h ${minutes % 60}m`;
    if (minutes > 0) return isPast ? `${minutes}m ago` : `in ${minutes}m`;
    return isPast ? 'Just now' : 'Starting shortly';
  } catch {
    return '';
  }
}
