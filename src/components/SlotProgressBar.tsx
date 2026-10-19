import React from 'react';

interface SlotProgressBarProps {
  filled: number;
  max: number;
  showText?: boolean;
}

export const SlotProgressBar: React.FC<SlotProgressBarProps> = ({ filled, max, showText = true }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((filled / (max || 1)) * 100)));

  // Color turns from green to orange to red as slots fill
  let barColor = 'bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
  let textColor = 'text-emerald-400';

  if (percentage >= 85) {
    barColor = 'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse';
    textColor = 'text-rose-400';
  } else if (percentage >= 50) {
    barColor = 'bg-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.6)]';
    textColor = 'text-amber-400';
  }

  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-zinc-400">Available Slots</span>
          <span className={`font-score font-semibold ${textColor}`}>
            {filled}/{max} <span className="text-zinc-500">({max - filled} left)</span>
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
