import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ParticleSystem } from '../components/ParticleSystem';
import { updateParticlePhysics } from '../utils/physicsSimulation';

interface AnimationProps {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  controls: OrbitControls | null;
  particleSystem: ParticleSystem | null;
  detectionScreen: THREE.Mesh | null;
  activePhase: string;
  onPhaseCycleRestart?: (phase: string) => void;
}

// Total number of particles fired per phase. Once the budget is exhausted and
// every particle has landed, the whole phase animation restarts after a short
// pause. The electron phase uses a larger budget so the interference pattern
// fade-in can finish before the cycle restarts.
const PARTICLE_BUDGET: Record<string, number> = {
  proton: 800,
  observer: 800,
  electron: 4800
};

// Maximum particles simultaneously in flight (marks stuck on screens excluded)
const MAX_IN_FLIGHT = 150;

// Pause between the end of a finite phase and its automatic restart
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
  onPhaseCycleRestart
}: AnimationProps) => {
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!scene || !camera || !renderer) {
      return;
    }

    // Counts particles fired by the source in the current phase.
    // Resets whenever the effect re-runs (i.e. on phase change).
    let emittedCount = 0;
    // Timestamp of when a finite phase ran out of particles, used to
    // schedule the automatic restart of the phase animation.
    let phaseEndedAt: number | null = null;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (controls) {
        controls.update();
      }

      // Update experiment physics  
      const currentPhase = activePhase; // Use prop directly instead of ref

      // Fire new particles while the per-phase budget lasts, keeping a bounded
      // number of particles in flight at once. Marks stuck on the screens
      // don't count against the in-flight cap.
      const budget = PARTICLE_BUDGET[currentPhase] ?? 0;
      if (budget > 0 && particleSystem && emittedCount < budget && particleSystem.getActiveParticleCount() < MAX_IN_FLIGHT) {
        const particlesToAdd = Math.min(
          5,
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
      }

      // Once a finite phase has fired its whole budget and every particle has
      // landed or left the scene, wait a few seconds and restart the phase
      // animation from scratch.
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

      // Update particle physics only if particle system exists
      if (particleSystem && particleSystem.getParticleCount() > 0) {
        const updatedParticles = updateParticlePhysics(
          particleSystem.getParticles(),
          detectionScreen,
          scene,
          (particle) => particleSystem.removeParticle(particle),
          currentPhase
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