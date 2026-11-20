/**
 * AETHER Procedural Web Audio Soundscape Engine
 * Fully synthesized natural audio: rain, wind, thunder, and serene atmospheric tones.
 * Zero external audio files required!
 */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.currentPreset = 'breeze';
    this.isPlaying = false;
    this.activeNodes = [];
    this.thunderInterval = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, val));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  setPreset(preset) {
    this.currentPreset = preset;
    if (this.isPlaying) {
      this.stop();
      this.play(preset);
    }
  }

  play(preset = this.currentPreset) {
    this.initContext();
    this.stop();

    this.isPlaying = true;
    this.currentPreset = preset;

    switch (preset) {
      case 'rain':
        this.startRainSound();
        break;
      case 'thunder':
        this.startThunderSound();
        break;
      case 'snow-wind':
      case 'breeze':
        this.startWindSound();
        break;
      default:
        this.startSereneSound();
        break;
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.thunderInterval) {
      clearInterval(this.thunderInterval);
      this.thunderInterval = null;
    }

    // Fade out and disconnect existing nodes
    this.activeNodes.forEach(({ node, gain }) => {
      try {
        if (gain && this.ctx) {
          gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
        }
        setTimeout(() => {
          try {
            node.disconnect();
          } catch {}
        }, 200);
      } catch {}
    });
    this.activeNodes = [];
  }

  // --- Synthesized Soundscapes ---

  // 1. Procedural Rain (White noise through gentle highpass/lowpass filters)
  startRainSound() {
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate raindrops frequency
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    rainGain.gain.linearRampToValueAtTime(0.28, this.ctx.currentTime + 1);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push({ node: whiteNoise, gain: rainGain });
  }

  // 2. Procedural Thunder (Low-pass resonant boom + intermittent rumble)
  startThunderSound() {
    this.startRainSound(); // Thunder includes ambient rain

    const triggerBoom = () => {
      if (!this.isPlaying || !this.ctx) return;

      const osc = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      const boomFilter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 1.8);

      boomFilter.type = 'lowpass';
      boomFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

      boomGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      boomGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.1);
      boomGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

      osc.connect(boomFilter);
      boomFilter.connect(boomGain);
      boomGain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.6);
    };

    setTimeout(triggerBoom, 1200);
    this.thunderInterval = setInterval(() => {
      if (Math.random() < 0.6) {
        triggerBoom();
      }
    }, 8000);
  }

  // 3. Procedural Wind / Winter Breeze
  startWindSound() {
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Pink-ish noise
    }

    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    // Modulated Bandpass Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // LFO to modulate wind howling
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);

    lfo.connect(filter.frequency);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    windGain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 1.2);

    windSource.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.masterGain);

    windSource.start();
    lfo.start();

    this.activeNodes.push({ node: windSource, gain: windGain });
    this.activeNodes.push({ node: lfo });
  }

  // 4. Serene Celestial Ambient Tone
  startSereneSound() {
    if (!this.ctx) return;

    const baseFreqs = [196, 246.94, 293.66]; // G major chord
    baseFreqs.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.activeNodes.push({ node: osc, gain });
    });
  }
}

export const audioEngine = new AudioEngine();
