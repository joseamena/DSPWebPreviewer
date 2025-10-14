import './style.css'

class AudioDSPProcessor {
  private audioContext: AudioContext | null = null;
  private impulseResponseBuffer: AudioBuffer | null = null;
  private audioSampleBuffer: AudioBuffer | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private convolver: ConvolverNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;

  constructor() {
    this.initializeAudioContext();
    this.setupEventListeners();
  }

  private initializeAudioContext() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  private setupEventListeners() {
    // File uploads
    const irUpload = document.getElementById('ir-upload') as HTMLInputElement;
    const sampleUpload = document.getElementById('sample-upload') as HTMLInputElement;
    
    irUpload.addEventListener('change', (e) => this.handleIRUpload(e));
    sampleUpload.addEventListener('change', (e) => this.handleSampleUpload(e));

    // Playback controls
    const playDryBtn = document.getElementById('play-dry') as HTMLButtonElement;
    const playWetBtn = document.getElementById('play-wet') as HTMLButtonElement;
    const stopBtn = document.getElementById('stop') as HTMLButtonElement;

    playDryBtn.addEventListener('click', () => this.playAudio(false));
    playWetBtn.addEventListener('click', () => this.playAudio(true));
    stopBtn.addEventListener('click', () => this.stopAudio());

    // Mix and volume controls
    const dryWetSlider = document.getElementById('dry-wet') as HTMLInputElement;
    const volumeSlider = document.getElementById('volume') as HTMLInputElement;

    dryWetSlider.addEventListener('input', (e) => this.updateMix(e));
    volumeSlider.addEventListener('input', (e) => this.updateVolume(e));
  }

  private async handleIRUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    this.updateStatus('Loading impulse response...');
    this.updateFileName('ir-filename', file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.impulseResponseBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      
      const duration = this.impulseResponseBuffer.duration.toFixed(2);
      const sampleRate = this.impulseResponseBuffer.sampleRate;
      const channels = this.impulseResponseBuffer.numberOfChannels;
      
      document.getElementById('ir-info')!.innerHTML = 
        `✓ Loaded: ${duration}s | ${sampleRate}Hz | ${channels}ch`;
      
      this.updateStatus('Impulse response loaded successfully!');
      this.updateButtonStates();
    } catch (error) {
      console.error('Error loading impulse response:', error);
      this.updateStatus('Error loading impulse response file');
      document.getElementById('ir-info')!.innerHTML = '✗ Error loading file';
    }
  }

  private async handleSampleUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    this.updateStatus('Loading audio sample...');
    this.updateFileName('sample-filename', file.name);

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

  private updateFileName(elementId: string, filename: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = filename;
    }
  }

  private updateButtonStates() {
    const playDryBtn = document.getElementById('play-dry') as HTMLButtonElement;
    const playWetBtn = document.getElementById('play-wet') as HTMLButtonElement;
    const stopBtn = document.getElementById('stop') as HTMLButtonElement;

    const hasSample = this.audioSampleBuffer !== null;
    const hasIR = this.impulseResponseBuffer !== null;

    playDryBtn.disabled = !hasSample;
    playWetBtn.disabled = !hasSample || !hasIR;
    stopBtn.disabled = !this.isPlaying;
  }

  private playAudio(useConvolution: boolean) {
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

    // Create gain nodes
    this.dryGain = this.audioContext.createGain();
    this.wetGain = this.audioContext.createGain();
    this.masterGain = this.audioContext.createGain();

    // Set initial volume
    const volumeSlider = document.getElementById('volume') as HTMLInputElement;
    this.masterGain.gain.value = parseInt(volumeSlider.value) / 100;

    if (useConvolution && this.impulseResponseBuffer) {
      // Create convolver for wet signal
      this.convolver = this.audioContext.createConvolver();
      this.convolver.buffer = this.impulseResponseBuffer;

      // Get current mix value
      const dryWetSlider = document.getElementById('dry-wet') as HTMLInputElement;
      const wetAmount = parseInt(dryWetSlider.value) / 100;
      const dryAmount = 1 - wetAmount;

      this.dryGain.gain.value = dryAmount;
      this.wetGain.gain.value = wetAmount;

      // Connect: source -> dry path -> master -> destination
      this.currentSource.connect(this.dryGain);
      this.dryGain.connect(this.masterGain);

      // Connect: source -> convolver -> wet path -> master -> destination
      this.currentSource.connect(this.convolver);
      this.convolver.connect(this.wetGain);
      this.wetGain.connect(this.masterGain);

      this.masterGain.connect(this.audioContext.destination);

      this.updateStatus('Playing with impulse response processing...');
    } else {
      // Dry signal only
      this.dryGain.gain.value = 1;
      this.currentSource.connect(this.dryGain);
      this.dryGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      this.updateStatus('Playing dry signal (no processing)...');
    }

    // Start playback
    this.currentSource.start();
    this.isPlaying = true;
    this.updateButtonStates();

    // Handle playback end
    this.currentSource.onended = () => {
      this.isPlaying = false;
      this.updateButtonStates();
      this.updateStatus('Playback finished');
    };
  }

  private stopAudio() {
    if (this.currentSource && this.isPlaying) {
      this.currentSource.stop();
      this.currentSource.disconnect();
      this.currentSource = null;
      this.isPlaying = false;
      this.updateButtonStates();
      this.updateStatus('Playback stopped');
    }

    // Cleanup
    if (this.dryGain) {
      this.dryGain.disconnect();
      this.dryGain = null;
    }
    if (this.wetGain) {
      this.wetGain.disconnect();
      this.wetGain = null;
    }
    if (this.convolver) {
      this.convolver.disconnect();
      this.convolver = null;
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
  }

  private updateMix(event: Event) {
    const slider = event.target as HTMLInputElement;
    const wetAmount = parseInt(slider.value) / 100;
    const dryAmount = 1 - wetAmount;

    document.getElementById('dry-wet-value')!.textContent = `${slider.value}%`;

    if (this.isPlaying && this.dryGain && this.wetGain) {
      this.dryGain.gain.value = dryAmount;
      this.wetGain.gain.value = wetAmount;
    }
  }

  private updateVolume(event: Event) {
    const slider = event.target as HTMLInputElement;
    const volume = parseInt(slider.value) / 100;

    document.getElementById('volume-value')!.textContent = `${slider.value}%`;

    if (this.masterGain) {
      this.masterGain.gain.value = volume;
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
