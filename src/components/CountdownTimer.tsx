import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Bell,
  BellOff,
  Clock,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/sound';
import { formatTimeParts, toPersianDigits, padZero } from '../utils/format';

interface CountdownTimerProps {
  usePersianDigits: boolean;
  isAutoPaused: boolean;
  onRunningChange: (isRunning: boolean) => void;
  externalTriggerIdle?: () => void;
  theme?: 'dark' | 'light';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  usePersianDigits,
  isAutoPaused,
  onRunningChange,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  // Input settings (in seconds)
  const [initialHours, setInitialHours] = useState(0);
  const [initialMinutes, setInitialMinutes] = useState(5); // default 5 minutes as requested!
  const [initialSeconds, setInitialSeconds] = useState(0);

  // Active timer state
  const [totalSetSeconds, setTotalSetSeconds] = useState(300); // 5 mins
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  // Accurate drift-free timing refs
  const endTimeRef = useRef<number | null>(null);
  const pausedTimeRemainingRef = useRef<number>(300);
  const animFrameRef = useRef<number | null>(null);

  // Sync running state up to parent for idle tracking
  useEffect(() => {
    onRunningChange(isRunning && !isAutoPaused);
  }, [isRunning, isAutoPaused, onRunningChange]);

  // Handle auto-pause from inactivity detector
  useEffect(() => {
    if (isAutoPaused && isRunning) {
      // Freezes current remaining time accurately
      if (endTimeRef.current !== null) {
        const remaining = Math.max(0, (endTimeRef.current - Date.now()) / 1000);
        pausedTimeRemainingRef.current = remaining;
      }
    } else if (!isAutoPaused && isRunning) {
      // Resumed by user moving mouse!
      endTimeRef.current = Date.now() + pausedTimeRemainingRef.current * 1000;
    }
  }, [isAutoPaused, isRunning]);

  // Main countdown loop using requestAnimationFrame + Date.now() for 0 drift and 0 extra RAM
  useEffect(() => {
    if (!isRunning || isAutoPaused) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + remainingSeconds * 1000;
    }

    const tick = () => {
      if (!endTimeRef.current) return;
      const diffMs = endTimeRef.current - Date.now();
      const currentRemaining = Math.max(0, diffMs / 1000);

      setRemainingSeconds(currentRemaining);

      if (currentRemaining <= 0) {
        // Time's up!
        setIsRunning(false);
        setIsAlarmActive(true);
        endTimeRef.current = null;
        sound.startContinuousAlarm();
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isRunning, isAutoPaused]);

  const handleStart = () => {
    sound.playClick();
    if (isAlarmActive) {
      handleStopAlarm();
    }
    if (remainingSeconds <= 0) {
      const newTotal = initialHours * 3600 + initialMinutes * 60 + initialSeconds;
      if (newTotal === 0) return;
      setRemainingSeconds(newTotal);
      setTotalSetSeconds(newTotal);
      endTimeRef.current = Date.now() + newTotal * 1000;
      pausedTimeRemainingRef.current = newTotal;
    } else {
      endTimeRef.current = Date.now() + remainingSeconds * 1000;
      pausedTimeRemainingRef.current = remainingSeconds;
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    sound.playClick();
    if (endTimeRef.current !== null) {
      const remaining = Math.max(0, (endTimeRef.current - Date.now()) / 1000);
      pausedTimeRemainingRef.current = remaining;
      setRemainingSeconds(remaining);
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    sound.playClick();
    setIsRunning(false);
    handleStopAlarm();
    const target = initialHours * 3600 + initialMinutes * 60 + initialSeconds || 300;
    setTotalSetSeconds(target);
    setRemainingSeconds(target);
    pausedTimeRemainingRef.current = target;
    endTimeRef.current = null;
  };

  const handleStopAlarm = () => {
    sound.playClick();
    sound.stopContinuousAlarm();
    setIsAlarmActive(false);
  };

  const applyPreset = (minutes: number, seconds: number = 0) => {
    sound.playClick();
    handleStopAlarm();
    setIsRunning(false);
    setInitialHours(0);
    setInitialMinutes(minutes);
    setInitialSeconds(seconds);
    const total = minutes * 60 + seconds;
    setTotalSetSeconds(total);
    setRemainingSeconds(total);
    pausedTimeRemainingRef.current = total;
    endTimeRef.current = null;
  };

  const addTime = (secsToAdd: number) => {
    sound.playClick();
    setRemainingSeconds((prev) => {
      const updated = prev + secsToAdd;
      pausedTimeRemainingRef.current = updated;
      if (endTimeRef.current) {
        endTimeRef.current += secsToAdd * 1000;
      }
      return updated;
    });
    setTotalSetSeconds((prev) => Math.max(prev, prev + secsToAdd));
  };

  const updateHours = (delta: number) => {
    sound.playClick();
    const val = Math.max(0, Math.min(23, initialHours + delta));
    setInitialHours(val);
    if (!isRunning) {
      const total = val * 3600 + initialMinutes * 60 + initialSeconds;
      setTotalSetSeconds(total);
      setRemainingSeconds(total);
      pausedTimeRemainingRef.current = total;
    }
  };

  const updateMinutes = (delta: number) => {
    sound.playClick();
    const val = Math.max(0, Math.min(59, initialMinutes + delta));
    setInitialMinutes(val);
    if (!isRunning) {
      const total = initialHours * 3600 + val * 60 + initialSeconds;
      setTotalSetSeconds(total);
      setRemainingSeconds(total);
      pausedTimeRemainingRef.current = total;
    }
  };

  const updateSeconds = (delta: number) => {
    sound.playClick();
    const val = Math.max(0, Math.min(59, initialSeconds + delta));
    setInitialSeconds(val);
    if (!isRunning) {
      const total = initialHours * 3600 + initialMinutes * 60 + val;
      setTotalSetSeconds(total);
      setRemainingSeconds(total);
      pausedTimeRemainingRef.current = total;
    }
  };

  const { hours, minutes, seconds } = formatTimeParts(Math.ceil(remainingSeconds));
  const progressRatio = totalSetSeconds > 0 ? Math.min(1, Math.max(0, remainingSeconds / totalSetSeconds)) : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const formatNum = (str: string | number) =>
    usePersianDigits ? toPersianDigits(str) : String(str);

  return (
    <div className="flex flex-col items-center">
      {/* 3D Alarm Banner when timer finishes */}
      {isAlarmActive && (
        <div className="w-full mb-6 p-5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 text-white shadow-[0_0_35px_rgba(244,63,94,0.6)] animate-bounce border-2 border-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full animate-spin">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">زمان شما به پایان رسید! (زنگ تایمر)</h2>
              <p className="text-sm text-red-100">
                صدای زنگ در حال پخش است. برای قطع کردن روی دکمه زیر کلیک کنید.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStopAlarm}
            className="btn-3d px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-base hover:bg-slate-900 border border-white/30 flex items-center gap-2 cursor-pointer shadow-2xl"
          >
            <BellOff className="w-5 h-5 text-rose-400" />
            قطع کردن زنگ
          </button>
        </div>
      )}

      {/* Main 3D Display Panel */}
      <div className={`relative w-full max-w-2xl rounded-3xl p-6 sm:p-10 border text-center overflow-hidden mb-6 transition-colors duration-200 ${
        isLight
          ? 'screen-recessed-light bg-[#0a1120] border-slate-700/80 shadow-2xl'
          : 'screen-recessed bg-[#060912] border-slate-800/90'
      }`}>
        {/* Subtle glass reflection on the display */}
        <div className="absolute inset-0 glass-reflection pointer-events-none" />

        {/* Status header inside 3D screen */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning && !isAutoPaused
                  ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                  : isAutoPaused
                  ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                  : 'bg-slate-600'
              }`}
            />
            <span className="font-medium text-slate-300">
              {isRunning && !isAutoPaused
                ? 'شمارش فعال'
                : isAutoPaused
                ? 'توقف خودکار (عدم حرکت کاربر)'
                : 'آماده به کار'}
            </span>
          </div>

          <div className="font-mono-digits font-bold text-cyan-400">
            {formatNum(progressPercent)}% باقی‌مانده
          </div>
        </div>

        {/* Big 3D Digital Time Readout - LTR: Hours (Left), Minutes (Center), Seconds (Right) */}
        <div className="py-4 flex items-baseline justify-center gap-2 sm:gap-4 select-none" dir="ltr">
          {/* Hours block if > 0 or always show for clarity */}
          <div className="flex flex-col items-center">
            <span className="font-mono-digits text-5xl sm:text-7xl md:text-8xl font-black text-cyan-400 glow-cyan tracking-wider">
              {formatNum(hours)}
            </span>
            <span className="text-[11px] text-slate-400 font-bold mt-1">ساعت (Hours)</span>
          </div>

          <span className="font-mono-digits text-4xl sm:text-6xl text-cyan-500/60 font-black animate-pulse pb-4">
            :
          </span>

          {/* Minutes block */}
          <div className="flex flex-col items-center">
            <span className="font-mono-digits text-5xl sm:text-7xl md:text-8xl font-black text-cyan-300 glow-cyan tracking-wider">
              {formatNum(minutes)}
            </span>
            <span className="text-[11px] text-slate-400 font-bold mt-1">دقیقه (Min)</span>
          </div>

          <span className="font-mono-digits text-4xl sm:text-6xl text-cyan-500/60 font-black animate-pulse pb-4">
            :
          </span>

          {/* Seconds block */}
          <div className="flex flex-col items-center">
            <span className="font-mono-digits text-5xl sm:text-7xl md:text-8xl font-black text-cyan-400 glow-cyan tracking-wider">
              {formatNum(seconds)}
            </span>
            <span className="text-[11px] text-slate-400 font-bold mt-1">ثانیه (Sec)</span>
          </div>
        </div>

        {/* 3D Cylindrical Progress Gauge */}
        <div className="mt-4 w-full bg-slate-950/90 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Primary Action Buttons (3D Tactile Physical Controls) */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        {!isRunning ? (
          <button
            type="button"
            onClick={handleStart}
            className="btn-3d btn-3d-emerald px-8 py-3.5 rounded-2xl text-white font-extrabold text-lg flex items-center gap-3 cursor-pointer min-w-[170px] justify-center"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>شروع تایمر</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            className="btn-3d btn-3d-amber px-8 py-3.5 rounded-2xl text-white font-extrabold text-lg flex items-center gap-3 cursor-pointer min-w-[170px] justify-center"
          >
            <Pause className="w-6 h-6 fill-current" />
            <span>توقف موقت</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleReset}
          className={`btn-3d px-6 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 cursor-pointer ${
            isLight
              ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300 shadow-sm'
              : 'btn-3d-dark text-slate-200 hover:text-white'
          }`}
        >
          <RotateCcw className="w-5 h-5 text-slate-400" />
          <span>تنظیم مجدد</span>
        </button>

        {isRunning && (
          <button
            type="button"
            onClick={() => addTime(60)}
            className={`btn-3d px-4 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-1.5 cursor-pointer ${
              isLight
                ? 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border border-cyan-300'
                : 'btn-3d-dark text-cyan-300 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+۱ دقیقه</span>
          </button>
        )}
      </div>

      {/* Manual Time Input & Adjustment - LTR order: Hours (left), Minutes (middle), Seconds (right) */}
      <div className={`w-full rounded-2xl border p-5 shadow-lg mb-6 transition-colors duration-200 ${
        isLight ? 'bg-slate-100/90 border-slate-300' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            <Clock className="w-4 h-4 text-cyan-500" />
            <span>تنظیم دقیق زمان دستی (ساعت:دقیقه:ثانیه):</span>
          </div>
          <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            ساعت سمت چپ، دقیقه وسط و ثانیه سمت راست
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto" dir="ltr">
          {/* Hours Input (Left) */}
          <div className={`flex flex-col items-center p-3 rounded-2xl border ${
            isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <span className={`text-xs font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              ساعت (Hours)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateHours(-1)}
                className={`btn-3d w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${
                  isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'btn-3d-dark text-slate-200'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`font-mono-digits text-2xl font-black min-w-[36px] text-center ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {formatNum(padZero(initialHours))}
              </span>
              <button
                type="button"
                onClick={() => updateHours(1)}
                className={`btn-3d w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${
                  isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'btn-3d-dark text-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Minutes Input (Center) */}
          <div className={`flex flex-col items-center p-3 rounded-2xl border ${
            isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <span className={`text-xs font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              دقیقه (Min)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateMinutes(-1)}
                className={`btn-3d w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${
                  isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'btn-3d-dark text-slate-200'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`font-mono-digits text-2xl font-black min-w-[36px] text-center ${
                isLight ? 'text-cyan-700' : 'text-cyan-300'
              }`}>
                {formatNum(padZero(initialMinutes))}
              </span>
              <button
                type="button"
                onClick={() => updateMinutes(1)}
                className={`btn-3d w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${
                  isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'btn-3d-dark text-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Seconds Input (Right) */}
          <div className={`flex flex-col items-center p-3 rounded-2xl border ${
            isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <span className={`text-xs font-bold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              ثانیه (Sec)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateSeconds(-1)}
                className={`btn-3d w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${
                  isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'btn-3d-dark text-slate-200'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`font-mono-digits text-2xl font-black min-w-[36px] text-center ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                {formatNum(padZero(initialSeconds))}
              </span>
              <button
                type="button"
                onClick={() => updateSeconds(1)}
                className={`btn-3d w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer ${
                  isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'btn-3d-dark text-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Preset Buttons (including 5 min requested) */}
      <div className="w-full">
        <div className={`text-xs font-bold mb-2.5 flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>زمان‌های پیش‌فرض پرکاربرد:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => applyPreset(1)}
            className={`btn-3d px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
              isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'btn-3d-dark text-slate-300 hover:text-white'
            }`}
          >
            {formatNum(1)} دقیقه
          </button>

          <button
            type="button"
            onClick={() => applyPreset(5)}
            className="btn-3d btn-3d-primary px-4 py-2 rounded-xl text-xs font-extrabold text-white cursor-pointer shadow-md"
          >
            ⭐ {formatNum(5)} دقیقه (درخواست شما)
          </button>

          <button
            type="button"
            onClick={() => applyPreset(10)}
            className={`btn-3d px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
              isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'btn-3d-dark text-slate-300 hover:text-white'
            }`}
          >
            {formatNum(10)} دقیقه
          </button>

          <button
            type="button"
            onClick={() => applyPreset(15)}
            className={`btn-3d px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
              isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'btn-3d-dark text-slate-300 hover:text-white'
            }`}
          >
            {formatNum(15)} دقیقه
          </button>

          <button
            type="button"
            onClick={() => applyPreset(25)}
            className="btn-3d btn-3d-amber px-3.5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
          >
            🍅 {formatNum(25)} دقیقه پومودورو
          </button>

          <button
            type="button"
            onClick={() => applyPreset(45)}
            className={`btn-3d px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
              isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'btn-3d-dark text-slate-300 hover:text-white'
            }`}
          >
            {formatNum(45)} دقیقه
          </button>

          <button
            type="button"
            onClick={() => applyPreset(60)}
            className={`btn-3d px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
              isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'btn-3d-dark text-slate-300 hover:text-white'
            }`}
          >
            {formatNum(1)} ساعت
          </button>
        </div>
      </div>
    </div>
  );
};
