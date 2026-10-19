import React from 'react';
import { Home, Trophy, Award, Wallet, User as UserIcon } from 'lucide-react';
import { Language, translations } from '../lib/translations';

interface BottomNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onNavigate,
  language,
}) => {
  const t = translations[language];

  const navItems = [
    { key: 'home', label: t.home, icon: Home },
    { key: 'tournaments', label: t.tournaments, icon: Trophy },
    { key: 'leaderboard', label: t.leaderboard, icon: Award },
    { key: 'wallet', label: t.wallet, icon: Wallet },
    { key: 'profile', label: t.profile, icon: UserIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B12]/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-around h-16">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all ${
              isActive
                ? 'text-[#FF6A00]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.75px]'}`} />
            <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
