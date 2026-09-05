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


function createScreenTexture(options: {
  whichPath: boolean;
  shotCount: number;
}): THREE.CanvasTexture {
  const { whichPath, shotCount } = options;
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
  const samples = Math.max(200, Math.floor(shotCount));

  ctx.fillStyle = '#ffffff';

  for (let i = 0; i < samples; i++) {
    const x = Math.random() * stripeRegionWidth - stripeRegionWidth / 2;
    const y = (Math.random() - 0.5) * stripeHeight;
    const normalizedX = Math.abs(x) / (stripeRegionWidth / 2);
    const envelope = Math.exp(-normalizedX * normalizedX * 3);

    // Two slit centers in the same coordinate system as the fringe region
    const slit = stripeRegionWidth * 0.22;
    const a1 = Math.exp(-((x + slit) ** 2) / (2 * (stripeRegionWidth * 0.12) ** 2));
    const a2 = Math.exp(-((x - slit) ** 2) / (2 * (stripeRegionWidth * 0.12) ** 2));

    let totalIntensity: number;
    if (whichPath) {
      // Classical mixture: no cross term → no fringes
      totalIntensity = (a1 * a1 + a2 * a2) * envelope;
    } else {
      const fringe = Math.cos(x * 0.08) * Math.cos(x * 0.08);
      totalIntensity = fringe * envelope;
    }

    const intensity = Math.random();
    if (intensity < totalIntensity * (whichPath ? 0.85 : 1.0)) {
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
}


export default function DoubleSlitExperiment() {
  const [activePhase, setActivePhase] = useState('proton');
  const [showPaths, setShowPaths] = useState(true);
  const [shotCount, setShotCount] = useState(4000);
  const phaseStartTime = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  const whichPathActive = activePhase === 'observer';

  const animateElectronPattern = useCallback(() => {
    if (!detectionScreenRef.current || !detectionScreenBackRef.current) return;

    const interferenceTexture = createScreenTexture({
      whichPath: false,
      shotCount
    });
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
  }, [activePhase, shotCount]);

  const restartElectronPhase = useCallback(() => {
    phaseStartTime.current = Date.now();
    animateElectronPattern();
  }, [animateElectronPattern]);

  const handlePhaseCycleRestart = useCallback((phase: string) => {
    if (phase === 'electron') {
      restartElectronPhase();
    }
  }, [restartElectronPhase]);

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
        const interferenceTexture = createScreenTexture({
          whichPath: false,
          shotCount
        });
        const interferenceMaterial = new THREE.MeshBasicMaterial({
          map: interferenceTexture,
          color: 0x727272,
          side: THREE.DoubleSide
        });
        detectionScreenRef.current.material = interferenceMaterial;
      } else if (activePhase === 'electron') {
        restartElectronPhase();
      } else if (activePhase === 'observer') {
        // Which-path ON: classical mixture texture (no fringes)
        const classicalTexture = createScreenTexture({
          whichPath: true,
          shotCount
        });
        const classicalMaterial = new THREE.MeshBasicMaterial({
          map: classicalTexture,
          color: 0x727272,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95
        });
        detectionScreenRef.current.material = classicalMaterial;
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
  }, [activePhase, sceneReady, restartElectronPhase, shotCount]);

  useEffect(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.visible = showPaths;
    }
  }, [showPaths, sceneReady, activePhase]);

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

      <div className="absolute left-1/2 -translate-x-1/2 bottom-[210px] z-20 w-[min(920px,94vw)] flex flex-col gap-2 pointer-events-auto">
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 bg-black/70 border border-white/15 rounded-md text-white text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPaths}
              onChange={(e) => setShowPaths(e.target.checked)}
            />
            Show paths
          </label>
          <label className="inline-flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="whitespace-nowrap">Shots</span>
            <input
              type="range"
              min={200}
              max={8000}
              step={100}
              value={shotCount}
              onChange={(e) => setShotCount(Number(e.target.value))}
              className="w-full"
            />
            <span className="tabular-nums w-12 text-right">{shotCount}</span>
          </label>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${whichPathActive ? 'bg-amber-400/90 text-black' : 'bg-white/15 text-white'}`}>
            Detector {whichPathActive ? 'ON' : 'OFF'}
          </span>
        </div>
        <p className="text-center text-white/85 text-sm tracking-wide">
          sapere il percorso ≠ guardare
          {whichPathActive ? ' — which-path ON, frange OFF' : ''}
        </p>
      </div>

      <PhaseSelector activePhase={activePhase} onPhaseChange={handlePhaseChange} />

      <OrientationWarning />

    </div>
  );
}
