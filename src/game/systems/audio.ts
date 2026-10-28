class Synth {
  private ctx: AudioContext | null = null;
  private voices = new Set<OscillatorNode>();
  muted = false;
  unlock() {
    try {
      this.ctx ??= new AudioContext();
      void this.ctx.resume().catch(() => {
        /* Gameplay remains usable without audio. */
      });
    } catch {
      /* Audio can be unavailable in restricted browser contexts. */
    }
  }
  mute(value: boolean) {
    this.muted = value;
    if (value) {
      this.voices.forEach((v) => {
        try {
          v.stop();
        } catch {
          /* already ended */
        }
      });
      this.voices.clear();
    }
  }
  play(kind: 'jump' | 'coin' | 'hurt' | 'skill' | 'checkpoint' | 'win') {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const c = this.ctx,
      osc = c.createOscillator(),
      gain = c.createGain(),
      now = c.currentTime;
    const notes = {
      jump: [220, 480],
      coin: [660, 990],
      hurt: [140, 50],
      skill: [110, 650],
      checkpoint: [440, 880],
      win: [523, 1046],
    };
    osc.type = kind === 'hurt' ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(notes[kind][0], now);
    osc.frequency.exponentialRampToValueAtTime(notes[kind][1], now + 0.15);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(now + 0.22);
    this.voices.add(osc);
    osc.onended = () => this.voices.delete(osc);
  }
}
export const audio = new Synth();
