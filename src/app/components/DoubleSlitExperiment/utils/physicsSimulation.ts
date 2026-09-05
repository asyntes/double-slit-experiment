import * as THREE from 'three';
import { Particle } from '../components/ParticleSystem';

export interface PhysicsOptions {
  /** When true, which-path information is known → no interference (particle-like hits). */
  whichPathKnown?: boolean;
  /** Called once per particle that reaches the detection screen. */
  onScreenHit?: () => void;
  /** Hide in-flight particles (pattern-only mode). Marks stay visible. */
  showPaths?: boolean;
}

export const updateParticlePhysics = (
  particles: Particle[],
  detectionScreen: THREE.Mesh | null,
  scene: THREE.Scene,
  onRemoveParticle: (particle: Particle) => void,
  activePhase: string = 'proton',
  options: PhysicsOptions = {}
): Particle[] => {
  const {
    whichPathKnown = activePhase === 'observer' || activePhase === 'whichpath',
    onScreenHit,
    showPaths = true
  } = options;

  return particles.filter(particle => {
    // Stuck marks stay in place permanently (until the phase changes)
    if (particle.userData.isMark) {
      particle.visible = true;
      return true;
    }

    particle.visible = showPaths;

    // Update particle position
    particle.position.x += particle.userData.velocity.x;
    particle.position.y += particle.userData.velocity.y;
    particle.position.z += particle.userData.velocity.z;

    // Check collision with diffraction panel (z=15)
    // Slits are at x: -1.5 to -0.5 and 0.5 to 1.5, y: -2 to 2
    const hitsDiffractionPanel = particle.position.z >= 15 &&
      !((particle.position.x >= -1.5 && particle.position.x <= -0.5 &&
        particle.position.y >= -2 && particle.position.y <= 2) ||
        (particle.position.x >= 0.5 && particle.position.x <= 1.5 &&
          particle.position.y >= -2 && particle.position.y <= 2));

    if (hitsDiffractionPanel) {
      // Blocked particles stick to the front face of the diffraction panel
      particle.position.z = 14.75;
      particle.visible = showPaths;
      if (particle.material instanceof THREE.MeshBasicMaterial) {
        // Dim the HDR color so stuck particles glow less than flying ones
        particle.material.color.multiplyScalar(0.55);
      }
      particle.userData.velocity.x = 0;
      particle.userData.velocity.y = 0;
      particle.userData.velocity.z = 0;
      particle.userData.isMark = true;
      return true;
    }

    // Check hit with detection screen (z=30)
    if (detectionScreen && particle.position.z >= 30 &&
      Math.abs(particle.position.x) <= 10 && Math.abs(particle.position.y) <= 7.5) {
      onScreenHit?.();

      // Electron / which-path with unknown path: pattern builds on the screen texture
      // (shot-by-shot). Path-known modes leave classical particle marks.
      const buildsTexturePattern =
        (activePhase === 'electron' || activePhase === 'whichpath' || activePhase === 'observer') &&
        !whichPathKnown;

      if (buildsTexturePattern) {
        onRemoveParticle(particle);
        return false;
      }

      // Path known (detector ON) or proton: stick as a classical hit mark
      particle.position.z = 30;
      particle.visible = true;
      if (particle.material instanceof THREE.MeshBasicMaterial) {
        particle.material.color.setRGB(1.6, 1.6, 1.5);
      }
      particle.userData.velocity.x = 0;
      particle.userData.velocity.y = 0;
      particle.userData.velocity.z = 0;
      particle.scale.setScalar(1.2);
      particle.userData.isMark = true;
    }

    // Remove particles that are too far from the experiment area
    if (particle.position.z > 35 ||
      Math.abs(particle.position.x) > 15 ||
      Math.abs(particle.position.y) > 15) {
      onRemoveParticle(particle);
      return false;
    }

    return true;
  });
};
