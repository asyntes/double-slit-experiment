import * as THREE from 'three';
import { Particle } from '../components/ParticleSystem';

export const updateParticlePhysics = (
  particles: Particle[],
  detectionScreen: THREE.Mesh | null,
  scene: THREE.Scene,
  onRemoveParticle: (particle: Particle) => void,
  activePhase: string = 'proton'
): Particle[] => {
  const time = Date.now() * 0.001;

  return particles.filter(particle => {
    // Stuck marks stay in place permanently (until the phase changes)
    if (particle.userData.isMark) {
      return true;
    }

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
      if (particle.material instanceof THREE.MeshBasicMaterial) {
        // Dim the HDR color so stuck particles glow less than flying ones
        particle.material.color.multiplyScalar(0.55);
      }
      particle.userData.velocity.x = 0;
      particle.userData.velocity.y = 0;
      particle.userData.velocity.z = 0;
      particle.userData.isMark = true;
      particle.userData.markTime = time;
      return true;
    }

    // Check hit with detection screen (z=30)
    if (detectionScreen && particle.position.z >= 30 &&
      Math.abs(particle.position.x) <= 10 && Math.abs(particle.position.y) <= 7.5) {
      if (activePhase === 'electron') {
        // Electrons never leave dots on the detection screen: the interference
        // pattern building up there is rendered by the screen texture instead.
        onRemoveParticle(particle);
        return false;
      }
      // Proton / observer particles stick permanently until the phase restarts
      particle.position.z = 30;
      if (particle.material instanceof THREE.MeshBasicMaterial) {
        particle.material.color.setRGB(1.6, 1.6, 1.5);
      }
      particle.userData.velocity.x = 0;
      particle.userData.velocity.y = 0;
      particle.userData.velocity.z = 0;
      particle.scale.setScalar(1.2);
      particle.userData.isMark = true;
      particle.userData.markTime = time;
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