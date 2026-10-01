import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Trash2 } from 'lucide-react';
import { sound } from '../utils/sound';
import { formatStopwatchMs, toPersianDigits } from '../utils/format';

interface LapItem {
  id: number;
  lapTime: number;
  overallTime: number;
}

interface StopwatchProps {
  usePersianDigits: boolean;
  isAutoPaused: boolean;
  onRunningChange: (isRunning: boolean) => void;
  theme?: 'dark' | 'light';
}

export const Stopwatch: React.FC<StopwatchProps> = ({
  usePersianDigits,
  isAutoPaused,
  onRunningChange,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapItem[]>([]);

  // High precision refs
  const startTimeRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastLapTimeRef = useRef<number>(0);

  // Sync running state up to parent for inactivity detector
  useEffect(() => {
    onRunningChange(isRunning && !isAutoPaused);
  }, [isRunning, isAutoPaused, onRunningChange]);

  // Handle auto-pause from inactivity detector
  useEffect(() => {
    if (isAutoPaused && isRunning) {
      // Accumulate current run slice and freeze
      if (startTimeRef.current !== null) {
        accumulatedMsRef.current += performance.now() - startTimeRef.current;
        startTimeRef.current = null;
      }
    } else if (!isAutoPaused && isRunning) {
      // User moved mouse, resume counting smoothly!
      startTimeRef.current = performance.now();
    }
  }, [isAutoPaused, isRunning]);

  // Stopwatch ticking loop
  useEffect(() => {
    if (!isRunning || isAutoPaused) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }

    const tick = () => {
      if (startTimeRef.current !== null) {
        const currentSlice = performance.now() - startTimeRef.current;
        setElapsedMs(accumulatedMsRef.current + currentSlice);
      }
      animFrameRef.current = requestAnimationFrame(tick);
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
    startTimeRef.current = performance.now();
    setIsRunning(true);
  };

  const handlePause = () => {
    sound.playClick();
    if (startTimeRef.current !== null) {
      accumulatedMsRef.current += performance.now() - startTimeRef.current;
      startTimeRef.current = null;
      setElapsedMs(accumulatedMsRef.current);
    }
    setIsRunning(false);
  };

  const handleReset = () => {
    sound.playClick();
    setIsRunning(false);
    startTimeRef.current = null;
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
    lastLapTimeRef.current = 0;
  };

  const handleLap = () => {
    sound.playClick();
    const currentTotal = elapsedMs;
    const lapDuration = currentTotal - lastLapTimeRef.current;
    lastLapTimeRef.current = currentTotal;

    const newLap: LapItem = {
      id: laps.length + 1,
      lapTime: lapDuration,
      overallTime: currentTotal,
    };

    setLaps((prev) => [newLap, ...prev]);
  };

  const { hours, minutes, seconds, centiseconds } = formatStopwatchMs(elapsedMs);

  const formatNum = (str: string | number) =>
    usePersianDigits ? toPersianDigits(str) : String(str);

  // Determine fastest & slowest laps
  let fastestId = -1;
  let slowestId = -1;
  if (laps.length >= 2) {
    let minTime = Infinity;
    let maxTime = -Infinity;
    laps.forEach((l) => {
      if (l.lapTime < minTime) {
        minTime = l.lapTime;
        fastestId = l.id;
      }
      if (l.lapTime > maxTime) {
        maxTime = l.lapTime;
        slowestId = l.id;
      }
    });
  }

  return (
    <div className="flex flex-col items-center">
      {/* 3D Recessed Display for Stopwatch */}
      <div className={`relative w-full max-w-2xl rounded-3xl p-6 sm:p-10 border text-center overflow-hidden mb-6 transition-colors duration-200 ${
        isLight
          ? 'screen-recessed-light bg-[#0a1120] border-slate-700/80 shadow-2xl'
          : 'screen-recessed bg-[#060912] border-slate-800/90'
      }`}>
        <div className="absolute inset-0 glass-reflection pointer-events-none" />

        {/* Status header inside 3D screen */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning && !isAutoPaused
                  ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                  : isAutoPaused
                  ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                  : 'bg-slate-600'
              }`}
            />
            <span className="font-medium text-slate-300">
              {isRunning && !isAutoPaused
                ? 'کرونومتر در حال ضبط زمان'
                : isAutoPaused
                ? 'توقف خودکار کرونومتر (کاربر غیرفعال)'
                : 'کرونومتر متوقف'}
            </span>
          </div>

          <div className="text-slate-400 font-mono-digits">
            دورهای ثبت‌شده: {formatNum(laps.length)}
          </div>
        </div>

        {/* Big 3D Digital Time Readout - LTR order: Hours (left) : Minutes (middle) : Seconds (right) . Centiseconds (far right) */}
        <div className="py-4 flex items-baseline justify-center gap-1.5 sm:gap-3 select-none" dir="ltr">
          {/* Hours block */}
          <div className="flex flex-col items-center">
            <span className="font-mono-digits text-4xl sm:text-7xl md:text-8xl font-black text-emerald-400 glow-emerald tracking-wider">
              {formatNum(hours)}
            </span>
            <span className="text-[11px] text-slate-400 font-bold mt-1">ساعت (H)</span>
          </div>

          <span className="font-mono-digits text-3xl sm:text-5xl text-emerald-500/60 font-black pb-4">
            :
          </span>

          {/* Minutes block */}
          <div className="flex flex-col items-center">
            <span className="font-mono-digits text-4xl sm:text-7xl md:text-8xl font-black text-emerald-300 glow-emerald tracking-wider">
              {formatNum(minutes)}
            </span>
            <span className="text-[11px] text-slate-400 font-bold mt-1">دقیقه (M)</span>
          </div>

          <span className="font-mono-digits text-3xl sm:text-5xl text-emerald-500/60 font-black pb-4">
            :
          </span>

          {/* Seconds block */}
          <div className="flex flex-col items-center">
            <span className="font-mono-digits text-4xl sm:text-7xl md:text-8xl font-black text-emerald-400 glow-emerald tracking-wider">
              {formatNum(seconds)}
            </span>
            <span className="text-[11px] text-slate-400 font-bold mt-1">ثانیه (S)</span>
          </div>

          <span className="font-mono-digits text-2xl sm:text-4xl text-emerald-500/60 font-bold pb-2">
            .
          </span>

          {/* Centiseconds (صدم ثانیه) */}
          <div className="flex flex-col items-center">
            <span className="font-mono-digits text-2xl sm:text-4xl md:text-5xl font-bold text-emerald-200 glow-emerald">
              {formatNum(centiseconds)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold mt-1">صدم (CS)</span>
          </div>
        </div>

        {/* Pulse Bar */}
        <div className="mt-4 w-full bg-slate-950/90 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
          <div
            className={`h-full rounded-full transition-all duration-100 bg-gradient-to-r from-emerald-500 to-cyan-400 ${
              isRunning && !isAutoPaused ? 'opacity-100 shadow-[0_0_10px_#10b981]' : 'opacity-30'
            }`}
            style={{ width: `${(Number(centiseconds) % 100)}%` }}
          />
        </div>
      </div>

      {/* Primary Action Buttons (3D Tactile Buttons) */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        {!isRunning ? (
          <button
            type="button"
            onClick={handleStart}
            className="btn-3d btn-3d-emerald px-8 py-3.5 rounded-2xl text-white font-extrabold text-lg flex items-center gap-3 cursor-pointer min-w-[170px] justify-center"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>شروع کرونومتر</span>
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
          onClick={handleLap}
          disabled={!isRunning}
          className={`btn-3d px-6 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 cursor-pointer ${
            isRunning
              ? 'btn-3d-primary text-white'
              : 'bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800'
          }`}
        >
          <Flag className="w-5 h-5" />
          <span>ثبت دور (Lap)</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={elapsedMs === 0}
          className={`btn-3d px-6 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 cursor-pointer ${
            elapsedMs > 0
              ? isLight
                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300 shadow-sm'
                : 'btn-3d-dark text-slate-200 hover:text-white'
              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          <span>صفر کردن</span>
        </button>
      </div>

      {/* Lap Times Table */}
      {laps.length > 0 && (
        <div className={`w-full rounded-2xl border p-5 shadow-lg transition-colors duration-200 ${
          isLight ? 'bg-slate-100/90 border-slate-300' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className={`flex items-center justify-between mb-4 pb-2 border-b ${
            isLight ? 'border-slate-300' : 'border-slate-800'
          }`}>
            <div className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Flag className="w-4 h-4 text-emerald-500" />
              <span>دورهای ثبت شده ({formatNum(laps.length)})</span>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setLaps([]);
                lastLapTimeRef.current = 0;
              }}
              className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              پاکسازی دورها
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {laps.map((lap) => {
              const lapParts = formatStopwatchMs(lap.lapTime);
              const totalParts = formatStopwatchMs(lap.overallTime);
              const isFastest = lap.id === fastestId;
              const isSlowest = lap.id === slowestId;

              return (
                <div
                  key={lap.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    isFastest
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : isSlowest
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                      : isLight
                      ? 'bg-white border-slate-300 text-slate-800 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg font-mono-digits font-bold flex items-center justify-center ${
                      isLight ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {formatNum(lap.id)}
                    </span>
                    <span className="font-medium">
                      دور {formatNum(lap.id)}
                      {isFastest && (
                        <span className="mr-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          سریع‌ترین
                        </span>
                      )}
                      {isSlowest && (
                        <span className="mr-2 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                          کندترین
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-6" dir="ltr">
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Lap Time</span>
                      <span className="font-mono-digits font-bold">
                        {formatNum(lapParts.formatted)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Total</span>
                      <span className="font-mono-digits text-slate-400">
                        {formatNum(totalParts.formatted)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
