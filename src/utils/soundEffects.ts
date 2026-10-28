// Web Audio API sound effects for child-friendly interactions

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Cheerful xylophone/glockenspiel chime when discovering a seed
  public playChime(pitchMultiplier: number = 1.0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const baseFrequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const startTime = ctx.currentTime;

    baseFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * pitchMultiplier, startTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, startTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.2, startTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.08);
      osc.stop(startTime + idx * 0.08 + 0.45);
    });
  }

  // Soft cheerful pop when tapping an individual seed
  public playPop() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Celebratory fanfare when all 10 seeds are collected
  public playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [
      { f: 523.25, t: 0.0, d: 0.18 },  // C5
      { f: 523.25, t: 0.2, d: 0.18 },  // C5
      { f: 523.25, t: 0.4, d: 0.18 },  // C5
      { f: 659.25, t: 0.6, d: 0.35 },  // E5
      { f: 783.99, t: 0.95, d: 0.35 }, // G5
      { f: 1046.50, t: 1.3, d: 0.8 },  // C6
    ];

    const now = ctx.currentTime;
    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.001, now + t);
      gain.gain.exponentialRampToValueAtTime(0.25, now + t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }

  // Blowing wind sound when kids blow "후~"
  public playWindBreeze(duration: number = 2.0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration * 0.6);
    filter.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + duration);
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Magic bloom shimmer when the yellow dandelion opens
  public playBloom() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25, 830.61, 880, 1108.73, 1318.51, 1661.22];
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(0.001, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.1 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.65);
    });
  }
}

export const sounds = new SoundManager();
