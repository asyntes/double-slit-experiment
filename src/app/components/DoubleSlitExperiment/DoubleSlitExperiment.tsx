'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import * as THREE from 'three';
import PhaseSelector from './components/PhaseSelector/PhaseSelector';
import ExperimentControls from './components/ExperimentControls/ExperimentControls';
import TopBar from './components/TopBar/TopBar';
import OrientationWarning from './components/OrientationWarning/OrientationWarning';
import { useThreeScene } from './hooks/useThreeScene';
import { useResponsiveLayout } from './hooks/useResponsiveLayout';
import { useExperimentAnimation } from './hooks/useExperimentAnimation';
import { useViewportControl } from './hooks/useViewportControl';
import { createDetectionScreenBackMaterial } from './components/ExperimentSetup';
import { updateGeneratorLabel } from './components/SceneLabels';
import {
  clearPatternCanvas,
  createEmptyPatternCanvas,
  createFilledPatternTexture,
  paintShots,
  type PatternCanvas
} from './utils/patternTextures';

export default function DoubleSlitExperiment() {
  const [activePhase, setActivePhase] = useState('proton');
  /** Explicit which-path detector: ON = path known = no interference. */
  const [detectorOn, setDetectorOn] = useState(false);
  /** Pattern-only vs show in-flight trajectories. */
  const [showPaths, setShowPaths] = useState(true);
  const [shotCount, setShotCount] = useState(0);
  /** Fire rate multiplier for electron shot-by-shot build-up (1-10). */
  const [intensity, setIntensity] = useState(4);

  const patternRef = useRef<PatternCanvas | null>(null);
  const detectorRef = useRef(detectorOn);
  detectorRef.current = detectorOn;

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

  const ensurePattern = useCallback((): PatternCanvas => {
    if (!patternRef.current) {
      patternRef.current = createEmptyPatternCanvas();
    }
    return patternRef.current;
  }, []);

  const applyPatternMaterial = useCallback((opacity = 1) => {
    if (!detectionScreenRef.current) return;
    const pattern = ensurePattern();
    pattern.texture.needsUpdate = true;
    detectionScreenRef.current.material = new THREE.MeshBasicMaterial({
      map: pattern.texture,
      color: 0x727272,
      side: THREE.DoubleSide,
      transparent: opacity < 1,
      opacity
    });
  }, [ensurePattern, detectionScreenRef]);

  const resetPattern = useCallback(() => {
    const pattern = ensurePattern();
    clearPatternCanvas(pattern);
    setShotCount(0);
  }, [ensurePattern]);

  const handleScreenHit = useCallback(() => {
    setShotCount(prev => prev + 1);

    // Shot-by-shot texture when path is unknown (interference)
    if (!detectorRef.current && (activePhase === 'electron' || activePhase === 'observer')) {
      const pattern = ensurePattern();
      paintShots(pattern, 'interference', 1);
      applyPatternMaterial(1);
    }
  }, [activePhase, ensurePattern, applyPatternMaterial]);

  const handlePhaseCycleRestart = useCallback((phase: string) => {
    if (phase === 'electron' || phase === 'observer') {
      resetPattern();
      if (!detectorRef.current) {
        applyPatternMaterial(1);
      }
    }
  }, [resetPattern, applyPatternMaterial]);

  useEffect(() => {
    if (
      !lightBeamRef.current ||
      !leftTrapezoidRef.current ||
      !rightTrapezoidRef.current ||
      !observerRef.current ||
      !sceneRef.current ||
      !detectionScreenRef.current ||
      !detectionScreenBackRef.current
    ) {
      return;
    }

    const showLightElements = activePhase === 'lightwave' && showPaths;
    const showDetectorMesh =
      detectorOn && (activePhase === 'electron' || activePhase === 'observer');

    lightBeamRef.current.visible = showLightElements;
    leftTrapezoidRef.current.visible = showLightElements;
    rightTrapezoidRef.current.visible = showLightElements;
    observerRef.current.visible = showDetectorMesh;

    detectionScreenBackRef.current.material = createDetectionScreenBackMaterial();
    detectionScreenRef.current.material = new THREE.MeshBasicMaterial({
      color: 0x333333,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });

    resetPattern();

    if (activePhase === 'lightwave') {
      const texture = createFilledPatternTexture('interference', 8000);
      detectionScreenRef.current.material = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0x727272,
        side: THREE.DoubleSide
      });
    } else if (
      (activePhase === 'electron' || activePhase === 'observer') &&
      !detectorOn
    ) {
      applyPatternMaterial(1);
    } else if (
      (activePhase === 'electron' || activePhase === 'observer') &&
      detectorOn
    ) {
      // Classical mixture preview texture while particle marks also accumulate
      const pattern = ensurePattern();
      clearPatternCanvas(pattern);
      paintShots(pattern, 'classical', 0);
      applyPatternMaterial(0.35);
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
  }, [
    activePhase,
    sceneReady,
    detectorOn,
    showPaths,
    resetPattern,
    ensurePattern,
    applyPatternMaterial
  ]);

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
    whichPathKnown: detectorOn,
    showPaths,
    intensity,
    onPhaseCycleRestart: handlePhaseCycleRestart,
    onScreenHit: handleScreenHit
  });

  const handlePhaseChange = (phase: string) => {
    setActivePhase(phase);

    if (phase === 'electron') {
      setDetectorOn(false);
    } else if (phase === 'observer') {
      setDetectorOn(true);
    }

    if (!particleSystemRef.current) return;

    particleSystemRef.current.clearAllParticles();
    setShotCount(0);

    if (phase === 'proton') {
      particleSystemRef.current.createInitialProtons(50);
    } else if (phase === 'electron' || phase === 'observer') {
      particleSystemRef.current.createInitialElectrons(50);
    }
  };

  const handleDetectorChange = (on: boolean) => {
    setDetectorOn(on);
    if (activePhase === 'electron' || activePhase === 'observer') {
      setActivePhase(on ? 'observer' : 'electron');
    }
    if (particleSystemRef.current) {
      particleSystemRef.current.clearAllParticles();
      particleSystemRef.current.createInitialElectrons(50);
    }
    setShotCount(0);
  };

  const showShotControls =
    activePhase === 'electron' || activePhase === 'observer' || activePhase === 'proton';

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
      <div ref={mountRef} className="w-full h-full" />

      <TopBar />

      <ExperimentControls
        activePhase={activePhase}
        detectorOn={detectorOn}
        onDetectorChange={handleDetectorChange}
        showPaths={showPaths}
        onShowPathsChange={setShowPaths}
        intensity={intensity}
        onIntensityChange={setIntensity}
        shotCount={shotCount}
        showShotControls={showShotControls}
      />

      <PhaseSelector activePhase={activePhase} onPhaseChange={handlePhaseChange} />

      <OrientationWarning />
    </div>
  );
}
