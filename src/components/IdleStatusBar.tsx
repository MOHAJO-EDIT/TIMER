import React from 'react';
import { MousePointer, PauseCircle, Activity, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../utils/format';

interface IdleStatusBarProps {
  isIdle: boolean;
  isAutoPaused: boolean;
  secondsRemaining: number;
  thresholdSeconds: number;
  isTimerRunning: boolean;
  usePersianDigits: boolean;
  onSimulateIdle: () => void;
  enabled: boolean;
  theme?: 'dark' | 'light';
}

export const IdleStatusBar: React.FC<IdleStatusBarProps> = ({
  isIdle,
  isAutoPaused,
  secondsRemaining,
  thresholdSeconds,
  isTimerRunning,
  usePersianDigits,
  onSimulateIdle,
  enabled,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const formatNum = (n: number | string) =>
    usePersianDigits ? toPersianDigits(n) : String(n);

  const progressPercent = Math.min(
    100,
    Math.max(0, (secondsRemaining / thresholdSeconds) * 100)
  );

  if (!enabled) {
    return (
      <div className={`mb-6 p-3 rounded-xl border text-xs flex items-center justify-between ${
        isLight ? 'bg-slate-200 border-slate-300 text-slate-600' : 'bg-slate-800/60 border-slate-700/50 text-slate-400'
      }`}>
        <span>تشخیص خودکار عدم فعالیت غیرفعال است.</span>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* 3D Status Container */}
      <div
        className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border ${
          isAutoPaused
            ? isLight
              ? 'bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 border-amber-400 shadow-md animate-pulse text-amber-950'
              : 'bg-gradient-to-r from-amber-950/80 via-yellow-950/70 to-amber-900/80 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-pulse'
            : isTimerRunning
            ? isLight
              ? 'bg-white border-cyan-300 shadow-sm'
              : 'bg-slate-900/80 border-cyan-500/30 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]'
            : isLight
            ? 'bg-slate-100/90 border-slate-300'
            : 'bg-slate-900/60 border-slate-700/40 shadow-inner'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Status info & LED */}
          <div className="flex items-center gap-3">
            {/* 3D LED Light */}
            <div className="relative flex items-center justify-center">
              <span
                className={`w-4 h-4 rounded-full transition-all duration-300 shadow-md ${
                  isAutoPaused
                    ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b]'
                    : isTimerRunning
                    ? 'bg-emerald-400 shadow-[0_0_12px_#10b981]'
                    : 'bg-slate-400'
                }`}
              />
              {(isAutoPaused || isTimerRunning) && (
                <span
                  className={`absolute w-7 h-7 rounded-full animate-ping opacity-60 pointer-events-none ${
                    isAutoPaused ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">
                  {isAutoPaused ? (
                    <span className={`flex items-center gap-1.5 ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                      <PauseCircle className="w-4 h-4 animate-bounce" />
                      توقف موقت به علت عدم فعالیت (بیش از {formatNum(thresholdSeconds)} ثانیه)
                    </span>
                  ) : isTimerRunning ? (
                    <span className={`flex items-center gap-1.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      <Activity className="w-4 h-4" />
                      در حال شمارش (تشخیص حرکت موس فعال)
                    </span>
                  ) : (
                    <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                      سیستم آماده تشخیص خودکار عدم فعالیت
                    </span>
                  )}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isAutoPaused ? (
                  <span className={`font-semibold ${isLight ? 'text-amber-800' : 'text-amber-200/90'}`}>
                    🖱️ کافیست موس را تکان دهید یا کلیدی را فشار دهید تا تایمر ادامه یابد!
                  </span>
                ) : (
                  <span>
                    در صورت عدم حرکت موس یا لمس لپتاپ بیش از{' '}
                    <strong className={isLight ? 'text-cyan-800' : 'text-cyan-300'}>{formatNum(thresholdSeconds)} ثانیه</strong>،
                    تایمر فوراً متوقف می‌شود.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick test button & countdown indicator */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {isTimerRunning && !isAutoPaused && (
              <div className="text-left sm:text-right">
                <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>زمان تا توقف خودکار:</div>
                <div className={`font-mono-digits font-bold text-sm ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                  {formatNum(secondsRemaining)} ثانیه
                </div>
              </div>
            )}

            {isTimerRunning && (
              <button
                type="button"
                onClick={onSimulateIdle}
                title="تست سریع سناریوی ۳۰ ثانیه بی‌حرکتی بدون معطلی"
                className={`btn-3d px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isLight
                    ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300'
                    : 'btn-3d-dark text-slate-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                تست توقف بی‌حرکتی
              </button>
            )}
          </div>
        </div>

        {/* Real-time Inactivity Progress Bar (counts down to 0) */}
        {isTimerRunning && !isAutoPaused && (
          <div className={`mt-3 w-full h-2 rounded-full overflow-hidden p-0.5 border ${
            isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-950/70 border-slate-700/50'
          }`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ease-linear ${
                progressPercent > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                  : progressPercent > 20
                  ? 'bg-gradient-to-r from-cyan-400 to-amber-400'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
