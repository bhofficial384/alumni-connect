// High quality celestial sound synthesizer using Web Audio API
// Completely standalone, zero network requests, zero CORS issues, works on all browsers

class SoundController {
  constructor() {
    this.ctx = null;
    this.ambientGain = null;
    this.isPlayingAmbient = false;
    this.isMuted = false;
    this.ambientInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(
        muted ? 0 : 0.18,
        this.ctx.currentTime,
        0.5
      );
    }
  }

  // Soft celestial chime for clicking stars or discovering memories
  playChime(pitchModifier = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pentatonic celestial frequencies (E6, G6, B6, D7, E7)
      const freqs = [1318.51, 1567.98, 1975.53, 2349.32, 2637.02];
      const baseFreq = freqs[Math.floor(Math.random() * freqs.length)] * pitchModifier;

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.6);
      osc2.stop(now + 1.6);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  // Soft paper rustle / letter open whoosh
  playEnvelopeOpen() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio error fallback
    }
  }

  // Blowing candle sound (gentle breath + sparkle)
  playBlowCandle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // Gentle white noise puff for the blow
      const bufferSize = this.ctx.sampleRate * 0.7;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.2));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();

      // Followed by celebratory chime
      setTimeout(() => {
        this.playCelebrationChord();
      }, 350);
    } catch {
      // Audio fallback
    }
  }

  // Harmonic chord of wishing / celebration
  playCelebrationChord() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Fmaj9 celestial chord (F4, A4, C5, E5, G5)
    const chord = [349.23, 440.00, 523.25, 659.25, 783.99];

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.06, now + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 2.5);
    });
  }

  // Gentle ambient generative celestial music (dreamy space chords)
  startAmbientMusic() {
    if (this.isPlayingAmbient) return;
    this.init();
    if (!this.ctx) return;

    this.isPlayingAmbient = true;

    if (!this.ambientGain) {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.16, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);
    }

    // Progression of celestial ambient chords (D minor, Bb Major 7, F Major, C Major)
    const progressions = [
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [233.08, 349.23, 440.0, 587.33], // BbMaj7
      [174.61, 261.63, 349.23, 440.0], // F
      [261.63, 329.63, 392.0, 493.88], // C
    ];

    let chordIdx = 0;

    const playAmbientChord = () => {
      if (!this.isPlayingAmbient || !this.ctx) return;

      const chord = progressions[chordIdx % progressions.length];
      chordIdx++;
      const now = this.ctx.currentTime;

      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Soft slow fade-in and long peaceful release
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(0.035, now + 2.0);
        noteGain.gain.linearRampToValueAtTime(0.0001, now + 6.8);

        osc.connect(noteGain);
        noteGain.connect(this.ambientGain);

        osc.start(now);
        osc.stop(now + 7.0);
      });
    };

    playAmbientChord();
    this.ambientInterval = setInterval(playAmbientChord, 5200);
  }

  stopAmbientMusic() {
    this.isPlayingAmbient = false;
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }
}

export const sounds = new SoundController();
