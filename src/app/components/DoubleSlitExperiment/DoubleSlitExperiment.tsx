'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import PhaseSelector from './components/PhaseSelector/PhaseSelector';
import TopBar from './components/TopBar/TopBar';
import OrientationWarning from './components/OrientationWarning/OrientationWarning';
import { useThreeScene } from './hooks/useThreeScene';
import { useResponsiveLayout } from './hooks/useResponsiveLayout';
import { useExperimentAnimation } from './hooks/useExperimentAnimation';
import { useViewportControl } from './hooks/useViewportControl';
import { createDetectionScreenBackMaterial } from './components/ExperimentSetup';
import { updateGeneratorLabel } from './components/SceneLabels';


export default function DoubleSlitExperiment() {
  const [activePhase, setActivePhase] = useState('proton');
  const phaseStartTime = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const animateElectronPattern = useCallback(() => {
    if (!detectionScreenRef.current || !detectionScreenBackRef.current) return;

    const interferenceTexture = createParticleInterferenceTexture();
    const interferenceMaterial = new THREE.MeshBasicMaterial({
      map: interferenceTexture,
      color: 0x727272,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    detectionScreenRef.current.material = interferenceMaterial;

    const baseMaterial = createDetectionScreenBackMaterial();
    detectionScreenBackRef.current.material = baseMaterial;

    const animate = () => {
      if (!detectionScreenRef.current?.material) return;

      const elapsed = Date.now() - phaseStartTime.current;
      const duration = 60000;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = 1 - Math.pow(1 - progress, 3);

      if (detectionScreenRef.current.material instanceof THREE.MeshBasicMaterial) {
        detectionScreenRef.current.material.opacity = easedProgress;
        detectionScreenRef.current.material.needsUpdate = true;
      }

      if (progress < 1 && activePhase === 'electron') {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animate();
  }, [activePhase]);

  const restartElectronPhase = useCallback(() => {
    phaseStartTime.current = Date.now();
    animateElectronPattern();
  }, [animateElectronPattern]);

  const handlePhaseCycleRestart = useCallback((phase: string) => {
    if (phase === 'electron') {
      restartElectronPhase();
    }
  }, [restartElectronPhase]);

  const createParticleInterferenceTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const stripeRegionWidth = canvas.width * 0.5;
    const stripeHeight = canvas.height * (4 / 15);

    ctx.fillStyle = '#ffffff';

    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * stripeRegionWidth - stripeRegionWidth / 2;
      const y = (Math.random() - 0.5) * stripeHeight;

      const fringe = Math.cos(x * 0.08) * Math.cos(x * 0.08);

      const normalizedX = Math.abs(x) / (stripeRegionWidth / 2);
      const envelope = Math.exp(-normalizedX * normalizedX * 3);

      const totalIntensity = fringe * envelope;
      const intensity = Math.random();

      if (intensity < totalIntensity * 1.0) {
        const particleX = centerX + x + (Math.random() - 0.5) * 2;
        const particleY = centerY + y + (Math.random() - 0.5) * 2;

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
    composerRef,
    cameraRef,
    controlsRef,
    detectionScreenRef,
    detectionScreenBackRef,
    lightBeamRef,
    leftTrapezoidRef,
    rightTrapezoidRef,
    particleSystemRef,
    observerRef,
    sceneReady
  } = useThreeScene();

  useEffect(() => {
    if (lightBeamRef.current && leftTrapezoidRef.current && rightTrapezoidRef.current && observerRef.current && sceneRef.current && detectionScreenRef.current && detectionScreenBackRef.current) {
      const showLightElements = activePhase === 'lightwave';
      const showObserver = activePhase === 'observer';

      lightBeamRef.current.visible = showLightElements;
      leftTrapezoidRef.current.visible = showLightElements;
      rightTrapezoidRef.current.visible = showLightElements;
      observerRef.current.visible = showObserver;

      const defaultMaterial = createDetectionScreenBackMaterial();
      detectionScreenBackRef.current.material = defaultMaterial;

      const transparentMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0
      });
      detectionScreenRef.current.material = transparentMaterial;

      if (activePhase === 'lightwave') {
        const interferenceTexture = createParticleInterferenceTexture();
        const interferenceMaterial = new THREE.MeshBasicMaterial({
          map: interferenceTexture,
          color: 0x727272,
          side: THREE.DoubleSide
        });
        detectionScreenRef.current.material = interferenceMaterial;
      } else if (activePhase === 'electron') {
        restartElectronPhase();
      }

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
    }
  }, [activePhase, sceneReady, restartElectronPhase]);

  // Cleanup animation on unmount or phase change
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activePhase]);

  useViewportControl();
  
  useResponsiveLayout({
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    composer: composerRef.current,
    controls: controlsRef.current
  });

  useExperimentAnimation({
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    composer: composerRef.current,
    controls: controlsRef.current,
    particleSystem: particleSystemRef.current,
    detectionScreen: detectionScreenRef.current,
    activePhase,
    onPhaseCycleRestart: handlePhaseCycleRestart
  });



  const handlePhaseChange = (phase: string) => {
    setActivePhase(phase);

    if (!particleSystemRef.current) {
      return;
    }

    particleSystemRef.current.clearAllParticles();

    if (phase === 'proton') {
      particleSystemRef.current.createInitialProtons(50);
    } else if (phase === 'electron' || phase === 'observer') {
      particleSystemRef.current.createInitialElectrons(50);
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