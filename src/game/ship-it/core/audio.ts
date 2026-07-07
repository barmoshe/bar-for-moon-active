/**
 * audio.ts — a tiny PROCEDURAL Web Audio engine. No audio files, no downloads, zero asset weight:
 * every cue (reel tick, coin clink, SHIPPED chime, win fanfare) is synthesized from oscillators +
 * gain envelopes. Sound is OFF by default (autoplay etiquette, guardrail §11); the toggle turns it
 * on, which is also the user gesture that unlocks the AudioContext. Guarded so a host without
 * Web Audio never throws.
 */

export class AudioEngine {
  private acx: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = false;

  private ensure(): void {
    if (this.acx) return;
    try {
      const Ctor: typeof AudioContext =
        (window as unknown as { AudioContext: typeof AudioContext }).AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.acx = new Ctor();
      this.master = this.acx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.acx.destination);
    } catch {
      this.acx = null;
    }
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (on) {
      this.ensure();
      void this.acx?.resume?.();
    }
  }

  private blip(freq: number, dur: number, type: OscillatorType, when = 0, gain = 1): void {
    if (!this.enabled || !this.acx || !this.master) return;
    const t0 = this.acx.currentTime + when;
    const osc = this.acx.createOscillator();
    const g = this.acx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  tick(): void {
    this.blip(320, 0.05, 'square', 0, 0.5);
  }
  coin(): void {
    this.blip(880, 0.08, 'triangle', 0, 0.7);
    this.blip(1320, 0.09, 'triangle', 0.04, 0.5);
  }
  chime(): void {
    [523, 659, 784, 1047].forEach((f, i) => this.blip(f, 0.35, 'triangle', i * 0.07, 0.6));
  }
  fanfare(): void {
    [523, 659, 784, 1047, 1319].forEach((f, i) => this.blip(f, 0.5, 'sawtooth', i * 0.1, 0.45));
    [261, 392].forEach((f, i) => this.blip(f, 0.9, 'triangle', 0.1 + i * 0.2, 0.5));
  }
}
