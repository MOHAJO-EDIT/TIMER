import React from 'react';
import {
  ShieldAlert,
  Cpu,
  MousePointer2,
  Pause,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { toPersianDigits, formatTimeParts } from '../utils/format';

interface InactivityStatsProps {
  usePersianDigits: boolean;
  autoPauseCount: number;
  totalPausedSeconds: number;
  thresholdSeconds: number;
  theme?: 'dark' | 'light';
}

export const InactivityStats: React.FC<InactivityStatsProps> = ({
  usePersianDigits,
  autoPauseCount,
  totalPausedSeconds,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const formatNum = (str: string | number) =>
    usePersianDigits ? toPersianDigits(str) : String(str);

  const { hours, minutes, seconds } = formatTimeParts(totalPausedSeconds);

  return (
    <div className={`mt-8 border-t pt-6 transition-colors duration-200 ${
      isLight ? 'border-slate-300' : 'border-slate-800/80'
    }`}>
      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Pause Count */}
        <div className={`rounded-2xl border p-4 flex items-center gap-3 transition-colors duration-200 ${
          isLight ? 'bg-amber-50/80 border-amber-200 shadow-sm' : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Pause className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              دفعات توقف خودکار:
            </div>
            <div className={`text-xl font-bold font-mono-digits ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
              {formatNum(autoPauseCount)} مرتبه
            </div>
          </div>
        </div>

        {/* Card 2: Total Saved / Paused Time */}
        <div className={`rounded-2xl border p-4 flex items-center gap-3 transition-colors duration-200 ${
          isLight ? 'bg-cyan-50/80 border-cyan-200 shadow-sm' : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              مجموع زمان توقف عدم فعالیت:
            </div>
            <div className={`text-xl font-bold font-mono-digits ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
              {Number(hours) > 0 ? `${formatNum(hours)}:` : ''}
              {formatNum(minutes)}:{formatNum(seconds)}
            </div>
          </div>
        </div>

        {/* Card 3: RAM & Resource Status */}
        <div className={`rounded-2xl border p-4 flex items-center gap-3 transition-colors duration-200 ${
          isLight ? 'bg-emerald-50/80 border-emerald-200 shadow-sm' : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              وضعیت مصرف رم و پردازنده:
            </div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>فوق‌العاده بهینه (زیر ۱۵MB)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
