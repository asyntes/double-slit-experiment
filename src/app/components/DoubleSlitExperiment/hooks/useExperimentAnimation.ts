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
  intensity?: number;
  showPaths?: boolean;
  /** Explicit which-path detector ON = path known. */
  detectorOn?: boolean;
  /** Alias used by some callers. */
  whichPathKnown?: boolean;
  onPhaseCycleRestart?: (phase: string) => void;
  onShotsFired?: (count: number) => void;
  onScreenHit?: () => void;
}

const PARTICLE_BUDGET: Record<string, number> = {
  proton: 800,
  observer: 4800,
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
  intensity = 5,
  showPaths = true,
  detectorOn = false,
  whichPathKnown,
  onPhaseCycleRestart,
  onShotsFired,
  onScreenHit
}: AnimationProps) => {
  const animationIdRef = useRef<number | null>(null);
  const intensityRef = useRef(intensity);
  const showPathsRef = useRef(showPaths);
  const detectorOnRef = useRef(whichPathKnown ?? detectorOn);
  const onShotsFiredRef = useRef(onShotsFired);
  const onScreenHitRef = useRef(onScreenHit);

  intensityRef.current = intensity;
  showPathsRef.current = showPaths;
  detectorOnRef.current = whichPathKnown ?? detectorOn;
  onShotsFiredRef.current = onShotsFired;
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
      const level = Math.max(1, Math.min(10, intensityRef.current));
      const pathKnown = detectorOnRef.current;

      let burstSize = Math.max(1, Math.round(level));
      let emitIntervalMs = 0;
      if (currentPhase === 'electron' && !pathKnown) {
        burstSize = Math.max(1, Math.floor(level / 3));
        emitIntervalMs = Math.max(16, 120 - level * 10);
      }

      const budget = PARTICLE_BUDGET[currentPhase] ?? 0;
      const canEmitByTime = performance.now() - lastEmitAt >= emitIntervalMs;

      if (
        budget > 0 &&
        particleSystem &&
        emittedCount < budget &&
        particleSystem.getActiveParticleCount() < MAX_IN_FLIGHT &&
        canEmitByTime
      ) {
        const particlesToAdd = Math.min(
          burstSize,
          MAX_IN_FLIGHT - particleSystem.getActiveParticleCount(),
          budget - emittedCount
        );
        let added = 0;
        for (let i = 0; i < particlesToAdd; i++) {
          if (currentPhase === 'proton') {
            particleSystem.createSingleProton();
          } else if (currentPhase === 'electron' || currentPhase === 'observer') {
            if (pathKnown) {
              particleSystem.createSingleElectron({
                forceSlit: Math.random() < 0.5 ? -1 : 1
              });
            } else {
              particleSystem.createSingleElectron();
            }
          }
          emittedCount++;
          added++;
        }
        if (added > 0) {
          lastEmitAt = performance.now();
          onShotsFiredRef.current?.(added);
        }
      }

      if (particleSystem) {
        particleSystem.setPathsVisible(showPathsRef.current);
        particleSystem.updateTrails();
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
        const measuresPath =
          detectorOnRef.current && (currentPhase === 'electron' || currentPhase === 'observer');

        const updatedParticles = updateParticlePhysics(
          particleSystem.getParticles(),
          detectionScreen,
          scene,
          (particle) => particleSystem.removeParticle(particle),
          currentPhase,
          {
            measuresPath,
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
