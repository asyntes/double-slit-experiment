# Double-Slit Experiment Simulator

An interactive 3D visualization of the famous double-slit quantum mechanics experiment, demonstrating wave-particle duality.

![Double-Slit Experiment](https://img.shields.io/badge/Physics-Quantum%20Mechanics-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![Three.js](https://img.shields.io/badge/Three.js-3D%20Graphics-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue)

## Experiment Overview

The double-slit experiment is one of the most important experiments in quantum mechanics, demonstrating the fundamental wave-particle duality of matter and energy. This interactive simulator lets you explore all four key phases of the experiment:

### Experiment Phases

1. **Proton Phase** - Classical particle behavior
   - Red particles travel in straight lines
   - Particles either pass through slits or are blocked
   - No interference pattern on detection screen

2. **Light Wave Phase** - Wave behavior (instant interference)
   - Collimated laser beam through both slits
   - Instant interference pattern appears on screen
   - Demonstrates wave nature of light

3. **Electron Phase** - Quantum accumulation 
   - Blue particles behave quantum mechanically
   - Interference pattern builds up gradually over 60 seconds
   - Each particle contributes to the overall pattern
   - Demonstrates wave-particle duality

4. **Observer Phase** - Wave function collapse
   - Electron gun with quantum measurement
   - Observer present near the slits
   - No interference pattern (wave function collapse)
   - Demonstrates the measurement problem

## Features

- **Dynamic Particle Generator**: Large cylindrical generator covering both slits
- **Gradual Pattern Formation**: Watch interference patterns build up over time
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive Controls**: Switch between experiment phases
- **Multiple Phases**: Explore different aspects of wave-particle duality

## Technology Stack

- **Frontend**: Next.js 15 + React 19
- **3D Graphics**: Three.js with WebGL renderer
- **Styling**: Tailwind CSS v4
- **Type Safety**: TypeScript
- **Animation**: RequestAnimationFrame for 60fps performance

## How to Use

1. **Select Experiment Phase**: Use the buttons at the bottom to switch between different phases
2. **Observe Particle Behavior**: Watch how particles behave differently in each phase
3. **Camera Controls**: Click and drag to rotate, scroll to zoom, shift+drag to pan
4. **Watch Pattern Formation**: In electron phase, observe the gradual buildup of interference fringes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/double-slit-experiment.git

# Navigate to project directory
cd double-slit-experiment

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the experiment.

## Technical Features

- **Particle-Based Interference**: Individual particles form interference patterns
- **Gradual Pattern Buildup**: Watch quantum effects develop over time in electron mode
- **Smooth Animations**: 60fps performance with WebGL acceleration
- **Responsive Design**: Optimized for both desktop and mobile devices

## Contributing

Contributions are welcome! Here are some areas for improvement:

- Additional quantum effects (entanglement, decoherence)
- More detailed physics parameters
- Enhanced mobile experience
- Performance optimizations
- Educational content integration

## Educational Use

This simulator is perfect for:

- **Physics Education**: Visualize abstract quantum concepts
- **Interactive Learning**: Hands-on experiment exploration  
- **Research Demonstrations**: Present quantum mechanics principles
- **STEM Outreach**: Engage students with interactive physics

## Known Issues

- Mobile performance may vary on older devices
- Some advanced quantum effects are simplified for visualization
- Camera controls may need adjustment on touch devices

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the original double-slit experiments by Thomas Young and others
- Built with modern web technologies for educational accessibility

---

*"Anyone who is not shocked by quantum theory has not understood it." - Niels Bohr*
