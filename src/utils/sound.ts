/**
 * Zero-memory Web Audio API Synthesizer
 * No external sound files loaded into RAM.
 * Synthesizes crisp crystal bell chimes and tactile switch clicks directly.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private alarmOscillators: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode }[] = [];
  private alarmInterval: number | null = null;
  public isMuted: boolean = false;
  public volume: number = 0.7;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Tactile mechanical button click (simulates physical micro-switch)
   */
  playClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.18 * this.volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  /**
   * Gentle reminder when idle auto-pause triggers
   */
  playAutoPauseChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.25); // A4

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // ignore
    }
  }

  /**
   * Welcoming chime when user moves mouse and resumes
   */
  playAutoResumeChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.22); // G5

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }

  /**
   * Full Alarm: Melodic clear bell chime when countdown reaches zero
   */
  playAlarmBurst() {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      const notes = [
        { freq: 880, delay: 0 },       // A5
        { freq: 1108.73, delay: 0.12 }, // C#6
        { freq: 1318.51, delay: 0.24 }, // E6
        { freq: 1760, delay: 0.36 }     // A6
      ];

      notes.forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.28 * this.volume, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.5);
      });
    } catch {
      // ignore
    }
  }

  startContinuousAlarm() {
    this.stopContinuousAlarm();
    this.playAlarmBurst();
    this.alarmInterval = window.setInterval(() => {
      this.playAlarmBurst();
    }, 1200);
  }

  stopContinuousAlarm() {
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }
}

export const sound = new SoundEngine();
