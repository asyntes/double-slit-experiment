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
}

export const useExperimentAnimation = ({
  scene,
  camera,
  renderer,
  composer,
  controls,
  particleSystem,
  detectionScreen,
  activePhase
}: AnimationProps) => {
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    console.log('useExperimentAnimation - Dependencies:', {
      scene: !!scene,
      camera: !!camera,
      renderer: !!renderer,
      particleSystem: !!particleSystem,
      sceneChildren: scene?.children.length
    });
    if (!scene || !camera || !renderer) {
      console.log('Animation hook missing basic deps, skipping');
      return;
    }

    console.log('Starting animation loop');

    let frameCount = 0;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      frameCount++;
      if (frameCount % 60 === 0) { // Log every 60 frames (roughly 1 second)
        console.log('Animation running - Frame:', frameCount, 'Particles:', particleSystem?.getParticleCount() || 0);
      }

      if (controls) {
        controls.update();
      }

      // Update experiment physics  
      const currentPhase = activePhase; // Use prop directly instead of ref

      // Create new particles only in proton/electron/observer phases and if particle system exists.
      // Marks stuck on the panels are excluded from the cap so emission never stalls.
      if ((currentPhase === 'proton' || currentPhase === 'electron' || currentPhase === 'observer') && particleSystem && particleSystem.getActiveParticleCount() < 120) {
        const particlesToAdd = Math.min(5, 120 - particleSystem.getActiveParticleCount());
        for (let i = 0; i < particlesToAdd; i++) {
          if (currentPhase === 'proton') {
            particleSystem.createSingleProton();
          } else if (currentPhase === 'electron' || currentPhase === 'observer') {
            particleSystem.createSingleElectron();
          }
        }
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

        // Safety cap so the scene never accumulates unbounded meshes.
        // Electron phase keeps many more marks so the interference pattern
        // can fully build up before older deposits are consumed.
        particleSystem.limitMarks(currentPhase === 'electron' ? 1200 : 400);
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
  }, [scene, camera, renderer, composer, controls, particleSystem, detectionScreen, activePhase]);
};