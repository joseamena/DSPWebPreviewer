# 🎸 DSP Web Previewer

A real-time audio DSP demo website for guitar impulse response processing, built with TypeScript and Vite.

![DSP Web Previewer](https://github.com/user-attachments/assets/d04ceff5-1f56-4449-94eb-da6c7243e9cd)

## Features

- **Real-time Impulse Response Processing**: Load custom impulse response files and apply convolution in real-time
- **Audio Sample Playback**: Upload guitar/audio samples and hear them processed
- **Dry/Wet Mix Control**: Blend between the original (dry) and processed (wet) signals
- **Volume Control**: Adjust the master output volume
- **Metal/Rock Themed UI**: Dark, edgy design with vibrant accents perfect for guitar enthusiasts
- **Web Audio API**: Utilizes the browser's native Web Audio API for high-quality audio processing
- **Zero Latency**: Real-time processing with no perceptible delay
- **Cross-Browser Support**: Works on all modern browsers

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/joseamena/DSPWebPreviewer.git

# Navigate to the project directory
cd DSPWebPreviewer

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
# Build for production
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
# Preview the production build
npm run preview
```

## Usage

1. **Load an Impulse Response**: Click "Choose IR file..." to upload an impulse response audio file (WAV, MP3, etc.)
2. **Load an Audio Sample**: Click "Choose audio sample..." to upload a guitar or other audio sample
3. **Play Dry**: Click "▶️ Play Dry (Original)" to hear the unprocessed audio
4. **Play Wet**: Click "▶️ Play Wet (Processed)" to hear the audio with impulse response convolution applied
5. **Adjust Mix**: Use the Dry/Wet Mix slider to blend between the original and processed signals
6. **Adjust Volume**: Use the Volume slider to control the output level

📖 **For detailed usage instructions, examples, and troubleshooting, see [USAGE.md](USAGE.md)**

## Where to Find Impulse Responses

Impulse responses are essential for using this application. Here are some sources:

### Free IR Resources
- **[Redwirez](http://www.redwirez.com/)** - Free guitar cabinet IRs (requires registration)
- **[GuitarHack](http://www.guitarhack.com/)** - Free metal/rock cabinet impulses
- **[God's Cab](http://www.wilkinsonaudio.com/godscab/)** - Free Celestion G12M cabinet IRs
- **[OpenAir](https://www.openair.hosted.york.ac.uk/)** - Free room and reverb impulse responses
- **[Voxengo Impulses](https://www.voxengo.com/impulses/)** - Free reverb and acoustic impulse responses

### Commercial IR Packs
- **OwnHammer** - Professional guitar cabinet IRs
- **Celestion** - Official speaker cabinet IRs
- **ML Sound Lab** - High-quality cabinet simulations
- **Two Notes** - Wall of Sound IR collections

### Creating Your Own IRs
You can create custom impulse responses by:
1. Recording a space or equipment with a test signal (sine sweep or impulse)
2. Using deconvolution software to extract the IR
3. Popular tools: REW (Room EQ Wizard), Altiverb XL, Voxengo Deconvolver

## Technology Stack

- **TypeScript**: Type-safe JavaScript for robust code
- **Vite**: Fast build tool and dev server
- **Web Audio API**: Browser-native audio processing
- **ConvolverNode**: For impulse response convolution
- **CSS3**: Modern styling with gradients and animations

## Project Structure

```
DSPWebPreviewer/
├── src/
│   ├── main.ts          # Main application logic and AudioDSPProcessor class
│   ├── style.css        # UI styling (metal/rock themed)
│   └── types.d.ts       # TypeScript type definitions
├── public/
│   └── vite.svg         # Vite logo asset
├── index.html           # Main HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── README.md            # This file
└── USAGE.md             # Detailed usage guide
```

### Key Components

- **AudioDSPProcessor**: Main class handling audio context, file loading, and processing
- **Web Audio Graph**: Dynamic routing with dry/wet paths and convolver node
- **Event Handlers**: File uploads, playback controls, and real-time parameter adjustments

## Audio Processing

The application uses the Web Audio API's ConvolverNode to perform real-time convolution between the audio sample and the impulse response. This simulates the acoustic characteristics of the space or equipment captured in the impulse response file.

### Signal Flow

```
Audio Sample → [Dry Path] ──────────→ Dry Gain → Master Gain → Output
              ↓
              [Wet Path] → Convolver → Wet Gain ↗
```

### How It Works

1. **FFT Processing**: The ConvolverNode uses Fast Fourier Transform to convert both audio signals to frequency domain
2. **Convolution**: Multiplies the frequency representations together
3. **IFFT**: Converts back to time domain for playback
4. **Real-time Mixing**: Dry and wet signals are continuously blended based on the mix control

## Use Cases & Examples

### 🎸 Guitar Cabinet Simulation
Load a cabinet IR (Mesa Boogie, Marshall, etc.) to process a direct guitar signal (DI track). Perfect for:
- Home recording without mic'ing an amp
- Re-amping tracks with different cabinet tones
- Quick tone previews during songwriting

### 🏛️ Adding Reverb
Use room or hall IRs to add realistic acoustic spaces:
- Vocal processing with natural reverb
- Simulating concert hall acoustics
- Creating ambient guitar textures

### 🎚️ Professional Mixing
Preview tracks with different acoustic characteristics:
- A/B testing different cabinet IRs
- Finding the right reverb space
- Stem processing with consistent ambience

### 🎓 Learning & Education
Understand audio processing concepts:
- Hear the difference between dry and processed signals
- Experiment with convolution in real-time
- Compare different impulse responses

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Opera: ✅ Full support

## Performance & Limitations

### Recommended Specifications
- **IR Length**: Best performance with IRs under 5 seconds
- **File Size**: Audio samples up to 50MB work smoothly
- **Sample Rate**: Any sample rate (browser handles resampling)
- **Bit Depth**: 16-bit or 24-bit audio files recommended

### Performance Tips
- Longer IRs (>10 seconds) may cause slight CPU spikes on mobile devices
- Stereo IRs provide better spatial accuracy but use more processing power
- Close other audio-intensive browser tabs for best performance
- On mobile, keep screen on during playback for optimal performance

### Browser-Specific Notes
- **Safari (iOS)**: May require user interaction to initialize audio context
- **Chrome**: Hardware acceleration enabled by default for best performance
- **Firefox**: Excellent stability with large IR files
- **Mobile Browsers**: Some latency may occur with very long IRs (>15 seconds)

## Development

### Prerequisites
- Node.js v16 or higher
- npm or yarn package manager
- Modern browser with Web Audio API support

### Development Server
```bash
npm run dev
```
- Starts Vite dev server on `http://localhost:3000`
- Hot Module Replacement (HMR) enabled
- TypeScript type checking in real-time
- Changes reflect instantly in browser

### Building for Production
```bash
npm run build
```
- Compiles TypeScript to JavaScript
- Minifies and bundles all assets
- Optimizes for production performance
- Output directory: `dist/`
- Ready to deploy to any static hosting

### Type Checking
TypeScript compilation happens automatically during build. To check types manually:
```bash
npx tsc --noEmit
```

### Project Configuration
- **TypeScript**: Configured in `tsconfig.json` with strict mode
- **Vite**: Custom port (3000) configured in `vite.config.ts`
- **Module Type**: ES Modules (`"type": "module"` in package.json)

## Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute
- 🐛 **Bug Reports**: Open an issue describing the problem, steps to reproduce, and your environment
- ✨ **Feature Requests**: Suggest new features or improvements via issues
- 📝 **Documentation**: Improve README, USAGE.md, or add code comments
- 🎨 **UI/UX**: Enhance the interface or user experience
- 🔧 **Code**: Submit pull requests with bug fixes or new features

### Pull Request Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear, descriptive commits
4. Test thoroughly in multiple browsers
5. Update documentation if needed
6. Submit a PR with a clear description of changes

### Code Style
- Follow existing TypeScript patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain type safety (no `any` types without justification)

### Testing Checklist
- [ ] Tested in Chrome/Edge
- [ ] Tested in Firefox
- [ ] Tested in Safari (if possible)
- [ ] No console errors
- [ ] Audio plays correctly
- [ ] All controls work as expected

## Acknowledgments

- **Web Audio API Community**: For excellent documentation and examples
- **Impulse Response Creators**: Thanks to all the audio engineers creating and sharing IRs
- **Vite Team**: For the blazing-fast build tool
- **TypeScript Team**: For making JavaScript development more robust
- **Open Source Community**: For inspiration and support

Special thanks to the guitar and audio production communities for feedback and use cases.

## License

ISC