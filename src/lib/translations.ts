export type Language = 'en' | 'bn';

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    tournaments: 'Tournaments',
    leaderboard: 'Leaderboard',
    wallet: 'Wallet',
    myTournaments: 'My Matches',
    profile: 'Profile',
    rules: 'Rules & Terms',
    adminPanel: 'Admin Panel',
    login: 'Log In',
    signup: 'Register',
    logout: 'Logout',
    
    // Hero
    heroHeadline: 'DROP IN. FIGHT. BOOYAH!',
    heroSubhead: 'Bangladesh’s premier Free Fire esports platform. Compete in daily custom rooms, verify payments instantly via bKash/Nagad/Rocket, and withdraw cash prizes directly to your wallet.',
    joinTournament: 'Browse Tournaments',
    howItWorks: 'How It Works',
    quickStats: 'Platform Overview',
    upcomingClash: 'Next Live Match',
    
    // How it works
    step1Title: '1. Register & Pick Match',
    step1Desc: 'Choose Solo, Duo, or Squad tournaments across Bermuda, Kalahari, Purgatory, or Alpine.',
    step2Title: '2. Pay Entry via bKash/Nagad',
    step2Desc: 'Send exact entry fee to verified numbers, paste your TrxID. Slots are held for 15 mins.',
    step3Title: '3. Get Room ID & Pass',
    step3Desc: 'Room details unlock 10-15 minutes before the match directly in your secure player portal.',
    step4Title: '4. Play, Booyah & Withdraw',
    step4Desc: 'Prizes are credited automatically to your in-app wallet. Instant withdrawal to bKash/Nagad.',

    // Tournament
    entryFee: 'Entry Fee',
    prizePool: 'Prize Pool',
    perKill: 'Per Kill',
    slots: 'Slots',
    mode: 'Mode',
    map: 'Map',
    matchType: 'Match Type',
    status: 'Status',
    roomUnlocked: 'Room Credentials Ready',
    roomLocked: 'Room Credentials Locked',
    joinNow: 'Join Tournament',
    alreadyRegistered: 'Registered',
    tournamentFull: 'Tournament Full',
    cancelled: 'Cancelled',
    completed: 'Finished',
    liveNow: 'LIVE NOW',
    openRegistration: 'Registration Open',
    startsIn: 'Starts',
    rulesAndPrizes: 'Rules & Prize Distribution',
    pointsSystem: 'Official Points System',
    placement: 'Placement',
    points: 'Points',

    // Wallet
    currentBalance: 'Wallet Balance',
    withdrawFunds: 'Withdraw Cash',
    totalWinnings: 'Total Winnings',
    totalWithdrawn: 'Total Withdrawn',
    transactionHistory: 'Transaction History',
    minWithdrawalNotice: 'Minimum withdrawal is ৳100 via bKash, Nagad, or Rocket.',
    withdrawBtn: 'Request Payout',

    // Language
    language: 'Language',
  },
  bn: {
    // Navigation
    home: 'হোম',
    tournaments: 'টুর্নামেন্ট',
    leaderboard: 'লিডারবোর্ড',
    wallet: 'ওয়ালেট',
    myTournaments: 'আমার ম্যাচ',
    profile: 'প্রোফাইল',
    rules: 'নিয়ম ও শর্ত',
    adminPanel: 'অ্যাডমিন প্যানেল',
    login: 'লগইন',
    signup: 'রেজিস্ট্রেশন',
    logout: 'লগআউট',
    
    // Hero
    heroHeadline: 'ড্রপ ইন। ফাইট। বুয়াহ!',
    heroSubhead: 'বাংলাদেশের সেরা ফ্রি ফায়ার এস্পোর্টস প্ল্যাটফর্ম। প্রতিদিন কাস্টম রুমে খেলুন, বিকাশ/নগদ/রকেটে ফি দিন এবং সরাসরি প্রাইজ মানি তুলুন।',
    joinTournament: 'টুর্নামেন্ট দেখুন',
    howItWorks: 'কীভাবে কাজ করে',
    quickStats: 'প্ল্যাটফর্ম পরিচিতি',
    upcomingClash: 'পরবর্তী লাইভ ম্যাচ',
    
    // How it works
    step1Title: '১. টুর্নামেন্ট বেছে নিন',
    step1Desc: 'বারমুডা, কালাহারি, পারগেটরি বা আলপাইন ম্যাপে সোলো, ডুও বা স্কোয়াড ম্যাচ সিলেক্ট করুন।',
    step2Title: '২. বিকাশ/নগদে এন্ট্রি ফি দিন',
    step2Desc: 'অ্যাডমিন নম্বরে ফি পাঠিয়ে ট্রানজেকশন আইডি (TrxID) দিন। ১৫ মিনিট স্লট বুক থাকে।',
    step3Title: '৩. রুম আইডি ও পাসওয়ার্ড পান',
    step3Desc: 'ম্যাচ শুরুর ১০-১৫ মিনিট আগে রুমের বিস্তারিত শুধু কনফার্ম খেলোয়াড়দের আনলক হবে।',
    step4Title: '৪. বুয়াহ নিন ও টাকা তুলুন',
    step4Desc: 'ম্যাচ শেষেই প্রাইজ মানি যুক্ত হবে ওয়ালেটে। বিকাশ/নগদে যেকোনো সময় উইথড্র দিন।',

    // Tournament
    entryFee: 'এন্ট্রি ফি',
    prizePool: 'প্রাইজ পুল',
    perKill: 'প্রতি কিল',
    slots: 'স্লট',
    mode: 'মোড',
    map: 'ম্যাপ',
    matchType: 'ম্যাচ টাইপ',
    status: 'স্ট্যাটাস',
    roomUnlocked: 'রুমের তথ্য উন্মুক্ত',
    roomLocked: 'রুমের তথ্য লক করা',
    joinNow: 'জয়েন করুন',
    alreadyRegistered: 'নিবন্ধিত',
    tournamentFull: 'স্লট পূর্ণ',
    cancelled: 'বাতিল',
    completed: 'সম্পন্ন',
    liveNow: 'লাইভ চলছে',
    openRegistration: 'রেজিস্ট্রেশন চলছে',
    startsIn: 'শুরু হবে',
    rulesAndPrizes: 'নিয়ম ও প্রাইজ বন্টন',
    pointsSystem: 'পয়েন্ট পদ্ধতি',
    placement: 'স্থান',
    points: 'পয়েন্ট',

    // Wallet
    currentBalance: 'ওয়ালেট ব্যালেন্স',
    withdrawFunds: 'টাকা তুলুন',
    totalWinnings: 'মোট জয়লাভ',
    totalWithdrawn: 'মোট উত্তোলিত',
    transactionHistory: 'লেনদেনের বিবরণ',
    minWithdrawalNotice: 'বিকাশ, নগদ ও রকেটের মাধ্যমে সর্বনিম্ন উত্তোলন ৳১০০।',
    withdrawBtn: 'উইথড্র রিকোয়েস্ট পাঠান',

    // Language
    language: 'ভাষা',
  },
};
