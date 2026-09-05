import * as THREE from 'three';
import { Particle } from '../components/ParticleSystem';

export interface PhysicsOptions {
  /** When true, particles are steered through one slit (which-path measured). */
  measuresPath?: boolean;
  /** Called once per particle that reaches the detection screen. */
  onScreenHit?: () => void;
}

export const updateParticlePhysics = (
  particles: Particle[],
  detectionScreen: THREE.Mesh | null,
  scene: THREE.Scene,
  onRemoveParticle: (particle: Particle) => void,
  activePhase: string = 'proton',
  options: PhysicsOptions = {}
): Particle[] => {
  const measuresPath = options.measuresPath === true;
  const onScreenHit = options.onScreenHit;

  return particles.filter(particle => {
    if (particle.userData.isMark) {
      return true;
    }

    if (measuresPath && particle.userData.slitChoice && particle.position.z < 15) {
      const targetX = particle.userData.slitChoice * 1.0;
      const dx = targetX - particle.position.x;
      particle.userData.velocity.x += dx * 0.002;
      particle.userData.velocity.x *= 0.98;
    }

    particle.position.x += particle.userData.velocity.x;
    particle.position.y += particle.userData.velocity.y;
    particle.position.z += particle.userData.velocity.z;

    const hitsDiffractionPanel = particle.position.z >= 15 &&
      !((particle.position.x >= -1.5 && particle.position.x <= -0.5 &&
        particle.position.y >= -2 && particle.position.y <= 2) ||
        (particle.position.x >= 0.5 && particle.position.x <= 1.5 &&
          particle.position.y >= -2 && particle.position.y <= 2));

    if (hitsDiffractionPanel) {
      particle.position.z = 14.75;
      if (particle.material instanceof THREE.MeshBasicMaterial) {
        particle.material.color.multiplyScalar(0.55);
      }
      particle.userData.velocity.x = 0;
      particle.userData.velocity.y = 0;
      particle.userData.velocity.z = 0;
      particle.userData.isMark = true;
      particle.visible = true;
      if (particle.userData.trail) {
        particle.userData.trail.visible = false;
      }
      return true;
    }

    if (detectionScreen && particle.position.z >= 30 &&
      Math.abs(particle.position.x) <= 10 && Math.abs(particle.position.y) <= 7.5) {
      onScreenHit?.();

      if (activePhase === 'electron' || activePhase === 'observer') {
        onRemoveParticle(particle);
        return false;
      }

      particle.position.z = 30;
      if (particle.material instanceof THREE.MeshBasicMaterial) {
        particle.material.color.setRGB(1.6, 1.6, 1.5);
      }
      particle.userData.velocity.x = 0;
      particle.userData.velocity.y = 0;
      particle.userData.velocity.z = 0;
      particle.scale.setScalar(1.2);
      particle.userData.isMark = true;
      particle.visible = true;
      if (particle.userData.trail) {
        particle.userData.trail.visible = false;
      }
    }

    if (particle.position.z > 35 ||
      Math.abs(particle.position.x) > 15 ||
      Math.abs(particle.position.y) > 15) {
      onRemoveParticle(particle);
      return false;
    }

    return true;
  });
};
