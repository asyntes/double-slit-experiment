import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ParticleSystem } from '../components/ParticleSystem';
import { updateParticlePhysics } from '../utils/physicsSimulation';
import { clampOrbitControlsPan } from '../utils/clampOrbitControlsPan';

interface AnimationProps {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  controls: OrbitControls | null;
  particleSystem: ParticleSystem | null;
  detectionScreen: THREE.Mesh | null;
  activePhase: string;
  whichPathKnown: boolean;
  showPaths: boolean;
  /** 1–10; higher = faster electron emission for shot-by-shot build-up. */
  intensity?: number;
  onPhaseCycleRestart?: (phase: string) => void;
  onScreenHit?: () => void;
}

const PARTICLE_BUDGET: Record<string, number> = {
  proton: 800,
  observer: 800,
  electron: 4800
};

const MAX_IN_FLIGHT = 150;
const RESTART_DELAY_MS = 3000;

export const useExperimentAnimation = ({
  scene,
  camera,
  renderer,
  composer,
  controls,
  particleSystem,
  detectionScreen,
  activePhase,
  whichPathKnown,
  showPaths,
  intensity = 4,
  onPhaseCycleRestart,
  onScreenHit
}: AnimationProps) => {
  const animationIdRef = useRef<number | null>(null);
  const whichPathRef = useRef(whichPathKnown);
  const showPathsRef = useRef(showPaths);
  const intensityRef = useRef(intensity);
  const onScreenHitRef = useRef(onScreenHit);

  whichPathRef.current = whichPathKnown;
  showPathsRef.current = showPaths;
  intensityRef.current = intensity;
  onScreenHitRef.current = onScreenHit;

  useEffect(() => {
    if (!scene || !camera || !renderer) {
      return;
    }

    let emittedCount = 0;
    let phaseEndedAt: number | null = null;
    let lastEmitAt = 0;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (controls) {
        controls.update();
        clampOrbitControlsPan(controls);
      }

      const currentPhase = activePhase;
      const budget = PARTICLE_BUDGET[currentPhase] ?? 0;
      const pathKnown = whichPathRef.current;
      const level = Math.max(1, Math.min(10, intensityRef.current));

      // Electron + detector OFF: slower single-shot emission scaled by intensity
      let batch = 5;
      let emitIntervalMs = 0;
      if (currentPhase === 'electron' && !pathKnown) {
        batch = Math.max(1, Math.floor(level / 3));
        emitIntervalMs = Math.max(16, 120 - level * 10);
      } else if (currentPhase === 'observer' || (currentPhase === 'electron' && pathKnown)) {
        batch = Math.max(1, Math.floor(level / 2));
      }

      const canEmitByTime = performance.now() - lastEmitAt >= emitIntervalMs;

      if (
        budget > 0 &&
        particleSystem &&
        emittedCount < budget &&
        particleSystem.getActiveParticleCount() < MAX_IN_FLIGHT &&
        canEmitByTime
      ) {
        const particlesToAdd = Math.min(
          batch,
          MAX_IN_FLIGHT - particleSystem.getActiveParticleCount(),
          budget - emittedCount
        );
        for (let i = 0; i < particlesToAdd; i++) {
          if (currentPhase === 'proton') {
            particleSystem.createSingleProton();
          } else if (currentPhase === 'electron' || currentPhase === 'observer') {
            particleSystem.createSingleElectron();
          }
          emittedCount++;
        }
        if (particlesToAdd > 0) {
          lastEmitAt = performance.now();
        }
      }

      if (
        particleSystem &&
        Number.isFinite(budget) &&
        budget > 0 &&
        emittedCount >= budget &&
        particleSystem.getActiveParticleCount() === 0
      ) {
        if (phaseEndedAt === null) {
          phaseEndedAt = performance.now();
        } else if (performance.now() - phaseEndedAt >= RESTART_DELAY_MS) {
          particleSystem.clearAllParticles();
          emittedCount = 0;
          phaseEndedAt = null;
          onPhaseCycleRestart?.(currentPhase);
        }
      } else {
        phaseEndedAt = null;
      }

      if (particleSystem && particleSystem.getParticleCount() > 0) {
        const updatedParticles = updateParticlePhysics(
          particleSystem.getParticles(),
          detectionScreen,
          scene,
          (particle) => particleSystem.removeParticle(particle),
          currentPhase,
          {
            whichPathKnown: whichPathRef.current,
            showPaths: showPathsRef.current,
            onScreenHit: () => onScreenHitRef.current?.()
          }
        );
        particleSystem.setParticles(updatedParticles);
      }

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [scene, camera, renderer, composer, controls, particleSystem, detectionScreen, activePhase, onPhaseCycleRestart]);
};
