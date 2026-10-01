import React, { useState } from 'react';
import {
  Timer as TimerIcon,
  Watch as StopwatchIcon,
  Volume2,
  VolumeX,
  Settings,
  Maximize2,
  Minimize2,
  Languages,
  Eye,
  BellRing,
  Sun,
  Moon
} from 'lucide-react';
import { sound } from '../utils/sound';
import { toPersianDigits } from '../utils/format';

export type AppMode = 'countdown' | 'stopwatch';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (m: AppMode) => void;
  idleThreshold: number;
  onIdleThresholdChange: (val: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  usePersianDigits: boolean;
  onToggleDigits: () => void;
  enable3DTilt: boolean;
  onToggle3D: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  idleThreshold,
  onIdleThresholdChange,
  isMuted,
  onToggleMute,
  usePersianDigits,
  onToggleDigits,
  enable3DTilt,
  onToggle3D,
  theme,
  onToggleTheme,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isLight = theme === 'light';

  const toggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleTestAlarm = () => {
    sound.playAlarmBurst();
  };

  const thresholdOptions = [10, 15, 30, 45, 60, 120];

  return (
    <header className={`mb-6 border-b pb-5 transition-colors duration-200 ${isLight ? 'border-slate-300' : 'border-slate-700/60'}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20 flex items-center justify-center border border-white/20">
            <TimerIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black tracking-tight flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span>تایمر و کرونومتر هوشمند</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono-digits ${isLight ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'}`}>
                3D Low-RAM
              </span>
            </h1>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              توقف خودکار هنگام عدم استفاده از لپتاپ • ادامه با حرکت موس
            </p>
          </div>
        </div>

        {/* Mode Selector (3D Physical Rocker Tabs) */}
        <div className={`p-1 rounded-2xl border shadow-inner flex items-center gap-1.5 w-full sm:w-auto justify-center ${isLight ? 'bg-slate-200/90 border-slate-300' : 'bg-slate-950/80 border-slate-800'}`}>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onModeChange('countdown');
            }}
            className={`btn-3d flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              mode === 'countdown'
                ? 'btn-3d-primary text-white shadow-lg'
                : isLight
                ? 'text-slate-700 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TimerIcon className="w-4 h-4" />
            تایمر معکوس (زنگ‌دار)
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onModeChange('stopwatch');
            }}
            className={`btn-3d flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              mode === 'stopwatch'
                ? 'btn-3d-primary text-white shadow-lg'
                : isLight
                ? 'text-slate-700 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <StopwatchIcon className="w-4 h-4" />
            کرونومتر (ثبت زمان)
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onToggleTheme();
            }}
            title={isLight ? 'حالت تاریک (Dark Mode)' : 'حالت روشن (Light Mode)'}
            className={`btn-3d p-2.5 rounded-xl border cursor-pointer flex items-center justify-center transition-all ${
              isLight
                ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200 shadow-sm'
                : 'bg-slate-800/80 text-amber-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            title={isMuted ? 'فعال کردن صدا' : 'قطع صدا'}
            className={`btn-3d p-2.5 rounded-xl border cursor-pointer ${
              isMuted
                ? 'bg-rose-950/50 text-rose-400 border-rose-800/50'
                : isLight
                ? 'bg-slate-200 text-blue-600 border-slate-300 hover:bg-slate-300'
                : 'bg-slate-800/80 text-cyan-400 hover:bg-slate-700 border-slate-700/60'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Persian / English Digits */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onToggleDigits();
            }}
            title="تغییر ارقام به فارسی / لاتین"
            className={`btn-3d px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              isLight
                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300'
                : 'btn-3d-dark text-slate-300 hover:text-white'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-cyan-500" />
            <span>{usePersianDigits ? 'ارقام فارسی' : 'Latin 0123'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title="تمام‌صفحه"
            className={`btn-3d p-2.5 rounded-xl cursor-pointer ${
              isLight
                ? 'bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300'
                : 'btn-3d-dark text-slate-300 hover:text-white'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setShowSettings(!showSettings);
            }}
            title="تنظیمات حساسیت بی‌حرکتی و جلوه‌ها"
            className={`btn-3d p-2.5 rounded-xl border cursor-pointer ${
              showSettings
                ? 'bg-cyan-600 text-white border-cyan-400'
                : isLight
                ? 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Accordion Dropdown */}
      {showSettings && (
        <div className={`mt-4 p-4 rounded-2xl border shadow-2xl space-y-4 ${
          isLight
            ? 'bg-slate-100/95 border-slate-300 text-slate-800'
            : 'bg-slate-950/90 border-slate-800 text-white'
        }`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
            isLight ? 'border-slate-300' : 'border-slate-800/80'
          }`}>
            <div>
              <div className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>زمان تشخیص عدم فعالیت (پیش‌فرض: ۳۰ ثانیه):</span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                اگر لپتاپ برای این مدت بدون حرکت بماند، تایمر موقتاً متوقف خواهد شد.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {thresholdOptions.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onIdleThresholdChange(sec);
                  }}
                  className={`btn-3d px-3 py-1.5 rounded-lg text-xs font-bold font-mono-digits cursor-pointer ${
                    idleThreshold === sec
                      ? 'btn-3d-primary text-white ring-2 ring-blue-400/50'
                      : isLight
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {usePersianDigits ? toPersianDigits(sec) : sec} ثانیه
                  {sec === 30 && ' (اصلی)'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            {/* 3D Tilt toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onToggle3D();
                }}
                className={`btn-3d px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                  enable3DTilt
                    ? isLight
                      ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                      : 'bg-cyan-900/60 text-cyan-300 border border-cyan-700'
                    : isLight
                    ? 'bg-slate-200 text-slate-600 border border-slate-300'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>حرکت زاویه سه‌بعدی با موس: {enable3DTilt ? 'فعال' : 'غیرفعال (حداقل مصرف رم)'}</span>
              </button>
            </div>

            {/* Test Alarm Sound Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestAlarm}
                className={`btn-3d px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                  isLight
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                    : 'btn-3d-dark text-amber-300 hover:text-amber-200 border border-amber-800/40'
                }`}
              >
                <BellRing className="w-3.5 h-3.5 text-amber-500" />
                تست صدای زنگ و اسپیکر
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
