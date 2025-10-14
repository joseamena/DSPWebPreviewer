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

## Technology Stack

- **TypeScript**: Type-safe JavaScript for robust code
- **Vite**: Fast build tool and dev server
- **Web Audio API**: Browser-native audio processing
- **ConvolverNode**: For impulse response convolution
- **CSS3**: Modern styling with gradients and animations

## Audio Processing

The application uses the Web Audio API's ConvolverNode to perform real-time convolution between the audio sample and the impulse response. This simulates the acoustic characteristics of the space or equipment captured in the impulse response file.

### Signal Flow

```
Audio Sample → [Dry Path] ──────────→ Dry Gain → Master Gain → Output
              ↓
              [Wet Path] → Convolver → Wet Gain ↗
```

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Opera: ✅ Full support

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.