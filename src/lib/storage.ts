import { 
  User, 
  Tournament, 
  Registration, 
  Payment, 
  PaymentAccount, 
  MatchResult, 
  WalletTransaction, 
  Withdrawal, 
  Notification, 
  AuditLog, 
  SiteSettings,
  Role
} from '../types';
import { Permission } from './permissions';
import { 
  INITIAL_USERS, 
  INITIAL_PAYMENT_ACCOUNTS, 
  INITIAL_TOURNAMENTS, 
  INITIAL_REGISTRATIONS, 
  INITIAL_PAYMENTS, 
  INITIAL_MATCH_RESULTS, 
  INITIAL_WALLET_TXS, 
  INITIAL_WITHDRAWALS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_SITE_SETTINGS 
} from './seed-data';
import { calcPoints } from './points';

const STORAGE_KEY_PREFIX = 'booyah_arena_v2_';

function loadOrInit<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
  }
  return defaultValue;
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export class AppStorage {
  private users: User[];
  private tournaments: Tournament[];
  private registrations: Registration[];
  private payments: Payment[];
  private paymentAccounts: PaymentAccount[];
  private matchResults: MatchResult[];
  private walletTxs: WalletTransaction[];
  private withdrawals: Withdrawal[];
  private notifications: Notification[];
  private auditLogs: AuditLog[];
  private siteSettings: SiteSettings;
  private currentUserId: string;

  constructor() {
    this.users = loadOrInit('users', INITIAL_USERS);
    this.tournaments = loadOrInit('tournaments', INITIAL_TOURNAMENTS);
    this.registrations = loadOrInit('registrations', INITIAL_REGISTRATIONS);
    this.payments = loadOrInit('payments', INITIAL_PAYMENTS);
    this.paymentAccounts = loadOrInit('payment_accounts', INITIAL_PAYMENT_ACCOUNTS);
    this.matchResults = loadOrInit('match_results', INITIAL_MATCH_RESULTS);
    this.walletTxs = loadOrInit('wallet_txs', INITIAL_WALLET_TXS);
    this.withdrawals = loadOrInit('withdrawals', INITIAL_WITHDRAWALS);
    this.notifications = loadOrInit('notifications', INITIAL_NOTIFICATIONS);
    this.auditLogs = loadOrInit('audit_logs', INITIAL_AUDIT_LOGS);
    this.siteSettings = loadOrInit('site_settings', INITIAL_SITE_SETTINGS);
    this.currentUserId = loadOrInit('current_user_id', 'user-player-1');

    this.expireUnpaidHolds();
  }

  public resetToDefault(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    this.users = [...INITIAL_USERS];
    this.tournaments = [...INITIAL_TOURNAMENTS];
    this.registrations = [...INITIAL_REGISTRATIONS];
    this.payments = [...INITIAL_PAYMENTS];
    this.paymentAccounts = [...INITIAL_PAYMENT_ACCOUNTS];
    this.matchResults = [...INITIAL_MATCH_RESULTS];
    this.walletTxs = [...INITIAL_WALLET_TXS];
    this.withdrawals = [...INITIAL_WITHDRAWALS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.siteSettings = { ...INITIAL_SITE_SETTINGS };
    this.currentUserId = 'user-player-1';
    this.persistAll();
  }

  private persistAll(): void {
    save('users', this.users);
    save('tournaments', this.tournaments);
    save('registrations', this.registrations);
    save('payments', this.payments);
    save('payment_accounts', this.paymentAccounts);
    save('match_results', this.matchResults);
    save('wallet_txs', this.walletTxs);
    save('withdrawals', this.withdrawals);
    save('notifications', this.notifications);
    save('audit_logs', this.auditLogs);
    save('site_settings', this.siteSettings);
    save('current_user_id', this.currentUserId);
  }

  // --- Auth & Session ---
  public getCurrentUser(): User {
    const user = this.users.find((u) => u.id === this.currentUserId);
    if (!user) {
      return this.users[3] || this.users[0]; // fallback
    }
    return user;
  }

  public setCurrentUser(userId: string): void {
    this.currentUserId = userId;
    save('current_user_id', userId);
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public updateUser(id: string, updates: Partial<User>): User {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    this.users[idx] = { ...this.users[idx], ...updates };
    save('users', this.users);
    return this.users[idx];
  }

  public toggleBanUser(id: string, adminId: string): User {
    const user = this.getUserById(id);
    if (!user) throw new Error('User not found');
    if (user.role === 'SUPER_ADMIN') throw new Error('Cannot ban Super Admin');
    const newStatus = !user.isBanned;
    user.isBanned = newStatus;
    save('users', this.users);
    this.addAuditLog(
      adminId,
      newStatus ? 'USER_BANNED' : 'USER_UNBANNED',
      'User',
      id,
      { isBanned: !newStatus },
      { isBanned: newStatus }
    );
    return user;
  }

  public registerUser(displayName: string, email: string, phone: string, ffUid: string, ffIgn: string): User {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error('Email already registered');
    const existingUid = this.users.find((u) => u.ffUid === ffUid);
    if (existingUid) throw new Error('Free Fire UID already in use');

    const newUser: User = {
      id: 'user-' + Date.now(),
      email,
      phone,
      displayName,
      ffUid,
      ffIgn,
      avatarUrl: '/src/assets/images/avatar_esports_pro_1792418533019.jpg',
      role: 'PLAYER',
      permissions: [],
      walletBalance: 0,
      isBanned: false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.currentUserId = newUser.id;
    this.persistAll();
    return newUser;
  }

  // --- Tournaments ---
  public getTournaments(): Tournament[] {
    return [...this.tournaments];
  }

  public getTournamentById(id: string, requestingUser?: User): Tournament | undefined {
    const tournament = this.tournaments.find((t) => t.id === id);
    if (!tournament) return undefined;

    // Spec 13.6: Hide room details until released & only to confirmed players or admin/moderator
    const isStaff = requestingUser?.role === 'SUPER_ADMIN' || requestingUser?.role === 'MODERATOR' || requestingUser?.role === 'ADMIN';
    const hasConfirmedReg = requestingUser 
      ? this.registrations.some((r) => r.tournamentId === id && r.userId === requestingUser.id && r.status === 'CONFIRMED')
      : false;

    const canSeeRoom = isStaff || (hasConfirmedReg && Boolean(tournament.roomReleasedAt));

    return {
      ...tournament,
      roomId: canSeeRoom ? tournament.roomId : null,
      roomPassword: canSeeRoom ? tournament.roomPassword : null,
    };
  }

  public createTournament(tData: Omit<Tournament, 'id' | 'filledSlots' | 'createdAt'>, creatorId: string): Tournament {
    const newTournament: Tournament = {
      ...tData,
      id: 'tour-' + Date.now(),
      filledSlots: 0,
      createdAt: new Date().toISOString(),
    };
    this.tournaments.unshift(newTournament);
    save('tournaments', this.tournaments);
    this.addAuditLog(creatorId, 'TOURNAMENT_CREATED', 'Tournament', newTournament.id, null, newTournament);
    return newTournament;
  }

  public updateTournament(id: string, updates: Partial<Tournament>, actorId: string): Tournament {
    const idx = this.tournaments.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Tournament not found');
    const old = this.tournaments[idx];
    this.tournaments[idx] = { ...old, ...updates };
    save('tournaments', this.tournaments);
    this.addAuditLog(actorId, 'TOURNAMENT_UPDATED', 'Tournament', id, old, this.tournaments[idx]);
    return this.tournaments[idx];
  }

  public releaseRoom(tournamentId: string, roomId: string, roomPassword: string, actorId: string): Tournament {
    const tournament = this.tournaments.find((t) => t.id === tournamentId);
    if (!tournament) throw new Error('Tournament not found');

    tournament.roomId = roomId;
    tournament.roomPassword = roomPassword;
    tournament.roomReleasedAt = new Date().toISOString();
    if (tournament.status === 'OPEN' || tournament.status === 'FULL') {
      tournament.status = 'LIVE';
    }
    save('tournaments', this.tournaments);

    // Notify all confirmed participants
    const confirmedRegs = this.registrations.filter((r) => r.tournamentId === tournamentId && r.status === 'CONFIRMED');
    confirmedRegs.forEach((r) => {
      this.addNotification(
        r.userId,
        'Room Credentials Released!',
        `Custom Room details for "${tournament.title}" are now available! Room ID: ${roomId}, Password: ${roomPassword}. Join within 10 minutes!`,
        `/tournaments/${tournamentId}`
      );
    });

    this.addAuditLog(actorId, 'ROOM_RELEASED', 'Tournament', tournamentId, null, { roomId, status: tournament.status });
    return tournament;
  }

  public cancelTournament(tournamentId: string, actorId: string, reason?: string): Tournament {
    const tournament = this.tournaments.find((t) => t.id === tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status === 'LIVE' || tournament.status === 'COMPLETED') {
      throw new Error('Cannot cancel a tournament that is already Live or Completed');
    }

    tournament.status = 'CANCELLED';
    save('tournaments', this.tournaments);

    // Spec 6 & 13.1: Cancel triggers refunds for every confirmed registration to their wallet
    const confirmedRegs = this.registrations.filter((r) => r.tournamentId === tournamentId && (r.status === 'CONFIRMED' || r.status === 'PAYMENT_SUBMITTED'));
    
    confirmedRegs.forEach((reg) => {
      reg.status = 'REFUNDED';
      const user = this.getUserById(reg.userId);
      if (user && tournament.entryFee > 0) {
        user.walletBalance += tournament.entryFee;
        this.walletTxs.unshift({
          id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          userId: user.id,
          type: 'REFUND',
          amount: tournament.entryFee,
          tournamentId: tournament.id,
          tournamentTitle: tournament.title,
          note: `Refund for cancelled tournament: ${tournament.title}`,
          createdAt: new Date().toISOString(),
        });
        this.addNotification(
          user.id,
          'Tournament Cancelled - Full Refund',
          `"${tournament.title}" has been cancelled. Your entry fee of ৳${tournament.entryFee} was credited to your wallet balance.`,
          '/wallet'
        );
      }
    });

    save('registrations', this.registrations);
    save('users', this.users);
    save('wallet_txs', this.walletTxs);

    this.addAuditLog(actorId, 'TOURNAMENT_CANCELLED', 'Tournament', tournamentId, null, { reason: reason || 'Cancelled by admin' });
    return tournament;
  }

  // --- Registrations & Slot Safety ---
  public getRegistrations(tournamentId?: string): Registration[] {
    if (tournamentId) {
      return this.registrations.filter((r) => r.tournamentId === tournamentId);
    }
    return [...this.registrations];
  }

  public getUserRegistrations(userId: string): Registration[] {
    return this.registrations.filter((r) => r.userId === userId);
  }

  public expireUnpaidHolds(): void {
    const nowTime = Date.now();
    let updated = false;

    this.registrations.forEach((reg) => {
      if (reg.status === 'PENDING_PAYMENT' && reg.holdExpiresAt) {
        if (new Date(reg.holdExpiresAt).getTime() < nowTime) {
          reg.status = 'CANCELLED';
          updated = true;
        }
      }
    });

    if (updated) {
      save('registrations', this.registrations);
    }
  }

  public joinTournament(tournamentId: string, user: User, teamName?: string): Registration {
    this.expireUnpaidHolds();
    const tournament = this.tournaments.find((t) => t.id === tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status !== 'OPEN') throw new Error('Tournament registration is closed');
    if (new Date() > new Date(tournament.registrationClosesAt)) throw new Error('Registration period has ended');

    // Rule 1: A player can only join a tournament once
    const existing = this.registrations.find((r) => r.tournamentId === tournamentId && r.userId === user.id && r.status !== 'CANCELLED' && r.status !== 'REJECTED');
    if (existing) throw new Error('You have already joined or have an active hold on this tournament');

    // Rule 2 & 3: Atomic check on max slots
    const heldCount = this.registrations.filter((r) => 
      r.tournamentId === tournamentId && 
      (r.status === 'PENDING_PAYMENT' || r.status === 'PAYMENT_SUBMITTED' || r.status === 'CONFIRMED')
    ).length;

    if (heldCount >= tournament.maxSlots) {
      throw new Error('Tournament slots are full');
    }

    // 15-minute hold expires
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const newReg: Registration = {
      id: 'reg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      tournamentId,
      userId: user.id,
      userDisplayName: user.displayName,
      ffUid: user.ffUid,
      ffIgn: user.ffIgn,
      phone: user.phone,
      teamName: teamName || (tournament.mode !== 'SOLO' ? `${user.displayName}'s Squad` : undefined),
      status: tournament.entryFee === 0 ? 'CONFIRMED' : 'PENDING_PAYMENT',
      slotNumber: tournament.entryFee === 0 ? tournament.filledSlots + 1 : undefined,
      holdExpiresAt: tournament.entryFee === 0 ? undefined : holdExpiresAt,
      createdAt: new Date().toISOString(),
    };

    if (tournament.entryFee === 0) {
      tournament.filledSlots += 1;
      if (tournament.filledSlots >= tournament.maxSlots) {
        tournament.status = 'FULL';
      }
      save('tournaments', this.tournaments);
      this.addNotification(
        user.id,
        'Free Registration Confirmed!',
        `You have successfully secured Slot #${newReg.slotNumber} for "${tournament.title}".`,
        `/tournaments/${tournament.id}`
      );
    }

    this.registrations.push(newReg);
    save('registrations', this.registrations);
    return newReg;
  }

  // --- Payments ---
  public getPayments(): Payment[] {
    return [...this.payments];
  }

  public getPaymentById(id: string): Payment | undefined {
    return this.payments.find((p) => p.id === id);
  }

  public submitPayment(
    registrationId: string, 
    user: User, 
    method: 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY' | 'WALLET', 
    senderNumber: string, 
    trxIdRaw: string, 
    screenshotUrl?: string,
    paidToAccount?: string
  ): Payment {
    const reg = this.registrations.find((r) => r.id === registrationId);
    if (!reg) throw new Error('Registration not found');
    const tournament = this.tournaments.find((t) => t.id === reg.tournamentId);
    if (!tournament) throw new Error('Tournament not found');

    // Rule 4: trx_id must be unique, trimmed and upper-cased
    const trxId = trxIdRaw.trim().toUpperCase();
    if (method !== 'WALLET') {
      if (!trxId || trxId.length < 5) throw new Error('Please enter a valid Transaction ID');
      const duplicate = this.payments.find((p) => p.trxId.toUpperCase() === trxId && p.status !== 'REJECTED');
      if (duplicate) throw new Error('This Transaction ID has already been submitted or used');
    }

    // Direct wallet payment option
    if (method === 'WALLET') {
      if (user.walletBalance < tournament.entryFee) {
        throw new Error('Insufficient wallet balance to pay entry fee');
      }

      // Deduct wallet balance directly
      user.walletBalance -= tournament.entryFee;
      save('users', this.users);

      this.walletTxs.unshift({
        id: 'tx-' + Date.now(),
        userId: user.id,
        type: 'ENTRY_FEE',
        amount: -tournament.entryFee,
        tournamentId: tournament.id,
        tournamentTitle: tournament.title,
        note: `Paid entry fee from wallet balance for ${tournament.title}`,
        createdAt: new Date().toISOString(),
      });
      save('wallet_txs', this.walletTxs);

      const payment: Payment = {
        id: 'pay-' + Date.now(),
        registrationId,
        tournamentId: tournament.id,
        tournamentTitle: tournament.title,
        userId: user.id,
        userDisplayName: user.displayName,
        method: 'WALLET',
        amount: tournament.entryFee,
        senderNumber: user.phone || 'Wallet',
        trxId: 'WLT-' + Date.now().toString(36).toUpperCase(),
        status: 'VERIFIED',
        verifiedBy: 'SYSTEM',
        verifiedAt: new Date().toISOString(),
        paidToAccount: 'Internal Wallet',
        createdAt: new Date().toISOString(),
      };

      this.payments.push(payment);
      save('payments', this.payments);

      // Instantly confirm registration & assign slot
      tournament.filledSlots += 1;
      reg.status = 'CONFIRMED';
      reg.slotNumber = tournament.filledSlots;
      reg.holdExpiresAt = null;
      reg.paymentId = payment.id;

      if (tournament.filledSlots >= tournament.maxSlots) {
        tournament.status = 'FULL';
      }
      save('tournaments', this.tournaments);
      save('registrations', this.registrations);

      this.addNotification(
        user.id,
        'Entry Fee Paid (Slot Confirmed)',
        `Your entry fee of ৳${tournament.entryFee} was paid via wallet. Slot #${reg.slotNumber} is confirmed!`,
        `/tournaments/${tournament.id}`
      );

      return payment;
    }

    // Manual Verification Mode A:
    const payment: Payment = {
      id: 'pay-' + Date.now(),
      registrationId,
      tournamentId: tournament.id,
      tournamentTitle: tournament.title,
      userId: user.id,
      userDisplayName: user.displayName,
      method,
      amount: tournament.entryFee,
      senderNumber: senderNumber.trim(),
      trxId,
      screenshotUrl,
      status: 'SUBMITTED',
      paidToAccount,
      createdAt: new Date().toISOString(),
    };

    this.payments.push(payment);
    save('payments', this.payments);

    reg.status = 'PAYMENT_SUBMITTED';
    reg.holdExpiresAt = null; // Hold secured pending admin review
    reg.paymentId = payment.id;
    save('registrations', this.registrations);

    this.addNotification(
      user.id,
      'Payment Submitted',
      `Your payment submission (TrxID: ${trxId}) is under review by admin. Your slot will be locked upon verification.`,
      `/tournaments/${tournament.id}`
    );

    return payment;
  }

  public approvePayment(paymentId: string, admin: User): Payment {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('Payment not found');
    if (payment.status === 'VERIFIED') throw new Error('Payment already verified');

    const reg = this.registrations.find((r) => r.id === payment.registrationId);
    if (!reg) throw new Error('Associated registration not found');
    const tournament = this.tournaments.find((t) => t.id === payment.tournamentId);
    if (!tournament) throw new Error('Associated tournament not found');

    payment.status = 'VERIFIED';
    payment.verifiedBy = admin.id;
    payment.verifiedAt = new Date().toISOString();
    save('payments', this.payments);

    tournament.filledSlots += 1;
    reg.status = 'CONFIRMED';
    reg.slotNumber = tournament.filledSlots;
    if (tournament.filledSlots >= tournament.maxSlots) {
      tournament.status = 'FULL';
    }

    save('tournaments', this.tournaments);
    save('registrations', this.registrations);

    this.addNotification(
      payment.userId,
      'Payment Approved! Slot Confirmed',
      `Your payment of ৳${payment.amount} for "${tournament.title}" was approved. You are assigned to Slot #${reg.slotNumber}.`,
      `/tournaments/${tournament.id}`
    );

    this.addAuditLog(
      admin.id,
      'PAYMENT_APPROVED',
      'Payment',
      payment.id,
      { status: 'SUBMITTED' },
      { status: 'VERIFIED', slotNumber: reg.slotNumber }
    );

    return payment;
  }

  public rejectPayment(paymentId: string, reason: string, admin: User): Payment {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('Payment not found');

    const reg = this.registrations.find((r) => r.id === payment.registrationId);
    payment.status = 'REJECTED';
    payment.rejectReason = reason || 'Payment details could not be verified.';
    payment.verifiedBy = admin.id;
    payment.verifiedAt = new Date().toISOString();
    save('payments', this.payments);

    if (reg) {
      reg.status = 'REJECTED';
      save('registrations', this.registrations);
    }

    this.addNotification(
      payment.userId,
      'Payment Verification Failed',
      `Your payment submission (TrxID: ${payment.trxId}) was rejected. Reason: ${payment.rejectReason}. Please contact support if you believe this is an error.`,
      '/wallet'
    );

    this.addAuditLog(
      admin.id,
      'PAYMENT_REJECTED',
      'Payment',
      payment.id,
      { status: payment.status },
      { status: 'REJECTED', reason }
    );

    return payment;
  }

  // --- Payment Accounts (Admin Editable Numbers) ---
  public getPaymentAccounts(activeOnly = false): PaymentAccount[] {
    if (activeOnly) {
      return this.paymentAccounts.filter((a) => a.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return [...this.paymentAccounts].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addPaymentAccount(data: Omit<PaymentAccount, 'id' | 'updatedAt'>, actorId: string): PaymentAccount {
    const account: PaymentAccount = {
      ...data,
      id: 'acc-' + Date.now(),
      updatedAt: new Date().toISOString(),
    };
    this.paymentAccounts.push(account);
    save('payment_accounts', this.paymentAccounts);
    this.addAuditLog(actorId, 'PAYMENT_ACCOUNT_CREATED', 'PaymentAccount', account.id, null, account);
    return account;
  }

  public updatePaymentAccount(id: string, updates: Partial<PaymentAccount>, actorId: string): PaymentAccount {
    const idx = this.paymentAccounts.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Payment account not found');
    const old = this.paymentAccounts[idx];
    this.paymentAccounts[idx] = { ...old, ...updates, updatedAt: new Date().toISOString(), updatedBy: actorId };
    save('payment_accounts', this.paymentAccounts);
    this.addAuditLog(actorId, 'PAYMENT_ACCOUNT_UPDATED', 'PaymentAccount', id, old, this.paymentAccounts[idx]);
    return this.paymentAccounts[idx];
  }

  public deletePaymentAccount(id: string, actorId: string): void {
    const idx = this.paymentAccounts.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Payment account not found');
    const old = this.paymentAccounts[idx];
    this.paymentAccounts.splice(idx, 1);
    save('payment_accounts', this.paymentAccounts);
    this.addAuditLog(actorId, 'PAYMENT_ACCOUNT_DELETED', 'PaymentAccount', id, old, null);
  }

  // --- Match Results & Points Calculation ---
  public getMatchResults(tournamentId?: string): MatchResult[] {
    if (tournamentId) {
      return this.matchResults.filter((r) => r.tournamentId === tournamentId);
    }
    return [...this.matchResults];
  }

  public publishResults(
    tournamentId: string, 
    resultsInput: Array<{ registrationId: string; placement: number; kills: number; screenshotUrl?: string }>,
    actorId: string
  ): void {
    const tournament = this.tournaments.find((t) => t.id === tournamentId);
    if (!tournament) throw new Error('Tournament not found');

    // Remove existing results for this tournament if any (idempotency)
    this.matchResults = this.matchResults.filter((r) => r.tournamentId !== tournamentId);

    const newResults: MatchResult[] = [];
    resultsInput.forEach((res) => {
      const reg = this.registrations.find((r) => r.id === res.registrationId);
      if (!reg) return;
      const points = calcPoints(res.placement, res.kills, tournament.pointsConfig);
      newResults.push({
        id: 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        tournamentId,
        registrationId: res.registrationId,
        placement: res.placement,
        kills: res.kills,
        points,
        screenshotUrl: res.screenshotUrl,
        userId: reg.userId,
        displayName: reg.userDisplayName || 'Player',
        ffIgn: reg.ffIgn || 'Unknown',
        slotNumber: reg.slotNumber || 0,
      });
    });

    // Sort by points descending, then kills descending
    newResults.sort((a, b) => b.points - a.points || b.kills - a.kills || a.placement - b.placement);
    this.matchResults.push(...newResults);
    save('match_results', this.matchResults);

    tournament.status = 'COMPLETED';
    save('tournaments', this.tournaments);

    // Credit prizes to winners (Spec 13.8)
    const prizeDist = tournament.prizeDistribution || {};
    newResults.forEach((res) => {
      const placePrize = prizeDist[String(res.placement)] || 0;
      const killPrize = (tournament.perKillPrize || 0) * res.kills;
      const totalPrize = placePrize + killPrize;

      if (totalPrize > 0) {
        const user = this.getUserById(res.userId);
        if (user) {
          user.walletBalance += totalPrize;
          this.walletTxs.unshift({
            id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            userId: user.id,
            type: 'PRIZE',
            amount: totalPrize,
            tournamentId: tournament.id,
            tournamentTitle: tournament.title,
            note: `Tournament Prize: Rank #${res.placement} (৳${placePrize}) + ${res.kills} kills (৳${killPrize})`,
            createdAt: new Date().toISOString(),
          });
          this.addNotification(
            user.id,
            `Prize Credited! ৳${totalPrize}`,
            `Congratulations! You finished Rank #${res.placement} in "${tournament.title}". ৳${totalPrize} prize money has been deposited to your wallet.`,
            '/wallet'
          );
        }
      }
    });

    save('users', this.users);
    save('wallet_txs', this.walletTxs);

    this.addAuditLog(
      actorId,
      'RESULTS_PUBLISHED',
      'Tournament',
      tournamentId,
      null,
      { winnersCount: newResults.length, prizePool: tournament.prizePool }
    );
  }

  // --- Wallet & Withdrawals ---
  public getWalletTransactions(userId: string): WalletTransaction[] {
    return this.walletTxs.filter((tx) => tx.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getWithdrawals(userId?: string): Withdrawal[] {
    if (userId) {
      return this.withdrawals.filter((w) => w.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.withdrawals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public requestWithdrawal(user: User, amount: number, method: 'BKASH' | 'NAGAD' | 'ROCKET', accountNumber: string): Withdrawal {
    const min = this.siteSettings.minimumWithdrawalAmount || 100;
    if (amount < min) throw new Error(`Minimum withdrawal amount is ৳${min}`);
    if (amount > user.walletBalance) throw new Error('Withdrawal amount cannot exceed your current wallet balance');
    if (!accountNumber || accountNumber.length < 11) throw new Error('Please enter a valid 11-digit Bangladesh wallet number');

    // Deduct immediately from balance
    user.walletBalance -= amount;
    save('users', this.users);

    const withdrawal: Withdrawal = {
      id: 'wd-' + Date.now(),
      userId: user.id,
      amount,
      method,
      accountNumber,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      userDisplayName: user.displayName,
      userPhone: user.phone,
    };
    this.withdrawals.unshift(withdrawal);
    save('withdrawals', this.withdrawals);

    this.walletTxs.unshift({
      id: 'tx-' + Date.now(),
      userId: user.id,
      type: 'WITHDRAWAL',
      amount: -amount,
      note: `Withdrawal request to ${method} (${accountNumber}) - Pending Admin Payout`,
      createdAt: new Date().toISOString(),
    });
    save('wallet_txs', this.walletTxs);

    this.addNotification(
      user.id,
      'Withdrawal Request Received',
      `Your request to withdraw ৳${amount} via ${method} is being processed. Funds will arrive within 2-12 hours.`,
      '/wallet'
    );

    return withdrawal;
  }

  public processWithdrawal(withdrawalId: string, status: 'PAID' | 'REJECTED', paidTrxId: string, admin: User, rejectReason?: string): Withdrawal {
    const wd = this.withdrawals.find((w) => w.id === withdrawalId);
    if (!wd) throw new Error('Withdrawal request not found');
    if (wd.status !== 'REQUESTED') throw new Error('Withdrawal is already processed');

    wd.status = status;
    wd.processedAt = new Date().toISOString();
    wd.processedBy = admin.id;

    if (status === 'PAID') {
      if (!paidTrxId) throw new Error('Please provide the outgoing Transaction ID (TrxID) for the payout');
      wd.paidTrxId = paidTrxId.trim().toUpperCase();

      this.addNotification(
        wd.userId,
        'Withdrawal Sent!',
        `Your payout of ৳${wd.amount} has been successfully sent to ${wd.method} (${wd.accountNumber}). Outgoing TrxID: ${wd.paidTrxId}.`,
        '/wallet'
      );
    } else {
      wd.rejectReason = rejectReason || 'Declined by administration';
      // Refund back to player balance
      const user = this.getUserById(wd.userId);
      if (user) {
        user.walletBalance += wd.amount;
        save('users', this.users);
        this.walletTxs.unshift({
          id: 'tx-' + Date.now(),
          userId: user.id,
          type: 'REFUND',
          amount: wd.amount,
          note: `Refund for rejected withdrawal: ${wd.rejectReason}`,
          createdAt: new Date().toISOString(),
        });
        save('wallet_txs', this.walletTxs);
      }
      this.addNotification(
        wd.userId,
        'Withdrawal Declined',
        `Your withdrawal request of ৳${wd.amount} was rejected. Reason: ${wd.rejectReason}. Funds have been refunded to your wallet balance.`,
        '/wallet'
      );
    }

    save('withdrawals', this.withdrawals);
    this.addAuditLog(
      admin.id,
      status === 'PAID' ? 'WITHDRAWAL_PAID' : 'WITHDRAWAL_REJECTED',
      'Withdrawal',
      wd.id,
      { status: 'REQUESTED' },
      { status, paidTrxId: wd.paidTrxId, rejectReason }
    );
    return wd;
  }

  // --- Notifications ---
  public getNotifications(userId: string): Notification[] {
    return this.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addNotification(userId: string, title: string, body: string, link?: string): Notification {
    const notif: Notification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      userId,
      title,
      body,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    save('notifications', this.notifications);
    return notif;
  }

  public markNotificationRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      save('notifications', this.notifications);
    }
  }

  public markAllNotificationsRead(userId: string): void {
    this.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    save('notifications', this.notifications);
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addAuditLog(actorId: string, action: string, entityType: string, entityId: string, oldValue?: any, newValue?: any): void {
    const actor = this.getUserById(actorId);
    const log: AuditLog = {
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      actorId,
      actorName: actor?.displayName || 'System Admin',
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress: '103.145.' + Math.floor(Math.random() * 200 + 10) + '.' + Math.floor(Math.random() * 200 + 10),
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    save('audit_logs', this.auditLogs);
  }

  // --- Site Settings ---
  public getSiteSettings(): SiteSettings {
    return { ...this.siteSettings };
  }

  public updateSiteSettings(settings: Partial<SiteSettings>, actorId: string): SiteSettings {
    const old = this.siteSettings;
    this.siteSettings = { ...this.siteSettings, ...settings };
    save('site_settings', this.siteSettings);
    this.addAuditLog(actorId, 'SITE_SETTINGS_UPDATED', 'SiteSettings', 'main', old, this.siteSettings);
    return this.siteSettings;
  }

  // --- Moderator Management ---
  public addModerator(
    displayName: string,
    email: string,
    phone: string,
    permissions: Permission[],
    creatorAdminId: string
  ): User {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error('User with this email already exists');

    const mod: User = {
      id: 'mod-' + Date.now(),
      email,
      phone,
      displayName,
      ffUid: 'MOD' + Math.floor(Math.random() * 89999 + 10000),
      ffIgn: 'MOD_' + displayName.split(' ')[0].toUpperCase(),
      avatarUrl: '/src/assets/images/avatar_esports_pro_1792418533019.jpg',
      role: 'MODERATOR',
      permissions: permissions,
      walletBalance: 0,
      isBanned: false,
      isActive: true,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
      createdBy: creatorAdminId,
    };

    this.users.push(mod);
    save('users', this.users);
    this.addAuditLog(creatorAdminId, 'MODERATOR_CREATED', 'User', mod.id, null, { email, permissions });
    return mod;
  }

  public updateModeratorPermissions(modId: string, permissions: Permission[], actorId: string): User {
    const mod = this.users.find((u) => u.id === modId);
    if (!mod) throw new Error('Moderator not found');
    if (mod.role === 'SUPER_ADMIN') throw new Error('Cannot edit Super Admin permissions');

    const oldPerms = [...mod.permissions];
    mod.permissions = permissions;
    save('users', this.users);

    this.addAuditLog(actorId, 'MODERATOR_PERMISSIONS_UPDATED', 'User', mod.id, { permissions: oldPerms }, { permissions });
    return mod;
  }

  public toggleModeratorActive(modId: string, actorId: string): User {
    const mod = this.users.find((u) => u.id === modId);
    if (!mod) throw new Error('Moderator not found');
    if (mod.role === 'SUPER_ADMIN') throw new Error('Cannot disable Super Admin');

    const oldStatus = mod.isActive;
    mod.isActive = !oldStatus;
    save('users', this.users);

    this.addAuditLog(
      actorId,
      mod.isActive ? 'MODERATOR_ENABLED' : 'MODERATOR_DISABLED',
      'User',
      mod.id,
      { isActive: oldStatus },
      { isActive: mod.isActive }
    );
    return mod;
  }
}

// Global singleton instance
export const storage = new AppStorage();
