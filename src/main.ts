import './style.css'

interface IRModule {
  buffer: AudioBuffer | null;
  convolver: ConvolverNode | null;
  gain: GainNode | null;
  lowpass: BiquadFilterNode | null;
  highpass: BiquadFilterNode | null;
  phase: number;
  gainValue: number;
  lowcutValue: number;
  highcutValue: number;
}

class AudioDSPProcessor {
  private audioContext: AudioContext | null = null;
  private audioSampleBuffer: AudioBuffer | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private masterGain: GainNode | null = null;
  private masterLowpass: BiquadFilterNode | null = null;
  private masterHighpass: BiquadFilterNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private isPlaying = false;

  private irModules: IRModule[] = [];

  constructor() {
    this.initializeAudioContext();
    this.initializeIRModules();
    this.setupEventListeners();
    this.setupKnobs();
  }

  private initializeAudioContext() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  private initializeIRModules() {
    for (let i = 0; i < 4; i++) {
      this.irModules.push({
        buffer: null,
        convolver: null,
        gain: null,
        lowpass: null,
        highpass: null,
        phase: 0,
        gainValue: 1.0,
        lowcutValue: 20,
        highcutValue: 20000
      });
    }
  }

  private setupEventListeners() {
    // Sample upload
    const sampleUpload = document.getElementById('sample-upload') as HTMLInputElement;
    sampleUpload.addEventListener('change', (e) => this.handleSampleUpload(e));

    // IR uploads for each module
    for (let i = 1; i <= 4; i++) {
      const irUpload = document.getElementById(`ir-upload-${i}`) as HTMLInputElement;
      irUpload.addEventListener('change', (e) => this.handleIRUpload(e, i - 1));
    }

    // Play button
    const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
    playBtn.addEventListener('click', () => this.togglePlayback());

    // Phase sliders
    for (let i = 1; i <= 4; i++) {
      const phaseSlider = document.getElementById(`phase-${i}`) as HTMLInputElement;
      phaseSlider.addEventListener('input', (e) => this.updatePhase(e, i - 1));
    }

    // Master controls
    const masterGainSlider = document.getElementById('master-gain-slider') as HTMLInputElement;
    masterGainSlider.addEventListener('input', (e) => this.updateMasterGain(e));

    const dryWetSlider = document.getElementById('dry-wet-slider') as HTMLInputElement;
    dryWetSlider.addEventListener('input', (e) => this.updateDryWet(e));
  }

  private setupKnobs() {
    const knobs = document.querySelectorAll('.knob');
    
    knobs.forEach((knob) => {
      const element = knob as HTMLElement;
      let isDragging = false;
      let startY = 0;
      let currentRotation = -135; // Start at minimum position

      const handleMove = (clientY: number) => {
        if (!isDragging) return;

        const deltaY = startY - clientY;
        const sensitivity = 2;
        const rotationChange = deltaY * sensitivity;
        
        // Limit rotation between -135 and 135 degrees (270 degrees range)
        currentRotation = Math.max(-135, Math.min(135, currentRotation + rotationChange));
        
        const indicator = element.querySelector('.knob-indicator') as HTMLElement;
        if (indicator) {
          indicator.style.transform = `translateX(-50%) rotate(${currentRotation}deg)`;
        }

        startY = clientY;

        // Update the corresponding parameter
        const moduleIndex = parseInt(element.dataset.module || '0');
        const param = element.dataset.param || '';
        
        // Convert rotation (-135 to 135) to value (0 to 1)
        const normalizedValue = (currentRotation + 135) / 270;
        
        this.updateKnobParameter(moduleIndex, param, normalizedValue);
      };

      element.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        handleMove(e.clientY);
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
      });

      // Touch support
      element.addEventListener('touchstart', (e) => {
        isDragging = true;
        startY = e.touches[0].clientY;
        e.preventDefault();
      });

      document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length > 0) {
          handleMove(e.touches[0].clientY);
        }
      });

      document.addEventListener('touchend', () => {
        isDragging = false;
      });
    });
  }

  private updateKnobParameter(moduleIndex: number | string, param: string, normalizedValue: number) {
    if (moduleIndex === 'master') {
      if (param === 'gain') {
        // Master gain: 0 to 2
        const gainValue = normalizedValue * 2;
        if (this.masterGain) {
          this.masterGain.gain.value = gainValue;
        }
      } else if (param === 'lowcut') {
        // Low cut: 20Hz to 2000Hz (logarithmic)
        const freq = 20 * Math.pow(100, normalizedValue);
        if (this.masterHighpass) {
          this.masterHighpass.frequency.value = freq;
        }
      } else if (param === 'highcut') {
        // High cut: 1000Hz to 20000Hz (logarithmic)
        const freq = 1000 * Math.pow(20, normalizedValue);
        if (this.masterLowpass) {
          this.masterLowpass.frequency.value = freq;
        }
      }
    } else if (moduleIndex === 'mix') {
      // Mix controls handled by sliders
    } else {
      // IR module controls
      const index = typeof moduleIndex === 'number' ? moduleIndex - 1 : parseInt(moduleIndex as string) - 1;
      if (index >= 0 && index < this.irModules.length) {
        const module = this.irModules[index];
        
        if (param === 'gain') {
          // Gain: 0 to 2
          module.gainValue = normalizedValue * 2;
          if (module.gain) {
            module.gain.gain.value = module.gainValue;
          }
        } else if (param === 'lowcut') {
          // Low cut: 20Hz to 2000Hz (logarithmic)
          const freq = 20 * Math.pow(100, normalizedValue);
          module.lowcutValue = freq;
          if (module.highpass) {
            module.highpass.frequency.value = freq;
          }
        } else if (param === 'highcut') {
          // High cut: 1000Hz to 20000Hz (logarithmic)
          const freq = 1000 * Math.pow(20, normalizedValue);
          module.highcutValue = freq;
          if (module.lowpass) {
            module.lowpass.frequency.value = freq;
          }
        }
      }
    }
  }

  private async handleIRUpload(event: Event, moduleIndex: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    this.updateStatus(`Loading IR ${moduleIndex + 1}...`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      
      this.irModules[moduleIndex].buffer = buffer;
      
      const duration = buffer.duration.toFixed(2);
      
      document.getElementById(`ir-info-${moduleIndex + 1}`)!.innerHTML = 
        `✓ ${duration}s`;
      
      this.updateStatus(`IR ${moduleIndex + 1} loaded!`);
      this.updateButtonStates();
    } catch (error) {
      console.error(`Error loading IR ${moduleIndex + 1}:`, error);
      this.updateStatus(`Error loading IR ${moduleIndex + 1}`);
      document.getElementById(`ir-info-${moduleIndex + 1}`)!.innerHTML = '✗ Error';
    }
  }

  private async handleSampleUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    this.updateStatus('Loading audio sample...');
    
    const filenameSpan = document.getElementById('sample-filename');
    if (filenameSpan) {
      filenameSpan.textContent = file.name;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.audioSampleBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      
      const duration = this.audioSampleBuffer.duration.toFixed(2);
      const sampleRate = this.audioSampleBuffer.sampleRate;
      const channels = this.audioSampleBuffer.numberOfChannels;
      
      document.getElementById('sample-info')!.innerHTML = 
        `✓ Loaded: ${duration}s | ${sampleRate}Hz | ${channels}ch`;
      
      this.updateStatus('Audio sample loaded successfully!');
      this.updateButtonStates();
    } catch (error) {
      console.error('Error loading audio sample:', error);
      this.updateStatus('Error loading audio sample file');
      document.getElementById('sample-info')!.innerHTML = '✗ Error loading file';
    }
  }

  private updateButtonStates() {
    const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
    const hasSample = this.audioSampleBuffer !== null;

    playBtn.disabled = !hasSample;
  }

  private togglePlayback() {
    if (this.isPlaying) {
      this.stopAudio();
    } else {
      this.playAudio();
    }
  }

  private playAudio() {
    if (!this.audioSampleBuffer || !this.audioContext) return;
    
    // Stop any currently playing audio
    this.stopAudio();

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Create source node
    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = this.audioSampleBuffer;

    // Create master nodes
    this.masterGain = this.audioContext.createGain();
    this.masterLowpass = this.audioContext.createBiquadFilter();
    this.masterHighpass = this.audioContext.createBiquadFilter();

    this.masterLowpass.type = 'lowpass';
    this.masterHighpass.type = 'highpass';
    this.masterLowpass.frequency.value = 20000;
    this.masterHighpass.frequency.value = 20;

    // Get master gain value
    const masterGainSlider = document.getElementById('master-gain-slider') as HTMLInputElement;
    this.masterGain.gain.value = parseInt(masterGainSlider.value) / 100;

    // Create dry and wet paths
    this.dryGain = this.audioContext.createGain();
    this.wetGain = this.audioContext.createGain();

    // Get dry/wet mix value
    const dryWetSlider = document.getElementById('dry-wet-slider') as HTMLInputElement;
    const wetAmount = parseInt(dryWetSlider.value) / 100;
    const dryAmount = 1 - wetAmount;

    this.dryGain.gain.value = dryAmount;
    this.wetGain.gain.value = wetAmount;

    // Connect dry path: source -> dry gain -> master filters -> master gain -> destination
    this.currentSource.connect(this.dryGain);
    this.dryGain.connect(this.masterHighpass);

    // Create wet path with all IR modules
    const activeModules = this.irModules.filter(m => m.buffer !== null);
    
    if (activeModules.length > 0) {
      // Create a merger to mix all IR outputs
      const merger = this.audioContext.createGain();
      merger.gain.value = 1 / Math.max(activeModules.length, 1); // Normalize by number of active IRs

      activeModules.forEach((module) => {
        // Create nodes for this IR module
        module.convolver = this.audioContext!.createConvolver();
        module.convolver.buffer = module.buffer;

        module.gain = this.audioContext!.createGain();
        module.gain.gain.value = module.gainValue;

        module.lowpass = this.audioContext!.createBiquadFilter();
        module.lowpass.type = 'lowpass';
        module.lowpass.frequency.value = module.highcutValue;

        module.highpass = this.audioContext!.createBiquadFilter();
        module.highpass.type = 'highpass';
        module.highpass.frequency.value = module.lowcutValue;

        // Connect: source -> convolver -> gain -> highpass -> lowpass -> merger
        this.currentSource!.connect(module.convolver);
        module.convolver.connect(module.gain);
        module.gain.connect(module.highpass);
        module.highpass.connect(module.lowpass);
        module.lowpass.connect(merger);
      });

      // Connect merger to wet gain
      merger.connect(this.wetGain);
    }

    // Connect both paths to master chain
    this.wetGain.connect(this.masterHighpass);
    this.masterHighpass.connect(this.masterLowpass);
    this.masterLowpass.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    // Start playback
    this.currentSource.start();
    this.isPlaying = true;
    this.updateButtonStates();
    this.updatePlayButton();

    const hasIR = activeModules.length > 0;
    this.updateStatus(hasIR ? `Playing with ${activeModules.length} IR(s)...` : 'Playing dry signal...');

    // Handle playback end
    this.currentSource.onended = () => {
      this.isPlaying = false;
      this.updateButtonStates();
      this.updatePlayButton();
      this.updateStatus('Playback finished');
      this.cleanupNodes();
    };
  }

  private stopAudio() {
    if (this.currentSource && this.isPlaying) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      this.isPlaying = false;
      this.updateButtonStates();
      this.updatePlayButton();
      this.updateStatus('Playback stopped');
    }
    
    this.cleanupNodes();
  }

  private cleanupNodes() {
    // Cleanup IR modules
    this.irModules.forEach(module => {
      if (module.convolver) {
        module.convolver.disconnect();
        module.convolver = null;
      }
      if (module.gain) {
        module.gain.disconnect();
        module.gain = null;
      }
      if (module.lowpass) {
        module.lowpass.disconnect();
        module.lowpass = null;
      }
      if (module.highpass) {
        module.highpass.disconnect();
        module.highpass = null;
      }
    });

    // Cleanup master nodes
    if (this.currentSource) {
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    if (this.dryGain) {
      this.dryGain.disconnect();
      this.dryGain = null;
    }
    if (this.wetGain) {
      this.wetGain.disconnect();
      this.wetGain = null;
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
    if (this.masterLowpass) {
      this.masterLowpass.disconnect();
      this.masterLowpass = null;
    }
    if (this.masterHighpass) {
      this.masterHighpass.disconnect();
      this.masterHighpass = null;
    }
  }

  private updatePhase(event: Event, moduleIndex: number) {
    const slider = event.target as HTMLInputElement;
    const phase = parseInt(slider.value);
    this.irModules[moduleIndex].phase = phase;
    // Phase shift can be implemented using an AllPassFilter or delay
    // For now, just store the value
  }

  private updateMasterGain(event: Event) {
    const slider = event.target as HTMLInputElement;
    const volume = parseInt(slider.value) / 100;

    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  private updateDryWet(event: Event) {
    const slider = event.target as HTMLInputElement;
    const wetAmount = parseInt(slider.value) / 100;
    const dryAmount = 1 - wetAmount;

    if (this.isPlaying && this.dryGain && this.wetGain) {
      this.dryGain.gain.value = dryAmount;
      this.wetGain.gain.value = wetAmount;
    }
  }

  private updatePlayButton() {
    const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
    const playIcon = playBtn.querySelector('.play-icon') as HTMLElement;
    
    if (this.isPlaying) {
      playIcon.textContent = '⏹';
    } else {
      playIcon.textContent = '▶';
    }
  }

  private updateStatus(message: string) {
    const statusBox = document.getElementById('status');
    if (statusBox) {
      statusBox.textContent = message;
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new AudioDSPProcessor();
});
