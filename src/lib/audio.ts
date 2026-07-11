// A high-quality Web Audio API Synthesizer for cozy, looping ambient sounds.
// This guarantees zero external dependencies and 100% reliability offline without heavy assets.

interface TrackState {
  gainNode: GainNode | null;
  sourceNodes: AudioNode[];
  intervalId: any;
  volume: number; // 0.0 to 1.0
}

class AmbientSynth {
  private ctx: AudioContext | null = null;
  private tracks: { [key: string]: TrackState } = {
    rain: { gainNode: null, sourceNodes: [], intervalId: null, volume: 0 },
    campfire: { gainNode: null, sourceNodes: [], intervalId: null, volume: 0 },
    nebula: { gainNode: null, sourceNodes: [], intervalId: null, volume: 0 },
    cafe: { gainNode: null, sourceNodes: [], intervalId: null, volume: 0 },
  };
  private masterGainNode: GainNode | null = null;
  private masterVolume: number = 0.5;
  public currentType: string = 'none';

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

  private initMasterGain() {
    if (!this.masterGainNode && this.ctx) {
      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGainNode.connect(this.ctx.destination);
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

  // Legacy single-play implementation for backwards compatibility
  public play(type: string, volume: number = 0.5) {
    this.initCtx();
    this.initMasterGain();
    
    if (type === 'none') {
      this.currentType = 'none';
      this.stop();
      return;
    }

    this.currentType = type;

    // Turn on only the selected track, turn off everything else
    Object.keys(this.tracks).forEach(trackId => {
      if (trackId === type) {
        this.setTrackVolume(trackId, volume);
      } else {
        this.setTrackVolume(trackId, 0);
      }
    });
  }

  // Set individual track volume
  public setTrackVolume(type: string, volume: number) {
    this.initCtx();
    this.initMasterGain();

    const track = this.tracks[type];
    if (!track) return;

    track.volume = volume;

    if (volume > 0) {
      if (!track.gainNode) {
        track.gainNode = this.ctx!.createGain();
        track.gainNode.connect(this.masterGainNode!);
        
        if (type === 'rain') {
          this.startRainTrack();
        } else if (type === 'campfire') {
          this.startCampfireTrack();
        } else if (type === 'nebula') {
          this.startNebulaTrack();
        } else if (type === 'cafe') {
          this.startCafeTrack();
        }
      }
      track.gainNode.gain.setValueAtTime(volume * 0.3, this.ctx!.currentTime);
    } else {
      this.stopTrack(type);
    }

    // Update currentType for tracking
    const activeTracks = Object.keys(this.tracks).filter(id => this.tracks[id].volume > 0);
    if (activeTracks.length === 0) {
      this.currentType = 'none';
    } else if (activeTracks.length === 1) {
      this.currentType = activeTracks[0];
    } else {
      this.currentType = 'mixed';
    }
  }

  // Get active track volume
  public getTrackVolume(type: string): number {
    return this.tracks[type]?.volume ?? 0;
  }

  // Set master volume
  public setVolume(volume: number) {
    this.masterVolume = volume;
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  // Stop a specific track
  public stopTrack(type: string) {
    const track = this.tracks[type];
    if (!track) return;

    if (track.intervalId) {
      clearTimeout(track.intervalId);
      track.intervalId = null;
    }

    track.sourceNodes.forEach(node => {
      try {
        (node as any).stop();
      } catch (e) {}
    });
    track.sourceNodes = [];

    if (track.gainNode) {
      try {
        track.gainNode.disconnect();
      } catch (e) {}
      track.gainNode = null;
    }
    track.volume = 0;
  }

  // Stop all ambient tracks
  public stop() {
    Object.keys(this.tracks).forEach(trackId => {
      this.stopTrack(trackId);
    });
    this.currentType = 'none';
  }

  private startRainTrack() {
    const ctx = this.ctx!;
    const track = this.tracks.rain;
    const gain = track.gainNode!;

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

    track.sourceNodes.push(pinkNoise, osc);
  }

  private startCampfireTrack() {
    const ctx = this.ctx!;
    const track = this.tracks.campfire;
    const gain = track.gainNode!;

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
    track.sourceNodes.push(rumble);

    // Crackling sparks generator (random bursts of high-passed clicks)
    const crackleBuffer = this.createNoiseBuffer(0.1);
    
    const playSpark = () => {
      if (track.volume <= 0 || !this.ctx || !track.gainNode) return;
      
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
      track.intervalId = setTimeout(playSpark, nextDelay);
    };

    playSpark();
  }

  private startNebulaTrack() {
    const ctx = this.ctx!;
    const track = this.tracks.nebula;
    const gain = track.gainNode!;

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
      
      track.sourceNodes.push(osc, oscLFO);
    });
  }

  private startCafeTrack() {
    const ctx = this.ctx!;
    const track = this.tracks.cafe;
    const gain = track.gainNode!;

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
    track.sourceNodes.push(hum);

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
      if (track.volume <= 0 || !this.ctx || !track.gainNode) return;
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
      track.intervalId = setTimeout(playChord, 6000);
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
