'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type ExperimentPhase = 'particle' | 'wave' | 'quantum' | 'observer';

interface PhaseConfig {
  title: string;
  description: string;
}

const PHASE_CONFIGS: Record<ExperimentPhase, PhaseConfig> = {
  particle: {
    title: 'Particle',
    description: 'Particles are sent through two slits. They pass through one slit or the other.'
  },
  wave: {
    title: 'Wave', 
    description: 'Waves pass through both slits simultaneously and interfere with each other.'
  },
  quantum: {
    title: 'Quantum Object',
    description: 'Quantum objects show wave-like interference patterns.'
  },
  observer: {
    title: 'Add an Observer',
    description: 'When observed, the wave function collapses to particle behavior.'
  }
};

export default function DoubleSlitExperiment() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Mesh[]>([]);
  const waveGroupRef = useRef<THREE.Group | null>(null);
  const detectionScreenRef = useRef<THREE.Mesh | null>(null);
  const hitPointsRef = useRef<THREE.Vector2[]>([]);
  
  const [currentPhase, setCurrentPhase] = useState<ExperimentPhase>('particle');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create the experiment apparatus
    createExperimentSetup(scene);

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Start animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      updateExperiment();
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    updatePhaseVisualization();
  }, [currentPhase, isPlaying]);

  const createExperimentSetup = (scene: THREE.Scene) => {
    // Create the barrier with double slits
    const barrierGeometry = new THREE.BoxGeometry(0.2, 8, 0.1);
    const barrierMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    
    // Top part of barrier
    const topBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    topBarrier.position.set(0, 3, 0);
    topBarrier.scale.y = 0.5;
    scene.add(topBarrier);
    
    // Bottom part of barrier
    const bottomBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    bottomBarrier.position.set(0, -3, 0);
    bottomBarrier.scale.y = 0.5;
    scene.add(bottomBarrier);
    
    // Middle barriers (creating the slits)
    const slitBarrier1 = new THREE.Mesh(barrierGeometry, barrierMaterial);
    slitBarrier1.position.set(0, 0.75, 0);
    slitBarrier1.scale.y = 0.25;
    scene.add(slitBarrier1);
    
    const slitBarrier2 = new THREE.Mesh(barrierGeometry, barrierMaterial);
    slitBarrier2.position.set(0, -0.75, 0);
    slitBarrier2.scale.y = 0.25;
    scene.add(slitBarrier2);

    // Create the detection screen
    const screenGeometry = new THREE.PlaneGeometry(0.1, 8);
    const screenMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x444444,
      transparent: true,
      opacity: 0.7
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(8, 0, 0);
    scene.add(screen);

    // Create particle source indicator
    const sourceGeometry = new THREE.SphereGeometry(0.2);
    const sourceMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const source = new THREE.Mesh(sourceGeometry, sourceMaterial);
    source.position.set(-8, 0, 0);
    scene.add(source);
  };

  const createParticles = (scene: THREE.Scene) => {
    const particleCount = 50;
    const particles: THREE.Mesh[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0xff6666,
        transparent: true,
        opacity: 0.8
      });
      
      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(
        -8 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.2,
        0
      );
      
      // Store velocity and other properties in userData
      particle.userData = {
        velocity: new THREE.Vector3(0.08, 0, 0),
        active: true,
        trail: []
      };
      
      scene.add(particle);
      particles.push(particle);
    }
    
    particlesRef.current = particles;
  };

  const createWaves = (scene: THREE.Scene) => {
    const waveGroup = new THREE.Group();
    
    // Create wave visualization using multiple sine curves
    for (let i = 0; i < 50; i++) {
      const points = [];
      for (let j = 0; j <= 100; j++) {
        const x = (j / 100) * 16 - 8;
        const y = Math.sin(j * 0.2 + i * 0.1) * 0.5;
        points.push(new THREE.Vector3(x, y, 0));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: new THREE.Color().setHSL(0.6, 1, 0.5 + i * 0.01),
        transparent: true,
        opacity: 0.3
      });
      
      const line = new THREE.Line(geometry, material);
      line.position.y = (i - 25) * 0.1;
      waveGroup.add(line);
    }
    
    scene.add(waveGroup);
    waveGroupRef.current = waveGroup;
  };

  const updateExperiment = () => {
    if (!isPlaying || !sceneRef.current) return;

    const time = Date.now() * 0.001;

    // Update particles
    particlesRef.current.forEach(particle => {
      if (!particle.userData.active) return;
      
      const velocity = particle.userData.velocity;
      particle.position.add(velocity);
      
      // Check collision with barrier (at x = 0)
      if (particle.position.x >= -0.1 && particle.position.x <= 0.1 && velocity.x > 0) {
        const y = particle.position.y;
        
        // Check if particle can pass through slits
        const slit1 = y > 0.5 && y < 2; // Upper slit
        const slit2 = y < -0.5 && y > -2; // Lower slit
        
        if (currentPhase === 'particle') {
          // Classical particle behavior - goes through one slit only
          if (slit1 || slit2) {
            // Add slight random deflection
            velocity.y += (Math.random() - 0.5) * 0.02;
          } else {
            // Particle hits barrier - reset
            particle.position.set(-8 + Math.random() * 0.5, (Math.random() - 0.5) * 4, 0);
            velocity.set(0.08, 0, 0);
          }
        } else if (currentPhase === 'quantum' || currentPhase === 'observer') {
          // Quantum behavior - probability-based
          if (slit1 || slit2) {
            // Add interference-like deflection
            const interference = Math.sin(y * 2 + time * 3) * 0.05;
            velocity.y += interference;
          } else {
            particle.position.set(-8 + Math.random() * 0.5, (Math.random() - 0.5) * 4, 0);
            velocity.set(0.08, 0, 0);
          }
        }
      }
      
      // Check if particle hits the detection screen
      if (particle.position.x >= 7.9 && particle.position.x <= 8.1) {
        // Record hit point
        hitPointsRef.current.push(new THREE.Vector2(particle.position.x, particle.position.y));
        
        // Keep only recent hits
        if (hitPointsRef.current.length > 200) {
          hitPointsRef.current.shift();
        }
        
        // Reset particle
        particle.position.set(-8 + Math.random() * 0.5, (Math.random() - 0.5) * 4, 0);
        particle.userData.velocity.set(0.08, 0, 0);
      }
      
      // Reset particles that go off screen
      if (particle.position.x > 9) {
        particle.position.set(-8 + Math.random() * 0.5, (Math.random() - 0.5) * 4, 0);
        particle.userData.velocity.set(0.08, 0, 0);
      }
    });

    // Update waves
    if (waveGroupRef.current) {
      waveGroupRef.current.children.forEach((line, index) => {
        if (line instanceof THREE.Line) {
          const positions = line.geometry.attributes.position;
          for (let i = 0; i < positions.count; i++) {
            const x = positions.array[i * 3];
            let y = 0;
            
            // Create interference pattern after the barrier
            if (x > 0) {
              const d1 = Math.sqrt((x - 0) ** 2 + (positions.array[i * 3 + 1] - 1.5) ** 2);
              const d2 = Math.sqrt((x - 0) ** 2 + (positions.array[i * 3 + 1] - (-1.5)) ** 2);
              const phase1 = d1 * 2 - time * 3;
              const phase2 = d2 * 2 - time * 3;
              y = (Math.sin(phase1) + Math.sin(phase2)) * 0.3 * Math.exp(-x * 0.1);
            } else {
              // Simple wave before barrier
              y = Math.sin(x * 0.8 + time * 3 + index * 0.2) * 0.2;
            }
            
            positions.array[i * 3 + 1] = y + (index - 25) * 0.02;
          }
          positions.needsUpdate = true;
        }
      });
    }
  };

  const updatePhaseVisualization = () => {
    if (!sceneRef.current) return;

    // Clear previous visualizations
    particlesRef.current.forEach(particle => {
      sceneRef.current!.remove(particle);
    });
    particlesRef.current = [];

    if (waveGroupRef.current) {
      sceneRef.current.remove(waveGroupRef.current);
      waveGroupRef.current = null;
    }

    // Create visualization based on current phase
    switch (currentPhase) {
      case 'particle':
        createParticles(sceneRef.current);
        break;
      case 'wave':
        createWaves(sceneRef.current);
        break;
      case 'quantum':
        createParticles(sceneRef.current);
        createWaves(sceneRef.current);
        if (waveGroupRef.current) {
          (waveGroupRef.current as THREE.Group).children.forEach(child => {
            if (child instanceof THREE.Line && child.material instanceof THREE.LineBasicMaterial) {
              child.material.opacity = 0.15;
            }
          });
        }
        // Make particles semi-transparent for quantum behavior
        particlesRef.current.forEach(particle => {
          if (particle.material instanceof THREE.MeshBasicMaterial) {
            particle.material.opacity = 0.6;
          }
        });
        break;
      case 'observer':
        createParticles(sceneRef.current);
        // Add observer visualization
        const observerGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const observerMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffff00,
          transparent: true,
          opacity: 0.8
        });
        const observer = new THREE.Mesh(observerGeometry, observerMaterial);
        observer.position.set(2, 0, 2);
        sceneRef.current.add(observer);
        break;
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-6 text-white max-w-md">
        <h1 className="text-2xl font-bold text-orange-400 mb-4">WAVE PARTICLE DUALITY</h1>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">{PHASE_CONFIGS[currentPhase].title}</h2>
          <p className="text-sm text-gray-300">{PHASE_CONFIGS[currentPhase].description}</p>
        </div>

        <div className="space-y-2 mb-4">
          {(Object.keys(PHASE_CONFIGS) as ExperimentPhase[]).map((phase) => (
            <button
              key={phase}
              onClick={() => setCurrentPhase(phase)}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                currentPhase === phase 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              ▶ {phase === 'particle' ? 'particle' : 
                  phase === 'wave' ? 'wave' :
                  phase === 'quantum' ? 'quantum object' :
                  'add an observer'}
            </button>
          ))}
        </div>

        <button
          onClick={togglePlayPause}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
        >
          {isPlaying ? '⏸ Pause' : '▶ Start'}
        </button>
      </div>

      {/* Info Text */}
      <div className="absolute bottom-4 left-4 text-white bg-black/60 backdrop-blur-sm rounded px-4 py-2">
        <p className="text-sm">Particles are sent through two slits.</p>
        <p className="text-sm">The particles touch the screen randomly.</p>
      </div>
    </div>
  );
}