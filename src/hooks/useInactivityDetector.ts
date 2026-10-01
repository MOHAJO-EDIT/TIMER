import { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../utils/sound';

interface UseInactivityDetectorOptions {
  thresholdSeconds?: number;
  enabled?: boolean;
  isTimerRunning: boolean;
  onAutoPause?: () => void;
  onAutoResume?: () => void;
  playChimes?: boolean;
}

export function useInactivityDetector({
  thresholdSeconds = 30,
  enabled = true,
  isTimerRunning,
  onAutoPause,
  onAutoResume,
  playChimes = true
}: UseInactivityDetectorOptions) {
  const [isIdle, setIsIdle] = useState(false);
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(thresholdSeconds);

  const lastActivityRef = useRef<number>(Date.now());
  const isIdleRef = useRef<boolean>(false);
  const isAutoPausedRef = useRef<boolean>(false);
  const isTimerRunningRef = useRef<boolean>(isTimerRunning);
  const thresholdMs = thresholdSeconds * 1000;

  // Keep ref up to date to prevent stale closures
  useEffect(() => {
    isTimerRunningRef.current = isTimerRunning;
  }, [isTimerRunning]);

  // Handle active user interaction (mouse move, key press, scroll, etc.)
  const handleUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();

    // If it was idle or auto-paused, resume now!
    if (isIdleRef.current || isAutoPausedRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);

      if (isAutoPausedRef.current) {
        isAutoPausedRef.current = false;
        setIsAutoPaused(false);
        if (playChimes) {
          sound.playAutoResumeChime();
        }
        if (onAutoResume) {
          onAutoResume();
        }
      }
    }
  }, [onAutoResume, playChimes]);

  // Force trigger idle (useful for quick testing / demonstration)
  const triggerManualIdle = useCallback(() => {
    if (!enabled) return;
    lastActivityRef.current = Date.now() - thresholdMs - 500;
  }, [enabled, thresholdMs]);

  // Attach zero-overhead event listeners to window
  useEffect(() => {
    if (!enabled) {
      setIsIdle(false);
      setIsAutoPaused(false);
      return;
    }

    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'wheel',
      'scroll',
      'touchstart',
      'pointermove'
    ];

    const onEvent = () => {
      handleUserActivity();
    };

    // Use passive listener for best browser performance / minimal CPU
    events.forEach((evt) => {
      window.addEventListener(evt, onEvent, { passive: true });
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, onEvent);
      });
    };
  }, [enabled, handleUserActivity]);

  // Polling loop checking elapsed idle time (runs every 200ms)
  useEffect(() => {
    if (!enabled) {
      setSecondsRemaining(thresholdSeconds);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const left = Math.max(0, Math.ceil((thresholdMs - elapsed) / 1000));
      setSecondsRemaining(left);

      // Check if threshold exceeded
      if (elapsed >= thresholdMs) {
        if (!isIdleRef.current) {
          isIdleRef.current = true;
          setIsIdle(true);

          // If timer is running, trigger auto-pause
          if (isTimerRunningRef.current && !isAutoPausedRef.current) {
            isAutoPausedRef.current = true;
            setIsAutoPaused(true);
            if (playChimes) {
              sound.playAutoPauseChime();
            }
            if (onAutoPause) {
              onAutoPause();
            }
          }
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [enabled, thresholdMs, thresholdSeconds, onAutoPause, playChimes]);

  return {
    isIdle,
    isAutoPaused,
    secondsRemaining,
    handleUserActivity,
    triggerManualIdle,
    setIsAutoPaused: (val: boolean) => {
      isAutoPausedRef.current = val;
      setIsAutoPaused(val);
    }
  };
}
