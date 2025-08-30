'use client';

import { useEffect, useRef, useState } from 'react';
import './DoubleSlitExperiment.css';
import PhaseSelector from './components/PhaseSelector/PhaseSelector';
import TopBar from './components/TopBar/TopBar';
import { useThreeScene } from './hooks/useThreeScene';
import { useResponsiveLayout } from './hooks/useResponsiveLayout';
import { useExperimentAnimation } from './hooks/useExperimentAnimation';
import { ParticleSystem } from './components/ParticleSystem';


export default function DoubleSlitExperiment() {
  const [activePhase, setActivePhase] = useState('proton');

  const { 
    mountRef, 
    sceneRef, 
    rendererRef, 
    cameraRef, 
    controlsRef,
    detectionScreenRef,
    diffractionPanelRef,
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