import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
  onExpire?: () => void;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  label,
  onExpire,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    function calculate() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    }

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (timeLeft.isPast) {
    return (
      <span className="font-score text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live / Concluded
      </span>
    );
  }

  if (compact) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      <span className="font-score text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
        {timeLeft.hours > 0 && `${pad(timeLeft.hours)}:`}
        {pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-xs uppercase tracking-wider text-zinc-400 mb-1">{label}</span>}
      <div className="flex items-center gap-1.5 font-score text-amber-400 font-bold">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center bg-zinc-900 border border-amber-500/20 px-2 py-1 rounded min-w-[38px]">
            <span className="text-base sm:text-lg">{timeLeft.days}</span>
            <span className="text-[10px] text-zinc-400 font-sans uppercase">Days</span>
          </div>
        )}
        <div className="flex flex-col items-center bg-zinc-900 border border-amber-500/20 px-2 py-1 rounded min-w-[38px]">
          <span className="text-base sm:text-lg">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[10px] text-zinc-400 font-sans uppercase">Hours</span>
        </div>
        <span className="text-amber-500 font-mono">:</span>
        <div className="flex flex-col items-center bg-zinc-900 border border-amber-500/20 px-2 py-1 rounded min-w-[38px]">
          <span className="text-base sm:text-lg">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[10px] text-zinc-400 font-sans uppercase">Min</span>
        </div>
        <span className="text-amber-500 font-mono">:</span>
        <div className="flex flex-col items-center bg-zinc-900 border border-amber-500/20 px-2 py-1 rounded min-w-[38px]">
          <span className="text-base sm:text-lg text-[#FF6A00]">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[10px] text-zinc-400 font-sans uppercase">Sec</span>
        </div>
      </div>
    </div>
  );
};
