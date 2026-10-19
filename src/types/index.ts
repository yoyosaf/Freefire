export type Role = 'PLAYER' | 'ADMIN' | 'SUPER_ADMIN' | 'MODERATOR';

export type TournamentMode = 'SOLO' | 'DUO' | 'SQUAD';
export type TournamentMap = 'BERMUDA' | 'PURGATORY' | 'KALAHARI' | 'ALPINE' | 'NEXTERRA';
export type MatchType = 'BR_RANKED' | 'CLASH_SQUAD' | 'LONE_WOLF';
export type TournamentStatus = 'DRAFT' | 'OPEN' | 'FULL' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export type RegStatus = 
  | 'PENDING_PAYMENT' 
  | 'PAYMENT_SUBMITTED' 
  | 'CONFIRMED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export type PaymentMethod = 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY' | 'WALLET';
export type PaymentStatus = 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'REFUNDED';
export type AccountType = 'PERSONAL' | 'AGENT' | 'MERCHANT';

export type WalletTxType = 'PRIZE' | 'REFUND' | 'WITHDRAWAL' | 'ENTRY_FEE';
export type WithdrawalStatus = 'REQUESTED' | 'PAID' | 'REJECTED';

export interface PointsConfig {
  placement_points: Record<string, number>;
  kill_points: number;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  displayName: string;
  ffUid: string;
  ffIgn: string;
  avatarUrl: string;
  role: Role;
  permissions: string[];
  walletBalance: number;
  isBanned: boolean;
  isActive: boolean;
  mustChangePassword?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  createdBy?: string;
  lastLoginAt?: string;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  mode: TournamentMode;
  map: TournamentMap;
  matchType: MatchType;
  entryFee: number;
  prizePool: number;
  prizeDistribution: Record<string, number>;
  perKillPrize?: number;
  maxSlots: number;
  filledSlots: number;
  startsAt: string; // ISO date string (in UTC, displayed in BD time)
  registrationClosesAt: string;
  status: TournamentStatus;
  roomId?: string | null;
  roomPassword?: string | null;
  roomReleasedAt?: string | null;
  rules: string;
  pointsConfig: PointsConfig;
  createdBy: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  tournamentId: string;
  userId: string;
  teamId?: string | null;
  teamName?: string;
  slotNumber?: number | null;
  status: RegStatus;
  paymentId?: string | null;
  holdExpiresAt?: string | null;
  createdAt: string;
  // Joined fields for display
  userDisplayName?: string;
  ffUid?: string;
  ffIgn?: string;
  phone?: string;
}

export interface Payment {
  id: string;
  registrationId: string;
  tournamentId: string;
  userId: string;
  method: PaymentMethod;
  amount: number;
  senderNumber: string;
  trxId: string;
  screenshotUrl?: string;
  status: PaymentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectReason?: string;
  paidToAccount?: string;
  createdAt: string;
  // joined fields
  userDisplayName?: string;
  tournamentTitle?: string;
}

export interface PaymentAccount {
  id: string;
  method: 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY';
  label: string;
  accountNumber: string;
  accountName?: string;
  accountType: AccountType;
  instructions: string;
  minAmount?: number;
  maxAmount?: number;
  displayOrder: number;
  isActive: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface MatchResult {
  id: string;
  tournamentId: string;
  registrationId: string;
  placement: number;
  kills: number;
  points: number;
  screenshotUrl?: string;
  // Joined fields
  userId: string;
  displayName: string;
  ffIgn: string;
  slotNumber: number;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTxType;
  amount: number;
  tournamentId?: string;
  tournamentTitle?: string;
  note: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: 'BKASH' | 'NAGAD' | 'ROCKET';
  accountNumber: string;
  status: WithdrawalStatus;
  paidTrxId?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectReason?: string;
  // joined fields
  userDisplayName?: string;
  userPhone?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  announcementBanner: string;
  supportPhone: string;
  supportWhatsapp: string;
  supportTelegram: string;
  contactEmail: string;
  minimumWithdrawalAmount: number;
  rulesContent: string;
  termsContent: string;
  refundPolicyContent: string;
  heroBannerUrl?: string;
  gamePosterUrl?: string;
  logoUrl?: string;
}
