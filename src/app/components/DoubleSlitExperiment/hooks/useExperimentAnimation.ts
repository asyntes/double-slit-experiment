import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ParticleSystem } from '../components/ParticleSystem';
import { updateParticlePhysics } from '../utils/physicsSimulation';

interface AnimationProps {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  controls: OrbitControls | null;
  particleSystem: ParticleSystem | null;
  detectionScreen: THREE.Mesh | null;
  activePhase: string;
}

export const useExperimentAnimation = ({
  scene,
  camera,
  renderer,
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
      
      // Create new particles only in proton phase and if particle system exists
      if (currentPhase === 'proton' && particleSystem && particleSystem.getParticleCount() < 120) {
        const particlesToAdd = Math.min(5, 120 - particleSystem.getParticleCount());
        for (let i = 0; i < particlesToAdd; i++) {
          particleSystem.createSingleProton();
        }
      }

      // Update particle physics only if particle system exists
      if (particleSystem && particleSystem.getParticleCount() > 0) {
        const updatedParticles = updateParticlePhysics(
          particleSystem.getParticles(),
          detectionScreen,
          scene,
          (particle) => particleSystem.removeParticle(particle)
        );
        
        particleSystem.setParticles(updatedParticles);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [scene, camera, renderer, controls, particleSystem, detectionScreen, activePhase]);
};