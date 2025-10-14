# Usage Guide

## Quick Start

1. **Start the application**:
   ```bash
   npm run dev
   ```
   
2. Open your browser and navigate to `http://localhost:3000`

## Step-by-Step Guide

### 1. Load an Impulse Response (IR)

An impulse response is an audio file that captures the acoustic characteristics of a space or equipment. For guitar processing, this is typically:
- Guitar cabinet impulse responses
- Reverb impulse responses
- Room acoustics captures

**To load:**
- Click on "Choose IR file..." under "⚡ Load Impulse Response"
- Select a WAV, MP3, or other audio file containing your impulse response
- You'll see file information displayed (duration, sample rate, channels)

### 2. Load an Audio Sample

This is the guitar or audio recording you want to process.

**To load:**
- Click on "Choose audio sample..." under "🎵 Load Audio Sample"
- Select your guitar recording or any audio file
- File information will be displayed

### 3. Playback Options

#### Play Dry (Original)
- Plays the audio sample without any processing
- Useful for comparing the original sound to the processed version
- Available as soon as you load an audio sample

#### Play Wet (Processed)
- Plays the audio sample with impulse response convolution applied
- Requires both an audio sample AND an impulse response to be loaded
- This is the processed sound with the IR characteristics

#### Stop
- Stops the currently playing audio
- Available only when audio is playing

### 4. Controls

#### Dry/Wet Mix
- **0%**: Only processed (wet) signal
- **50%**: Equal mix of original and processed signals
- **100%**: Only processed (wet) signal
- You can adjust this in real-time while audio is playing!

#### Volume
- Controls the master output level
- Range: 0% (silent) to 100% (full volume)
- Default: 70%
- Can be adjusted during playback

## Tips

- **File Formats**: The application supports any audio format your browser can decode (WAV, MP3, OGG, etc.)
- **Sample Rate**: Files with different sample rates will be automatically resampled by the browser
- **Performance**: Longer impulse responses will use more CPU. For best performance, use IRs under 5 seconds
- **Mobile**: The application works on mobile devices, but performance may vary

## Troubleshooting

### No sound?
- Check your system volume
- Make sure your browser allows audio playback
- Some browsers require user interaction before playing audio

### Buttons are disabled?
- **Play Dry**: Requires an audio sample to be loaded
- **Play Wet**: Requires both an audio sample AND an impulse response
- **Stop**: Only available when audio is playing

### Audio is distorted?
- Reduce the volume slider
- Check your impulse response file - some IRs may have high gain
- Try adjusting the dry/wet mix

## Examples

### Processing a Guitar Recording

1. Load a guitar cabinet IR (e.g., `Mesa_Boogie_4x12.wav`)
2. Load your direct guitar recording (DI track)
3. Click "Play Wet" to hear your guitar through the virtual cabinet
4. Adjust the dry/wet mix to blend in some of the original DI signal
5. Experiment with different IRs to find your tone!

### Adding Reverb

1. Load a reverb impulse response (e.g., `Hall_Reverb.wav`)
2. Load your dry guitar or vocal recording
3. Play with the dry/wet mix to control reverb amount
4. A mix around 20-40% often works well for reverb

## Advanced Usage

### Signal Chain

The application uses this signal routing:
```
Input Audio
    ├── Dry Path → Dry Gain (1 - mix%) ─┐
    │                                     ├→ Master Gain → Output
    └── Wet Path → Convolver → Wet Gain (mix%) ─┘
```

### Real-time Processing

All processing happens in real-time using the Web Audio API's ConvolverNode, which performs:
1. Fast Fourier Transform (FFT) of both signals
2. Frequency domain multiplication
3. Inverse FFT back to time domain

This is computationally efficient and provides zero-latency processing.
