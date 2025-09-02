'use client';

import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import './DoubleSlitExperiment.css';
import PhaseSelector from './components/PhaseSelector/PhaseSelector';
import TopBar from './components/TopBar/TopBar';
import OrientationWarning from './components/OrientationWarning/OrientationWarning';
import { useThreeScene } from './hooks/useThreeScene';
import { useResponsiveLayout } from './hooks/useResponsiveLayout';
import { useExperimentAnimation } from './hooks/useExperimentAnimation';
import { updateGeneratorLabel } from './components/SceneLabels';


export default function DoubleSlitExperiment() {
  const [activePhase, setActivePhase] = useState('proton');
  const phaseStartTime = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const animateElectronPattern = () => {
    if (!detectionScreenOverlayRef.current || !detectionScreenRef.current) return;

    // Generate static interference texture once
    const interferenceTexture = createParticleInterferenceTexture();
    const interferenceMaterial = new THREE.MeshBasicMaterial({
      map: interferenceTexture,
      color: 0x727272,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    detectionScreenOverlayRef.current.material = interferenceMaterial;

    // Set base screen with multiply blending to avoid transparency artifacts
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      side: THREE.DoubleSide
    });
    detectionScreenRef.current.material = baseMaterial;

    const animate = () => {
      if (!detectionScreenOverlayRef.current?.material) return;

      const elapsed = Date.now() - phaseStartTime.current;
      const duration = 60000;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing function
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Only animate overlay opacity - no flickering
      if (detectionScreenOverlayRef.current.material instanceof THREE.MeshBasicMaterial) {
        detectionScreenOverlayRef.current.material.opacity = easedProgress;
        detectionScreenOverlayRef.current.material.needsUpdate = true;
      }

      if (progress < 1 && activePhase === 'electron') {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animate();
  };

  const createParticleInterferenceTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;

    // Dark background
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const stripeRegionWidth = canvas.width * 0.5;
    const stripeHeight = canvas.height * (4 / 15);

    // Generate particle-based interference pattern
    ctx.fillStyle = '#ffffff';

    // Create interference pattern using particle distribution
    for (let i = 0; i < 8000; i++) {
      // Interference pattern simulation - higher density in bright fringes
      const x = Math.random() * stripeRegionWidth - stripeRegionWidth / 2;
      const y = (Math.random() - 0.5) * stripeHeight;

      // Calculate interference intensity based on position
      const fringe = Math.cos(x * 0.08) * Math.cos(x * 0.08); // Simulated double-slit interference

      // Add envelope function for progressive fading towards edges
      const normalizedX = Math.abs(x) / (stripeRegionWidth / 2); // 0 at center, 1 at edges
      const envelope = Math.exp(-normalizedX * normalizedX * 3); // Gaussian envelope

      // Combine fringe pattern with envelope
      const totalIntensity = fringe * envelope;
      const intensity = Math.random();

      // Only place particle if random value is less than total intensity
      if (intensity < totalIntensity * 1.0) {
        const particleX = centerX + x + (Math.random() - 0.5) * 2;
        const particleY = centerY + y + (Math.random() - 0.5) * 2;

        // Draw small particle dot
        ctx.beginPath();
        ctx.arc(particleX, particleY, 0.5 + Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const {
    mountRef,
    sceneRef,
    rendererRef,
    cameraRef,
    controlsRef,
    detectionScreenRef,
    detectionScreenOverlayRef,
    diffractionPanelRef,
    lightBeamRef,
    leftTrapezoidRef,
    rightTrapezoidRef,
    labelsRef,
    particleSystemRef,
    observerRef,
    sceneReady
  } = useThreeScene();

  useEffect(() => {
    if (sceneReady) {
      console.log('Scene ready, particle system available:', !!particleSystemRef.current);
    }
  }, [sceneReady]);

  // Handle light cone, trapezoids, observer visibility and generator label based on active phase
  useEffect(() => {
    if (lightBeamRef.current && leftTrapezoidRef.current && rightTrapezoidRef.current && observerRef.current && sceneRef.current && detectionScreenRef.current && detectionScreenOverlayRef.current) {
      const showLightElements = activePhase === 'lightwave';
      const showObserver = activePhase === 'observer';

      lightBeamRef.current.visible = showLightElements;
      leftTrapezoidRef.current.visible = showLightElements;
      rightTrapezoidRef.current.visible = showLightElements;
      observerRef.current.visible = showObserver;

      // Reset base screen to default (always solid for non-electron phases)
      const defaultMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        side: THREE.DoubleSide
      });
      detectionScreenRef.current.material = defaultMaterial;

      // Reset overlay to transparent
      const transparentMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
      });
      detectionScreenOverlayRef.current.material = transparentMaterial;

      if (activePhase === 'lightwave') {
        // Instant pattern for light on base screen
        const interferenceTexture = createParticleInterferenceTexture();
        const interferenceMaterial = new THREE.MeshBasicMaterial({
          map: interferenceTexture,
          color: 0x727272,
          side: THREE.DoubleSide
        });
        detectionScreenRef.current.material = interferenceMaterial;
      } else if (activePhase === 'electron') {
        // Gradual pattern buildup for electrons only (not observer)
        phaseStartTime.current = Date.now();
        animateElectronPattern();
      }
      // Observer and proton phases keep the default gray screen

      // Update generator label based on phase
      let labelText = 'Particle Generator';
      switch (activePhase) {
        case 'proton':
          labelText = 'Proton Accelerator';
          break;
        case 'lightwave':
          labelText = 'Laser';
          break;
        case 'electron':
        case 'observer':
          labelText = 'Electron Gun';
          break;
      }
      updateGeneratorLabel(sceneRef.current, labelText);

      console.log('Light elements visibility:', showLightElements, 'Observer visibility:', showObserver, 'Generator label:', labelText, 'for phase:', activePhase);
    }
  }, [activePhase, sceneReady]);

  // Cleanup animation on unmount or phase change
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activePhase]);

  useResponsiveLayout({
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    controls: controlsRef.current
  });

  useExperimentAnimation({
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    controls: controlsRef.current,
    particleSystem: particleSystemRef.current,
    detectionScreen: detectionScreenRef.current,
    activePhase
  });



  const handlePhaseChange = (phase: string) => {
    console.log('Phase changing to:', phase);

    setActivePhase(phase);

    if (!particleSystemRef.current) {
      console.log('No particle system available');
      return;
    }

    if (phase === 'lightwave') {
      console.log('Switching to lightwave: clearing all particles');
      particleSystemRef.current.clearAllParticles();
    } else if (phase === 'proton') {
      console.log('Switching to proton: clearing and restarting');
      particleSystemRef.current.clearAllParticles();
      particleSystemRef.current.createInitialProtons(50);
      console.log('New protons created:', particleSystemRef.current.getParticleCount());
    } else if (phase === 'electron') {
      console.log('Switching to electron: clearing and restarting');
      particleSystemRef.current.clearAllParticles();
      particleSystemRef.current.createInitialElectrons(50);
      console.log('New electrons created:', particleSystemRef.current.getParticleCount());
    } else if (phase === 'observer') {
      console.log('Switching to observer: clearing and restarting with electrons');
      particleSystemRef.current.clearAllParticles();
      particleSystemRef.current.createInitialElectrons(50);
      console.log('New electrons created for observer phase:', particleSystemRef.current.getParticleCount());
    } else {
      particleSystemRef.current.clearAllParticles();
    }
  };



  return (
    <div className="relative w-full h-screen bg-black overflow-hidden" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
      <div ref={mountRef} className="w-full h-full" />

      <TopBar />

      <PhaseSelector activePhase={activePhase} onPhaseChange={handlePhaseChange} />

      <OrientationWarning />

    </div>
  );
}