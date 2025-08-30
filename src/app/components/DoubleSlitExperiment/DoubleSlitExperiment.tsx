'use client';

import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import './DoubleSlitExperiment.css';
import PhaseSelector from './components/PhaseSelector/PhaseSelector';
import TopBar from './components/TopBar/TopBar';
import { useThreeScene } from './hooks/useThreeScene';
import { useResponsiveLayout } from './hooks/useResponsiveLayout';
import { useExperimentAnimation } from './hooks/useExperimentAnimation';
import { updateGeneratorLabel } from './components/SceneLabels';


export default function DoubleSlitExperiment() {
  const [activePhase, setActivePhase] = useState('proton');

  // Create stripe texture function
  const createStripeTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384; // 4:3 aspect ratio to match 20x15 geometry
    const ctx = canvas.getContext('2d')!;

    // Fill with dark background
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate stripe dimensions
    const totalWidth = canvas.width;
    const stripeRegionWidth = totalWidth * 0.5; // 10 units out of 20 = half width
    const stripeRegionStart = (totalWidth - stripeRegionWidth) / 2; // Center the stripes
    const stripeHeight = canvas.height * (4 / 15); // 4 units out of 15 = same height as trapezoid base
    const stripeRegionTop = (canvas.height - stripeHeight) / 2; // Center vertically

    // Draw alternating white stripes
    const stripeWidth = stripeRegionWidth / 20; // Create 20 stripes for good visibility
    ctx.fillStyle = '#ffffff';

    for (let i = 0; i < 20; i += 2) {
      const x = stripeRegionStart + (i * stripeWidth);
      ctx.fillRect(x, stripeRegionTop, stripeWidth, stripeHeight);
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
    diffractionPanelRef,
    lightConeRef,
    leftTrapezoidRef,
    rightTrapezoidRef,
    labelsRef,
    particleSystemRef,
    sceneReady
  } = useThreeScene();

  // Log when scene is ready
  useEffect(() => {
    if (sceneReady) {
      console.log('Scene ready, particle system available:', !!particleSystemRef.current);
    }
  }, [sceneReady]);

  // Handle light cone, trapezoids visibility and generator label based on active phase
  useEffect(() => {
    if (lightConeRef.current && leftTrapezoidRef.current && rightTrapezoidRef.current && sceneRef.current && detectionScreenRef.current) {
      const showLightElements = activePhase === 'lightwave';

      // Control visibility of light elements
      lightConeRef.current.visible = showLightElements;
      leftTrapezoidRef.current.visible = showLightElements;
      rightTrapezoidRef.current.visible = showLightElements;

      // Switch detection screen material based on phase
      if (activePhase === 'lightwave') {
        const stripeTexture = createStripeTexture();
        const stripeMaterial = new THREE.MeshBasicMaterial({
          map: stripeTexture,
          side: THREE.DoubleSide
        });
        detectionScreenRef.current.material = stripeMaterial;
      } else {
        const defaultMaterial = new THREE.MeshBasicMaterial({
          color: 0x333333,
          side: THREE.DoubleSide
        });
        detectionScreenRef.current.material = defaultMaterial;
      }

      // Update generator label based on phase
      const labelText = activePhase === 'lightwave' ? 'Light Generator' : 'Particle Generator';
      updateGeneratorLabel(sceneRef.current, labelText);

      console.log('Light elements visibility:', showLightElements, 'Generator label:', labelText, 'for phase:', activePhase);
    }
  }, [activePhase, sceneReady]);

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

    // Update phase first
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
      // Immediately create new particles without timeout
      particleSystemRef.current.createInitialProtons(50);
      console.log('New protons created:', particleSystemRef.current.getParticleCount());
    } else {
      // For other phases, just clear particles
      particleSystemRef.current.clearAllParticles();
    }
  };



  return (
    <div className="relative w-full h-screen bg-black overflow-hidden" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
      <div ref={mountRef} className="w-full h-full" />

      <TopBar />

      <PhaseSelector activePhase={activePhase} onPhaseChange={handlePhaseChange} />

    </div>
  );
}