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

  const createStripeTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const totalWidth = canvas.width;
    const stripeRegionWidth = totalWidth * 0.5;
    const stripeRegionStart = (totalWidth - stripeRegionWidth) / 2;
    const stripeHeight = canvas.height * (4 / 15);
    const stripeRegionTop = (canvas.height - stripeHeight) / 2;

    const stripeWidth = stripeRegionWidth / 20;
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
    if (lightConeRef.current && leftTrapezoidRef.current && rightTrapezoidRef.current && observerRef.current && sceneRef.current && detectionScreenRef.current) {
      const showLightElements = activePhase === 'lightwave';
      const showObserver = activePhase === 'observer';

      lightConeRef.current.visible = showLightElements;
      leftTrapezoidRef.current.visible = showLightElements;
      rightTrapezoidRef.current.visible = showLightElements;
      observerRef.current.visible = showObserver;

      if (activePhase === 'lightwave' || activePhase === 'electron') {
        const stripeTexture = createStripeTexture();
        const stripeMaterial = new THREE.MeshBasicMaterial({
          map: stripeTexture,
          color: 0x727272,
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

      console.log('Light elements visibility:', showLightElements, 'Observer visibility:', showObserver, 'Generator label:', labelText, 'for phase:', activePhase);
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