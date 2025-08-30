'use client';

import { useEffect, useState } from 'react';
import './DoubleSlitExperiment.css';
import PhaseSelector from './components/PhaseSelector/PhaseSelector';
import TopBar from './components/TopBar/TopBar';
import { useThreeScene } from './hooks/useThreeScene';
import { useResponsiveLayout } from './hooks/useResponsiveLayout';
import { useExperimentAnimation } from './hooks/useExperimentAnimation';
import { updateGeneratorLabel } from './components/SceneLabels';


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
    lightConeRef,
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

  // Handle light cone visibility and generator label based on active phase
  useEffect(() => {
    if (lightConeRef.current && sceneRef.current) {
      const showCone = activePhase === 'lightwave';
      lightConeRef.current.visible = showCone;
      
      // Update generator label based on phase
      const labelText = activePhase === 'lightwave' ? 'Light Generator' : 'Particle Generator';
      updateGeneratorLabel(sceneRef.current, labelText);
      
      console.log('Light cone visibility:', showCone, 'Generator label:', labelText, 'for phase:', activePhase);
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