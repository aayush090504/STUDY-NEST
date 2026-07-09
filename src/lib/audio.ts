// A high-quality Web Audio API Synthesizer for cozy, looping ambient sounds.
// This guarantees zero external dependencies and 100% reliability offline without heavy assets.

class AmbientSynth {
  private ctx: AudioContext | null = null;
  private currentType: string = 'none';
  
  // Node references for cleanup
  private sourceNodes: AudioNode[] = [];
  private gainNode: GainNode | null = null;
  private intervalId: any = null;

  constructor() {
    // Audio context is initialized lazily upon user interaction to satisfy browser security policies
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate an AudioBuffer containing white noise
  private createNoiseBuffer(durationSeconds: number = 2): AudioBuffer {
    this.initCtx();
    const bufferSize = this.ctx!.sampleRate * durationSeconds;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Generate Pink Noise approximation
  private createPinkNoiseBuffer(durationSeconds: number = 2): AudioBuffer {
    this.initCtx();
    const bufferSize = this.ctx!.sampleRate * durationSeconds;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // estimate volume compensation
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public play(type: string, volume: number = 0.5) {
    this.stop();
    this.initCtx();
    
    if (type === 'none') {
      this.currentType = 'none';
      return;
    }

    this.currentType = type;
    this.gainNode = this.ctx!.createGain();
    this.gainNode.gain.setValueAtTime(volume * 0.3, this.ctx!.currentTime); // Keep sounds soft and ambient
    this.gainNode.connect(this.ctx!.destination);

    if (type === 'rain') {
      this.startRain();
    } else if (type === 'campfire') {
      this.startCampfire();
    } else if (type === 'nebula') {
      this.startNebula();
    } else if (type === 'cafe') {
      this.startCafe();
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(volume * 0.3, this.ctx.currentTime);
    }
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.sourceNodes.forEach(node => {
      try {
        (node as any).stop();
      } catch (e) {}
    });
    this.sourceNodes = [];
    
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.currentType = 'none';
  }

  private startRain() {
    const ctx = this.ctx!;
    const gain = this.gainNode!;

    // Rain sound is lowpass-filtered pink noise with slowly varying intensity
    const pinkNoise = ctx.createBufferSource();
    pinkNoise.buffer = this.createPinkNoiseBuffer(4);
    pinkNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    // Slowly modulate lowpass frequency for wind/intensity effects
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow LFO (12 seconds)
    
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(300, ctx.currentTime); // swing filter from 700 to 1300Hz

    osc.connect(oscGain);
    oscGain.connect(filter.frequency);
    
    pinkNoise.connect(filter);
    filter.connect(gain);

    pinkNoise.start(0);
    osc.start(0);

    this.sourceNodes.push(pinkNoise, osc);
  }

  private startCampfire() {
    const ctx = this.ctx!;
    const gain = this.gainNode!;

    // Campfire rumble: heavily filtered pink noise
    const rumble = ctx.createBufferSource();
    rumble.buffer = this.createPinkNoiseBuffer(3);
    rumble.loop = true;

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(180, ctx.currentTime);

    rumble.connect(rumbleFilter);
    rumbleFilter.connect(gain);
    rumble.start(0);
    this.sourceNodes.push(rumble);

    // Crackling sparks generator (random bursts of high-passed clicks)
    const crackleBuffer = this.createNoiseBuffer(0.1);
    
    const playSpark = () => {
      if (this.currentType !== 'campfire' || !this.ctx) return;
      
      const spark = ctx.createBufferSource();
      spark.buffer = crackleBuffer;
      
      const sparkFilter = ctx.createBiquadFilter();
      sparkFilter.type = 'highpass';
      sparkFilter.frequency.setValueAtTime(4000, ctx.currentTime);
      
      const sparkGain = ctx.createGain();
      // Random spark intensity
      const sparkVol = Math.random() * 0.4 + 0.1;
      sparkGain.gain.setValueAtTime(sparkVol, ctx.currentTime);
      
      spark.connect(sparkFilter);
      sparkFilter.connect(sparkGain);
      sparkGain.connect(gain);
      
      spark.start(ctx.currentTime);
      
      // Schedule next crackle with random delay (0.05s to 0.4s)
      const nextDelay = Math.random() * 350 + 50;
      this.intervalId = setTimeout(playSpark, nextDelay);
    };

    playSpark();
  }

  private startNebula() {
    const ctx = this.ctx!;
    const gain = this.gainNode!;

    // Warm, lush drone: multiple detuned sine wave oscillators
    const freqs = [110, 165, 220, 275]; // A2, E3, A3, C#4
    
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), ctx.currentTime); // subtle detune

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0, ctx.currentTime);
      
      // Animate volume slowly to create drifting space pads
      const lfoFreq = 0.03 + idx * 0.01; // each oscillator has a different slow cycle
      const oscLFO = ctx.createOscillator();
      oscLFO.type = 'sine';
      oscLFO.frequency.setValueAtTime(lfoFreq, ctx.currentTime);
      
      const lfoGainNode = ctx.createGain();
      lfoGainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      
      oscLFO.connect(lfoGainNode);
      lfoGainNode.connect(oscGain.gain);

      // Add a slight baseline level
      oscGain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(gain);
      
      osc.start(0);
      oscLFO.start(0);
      
      this.sourceNodes.push(osc, oscLFO);
    });
  }

  private startCafe() {
    const ctx = this.ctx!;
    const gain = this.gainNode!;

    // Cafe background hum: low-mid filtered white noise
    const hum = ctx.createBufferSource();
    hum.buffer = this.createPinkNoiseBuffer(5);
    hum.loop = true;

    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'bandpass';
    humFilter.frequency.setValueAtTime(350, ctx.currentTime);
    humFilter.Q.setValueAtTime(1.0, ctx.currentTime);

    hum.connect(humFilter);
    humFilter.connect(gain);
    hum.start(0);
    this.sourceNodes.push(hum);

    // Lo-Fi Chord Progression: Infinite cozy jazz electric piano loop
    // Chords: Cmaj9 -> Am9 -> Dm9 -> G13 (Warm 7th/9th cozy lo-fi chords)
    // Rhodes synth voice: combinations of Sine and Triangle with gentle tremolo and lowpass filter
    const chords = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9 (C4, E4, G4, B4, D5)
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am9 (A3, C4, E4, G4, B4)
      [293.66, 349.23, 440.00, 523.25, 587.33], // Dm9 (D4, F4, A4, C5, D5)
      [196.00, 246.94, 293.66, 349.23, 440.00]  // G13 / G9 (G3, B3, D4, F4, A4)
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (this.currentType !== 'cafe' || !this.ctx) return;
      const now = ctx.currentTime;
      const notes = chords[chordIdx];

      notes.forEach((freq, idx) => {
        // Base sine oscillator for pure rhodes tone
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        // Subdued triangle oscillator for warm harmonic body
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq, now);

        const voiceGain = ctx.createGain();
        voiceGain.gain.setValueAtTime(0, now);
        
        // Gentle warm attack, long steady decay, soft release
        const attack = 0.4;
        const sustain = 3.5;
        const release = 1.0;
        
        voiceGain.gain.linearRampToValueAtTime(0.06 / notes.length, now + attack);
        voiceGain.gain.setValueAtTime(0.06 / notes.length, now + attack + sustain);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + attack + sustain + release);

        // Tremolo LFO (Gentle electric piano vibration)
        const tremolo = ctx.createOscillator();
        tremolo.type = 'sine';
        tremolo.frequency.setValueAtTime(4.5, now); // 4.5Hz tremolo

        const tremoloGain = ctx.createGain();
        tremoloGain.gain.setValueAtTime(0.015, now);

        tremolo.connect(tremoloGain);
        tremoloGain.connect(voiceGain.gain);

        // Lowpass filter to keep notes warm and cozy
        const rhodesFilter = ctx.createBiquadFilter();
        rhodesFilter.type = 'lowpass';
        rhodesFilter.frequency.setValueAtTime(650, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        voiceGain.connect(rhodesFilter);
        rhodesFilter.connect(gain);

        osc1.start(now);
        osc2.start(now);
        tremolo.start(now);

        osc1.stop(now + attack + sustain + release + 0.1);
        osc2.stop(now + attack + sustain + release + 0.1);
        tremolo.stop(now + attack + sustain + release + 0.1);
      });

      chordIdx = (chordIdx + 1) % chords.length;
      
      // Repeat chord every 6 seconds
      this.intervalId = setTimeout(playChord, 6000);
    };

    playChord();
  }

  // Ring the classic cozy bell when timer ends
  public playSessionEndBell() {
    this.initCtx();
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    const bellGain = ctx.createGain();
    bellGain.gain.setValueAtTime(0, now);
    bellGain.gain.linearRampToValueAtTime(0.5, now + 0.05);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
    bellGain.connect(ctx.destination);

    // Warm wooden xylophone/bell chime frequencies (Harmonics of E5)
    const bellFreqs = [659.25, 987.77, 1318.51, 1648.14]; // E5, B5, E6, G#6 approx

    bellFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.15 / bellFreqs.length, now);

      osc.connect(oscGain);
      oscGain.connect(bellGain);

      osc.start(now);
      osc.stop(now + 3.0);
    });
  }
}

export const ambientPlayer = new AmbientSynth();
