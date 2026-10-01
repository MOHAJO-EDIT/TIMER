/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { ChassisWrapper } from './components/ChassisWrapper';
import { Header, AppMode } from './components/Header';
import { IdleStatusBar } from './components/IdleStatusBar';
import { CountdownTimer } from './components/CountdownTimer';
import { Stopwatch } from './components/Stopwatch';
import { InactivityStats } from './components/InactivityStats';
import { useInactivityDetector } from './hooks/useInactivityDetector';
import { sound } from './utils/sound';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mode, setMode] = useState<AppMode>('countdown');
  const [idleThreshold, setIdleThreshold] = useState<number>(30); // Default 30 seconds as requested!
  const [usePersianDigits, setUsePersianDigits] = useState<boolean>(true);
  const [enable3DTilt, setEnable3DTilt] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Statistics
  const [autoPauseCount, setAutoPauseCount] = useState<number>(0);
  const [totalPausedSeconds, setTotalPausedSeconds] = useState<number>(0);
  const autoPauseStartTimestampRef = useRef<number | null>(null);

  // Callbacks for auto-pause and auto-resume
  const handleAutoPause = useCallback(() => {
    setAutoPauseCount((prev) => prev + 1);
    autoPauseStartTimestampRef.current = Date.now();
  }, []);

  const handleAutoResume = useCallback(() => {
    if (autoPauseStartTimestampRef.current !== null) {
      const elapsed = Math.floor((Date.now() - autoPauseStartTimestampRef.current) / 1000);
      setTotalPausedSeconds((prev) => prev + Math.max(0, elapsed));
      autoPauseStartTimestampRef.current = null;
    }
  }, []);

  // Inactivity detection hook
  const {
    isIdle,
    isAutoPaused,
    secondsRemaining,
    triggerManualIdle,
  } = useInactivityDetector({
    thresholdSeconds: idleThreshold,
    enabled: true,
    isTimerRunning: isTimerRunning,
    onAutoPause: handleAutoPause,
    onAutoResume: handleAutoResume,
    playChimes: !isMuted,
  });

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.isMuted = next;
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isLight = theme === 'light';

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 selection:bg-cyan-500 selection:text-white transition-colors duration-300 ${
      isLight ? 'bg-[#e9edf3] text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] ${
          isLight ? 'bg-blue-300/25' : 'bg-blue-600/10'
        }`} />
        <div className={`absolute bottom-10 right-10 w-[350px] h-[350px] rounded-full blur-[120px] ${
          isLight ? 'bg-cyan-300/25' : 'bg-cyan-600/10'
        }`} />
      </div>

      {/* 3D Physical Chassis Container */}
      <ChassisWrapper enable3DTilt={enable3DTilt} theme={theme}>
        {/* Header navigation & controls */}
        <Header
          mode={mode}
          onModeChange={setMode}
          idleThreshold={idleThreshold}
          onIdleThresholdChange={setIdleThreshold}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          usePersianDigits={usePersianDigits}
          onToggleDigits={() => setUsePersianDigits((prev) => !prev)}
          enable3DTilt={enable3DTilt}
          onToggle3D={() => setEnable3DTilt((prev) => !prev)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Real-time Inactivity Status & Alert Banner */}
        <IdleStatusBar
          isIdle={isIdle}
          isAutoPaused={isAutoPaused}
          secondsRemaining={secondsRemaining}
          thresholdSeconds={idleThreshold}
          isTimerRunning={isTimerRunning}
          usePersianDigits={usePersianDigits}
          onSimulateIdle={triggerManualIdle}
          enabled={true}
          theme={theme}
        />

        {/* Active Mode View */}
        {mode === 'countdown' ? (
          <CountdownTimer
            usePersianDigits={usePersianDigits}
            isAutoPaused={isAutoPaused}
            onRunningChange={setIsTimerRunning}
            theme={theme}
          />
        ) : (
          <Stopwatch
            usePersianDigits={usePersianDigits}
            isAutoPaused={isAutoPaused}
            onRunningChange={setIsTimerRunning}
            theme={theme}
          />
        )}

        {/* Inactivity & Low-RAM Statistics Footer */}
        <InactivityStats
          usePersianDigits={usePersianDigits}
          autoPauseCount={autoPauseCount}
          totalPausedSeconds={totalPausedSeconds}
          thresholdSeconds={idleThreshold}
          theme={theme}
        />
      </ChassisWrapper>

      {/* Footer tip */}
      <footer className={`mt-4 text-center text-xs transition-colors duration-200 ${
        isLight ? 'text-slate-500' : 'text-slate-500'
      }`}>
        تایمر سه‌بعدی بهینه‌شده برای مرورگر کروم لپتاپ • بدون اشغال حافظه رم
      </footer>
    </main>
  );
}
