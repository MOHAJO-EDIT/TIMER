/**
 * Formatting and Persian localization utilities
 */

export const toPersianDigits = (numStr: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(numStr).replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
};

export const padZero = (n: number, length: number = 2): string => {
  return String(Math.floor(n)).padStart(length, '0');
};

export const formatTimeParts = (totalSeconds: number) => {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return {
    hours: padZero(hours),
    minutes: padZero(minutes),
    seconds: padZero(seconds),
    totalSeconds: clamped
  };
};

export const formatStopwatchMs = (totalMs: number) => {
  const clamped = Math.max(0, totalMs);
  const hours = Math.floor(clamped / 3600000);
  const minutes = Math.floor((clamped % 3600000) / 60000);
  const seconds = Math.floor((clamped % 60000) / 1000);
  const centiseconds = Math.floor((clamped % 1000) / 10);

  return {
    hours: padZero(hours),
    minutes: padZero(minutes),
    seconds: padZero(seconds),
    centiseconds: padZero(centiseconds),
    formatted: `${hours > 0 ? padZero(hours) + ':' : ''}${padZero(minutes)}:${padZero(seconds)}.${padZero(centiseconds)}`
  };
};
