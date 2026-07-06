import * as THREE from 'three';
import { Particle } from '../components/ParticleSystem';

// How long stuck marks stay on the screens before being consumed, per phase.
// Electron marks last until the full interference pattern is realized (60s),
// matching the pattern build-up animation duration.
const MARK_LIFETIME_SECONDS: Record<string, number> = {
  proton: 8,
  observer: 8,
  electron: 60
};
const MARK_FADE_SECONDS = 2.5;

export const updateParticlePhysics = (
  particles: Particle[],
  detectionScreen: THREE.Mesh | null,
  scene: THREE.Scene,
  onRemoveParticle: (particle: Particle) => void,
  activePhase: string = 'proton'
): Particle[] => {
  const time = Date.now() * 0.001;

  return particles.filter(particle => {
    // Stuck marks stay in place, then fade out and get consumed after their lifetime
    if (particle.userData.isMark) {
      const lifetime = MARK_LIFETIME_SECONDS[activePhase] ?? 8;
      const age = time - particle.userData.markTime;

      if (age >= lifetime) {
        onRemoveParticle(particle);
        return false;
      }

      const fadeStart = lifetime - MARK_FADE_SECONDS;
      if (age > fadeStart && particle.material instanceof THREE.MeshBasicMaterial) {
        particle.material.transparent = true;
        particle.material.opacity = Math.max(0, 1 - (age - fadeStart) / MARK_FADE_SECONDS);
        particle.material.needsUpdate = true;
      }
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
      // All detected particles stick permanently on the screen until the phase changes
      particle.position.z = 30;
      if (particle.material instanceof THREE.MeshBasicMaterial) {
        if (activePhase === 'electron') {
          // Keep the electron color, slightly dimmed like panel deposits
          particle.material.color.multiplyScalar(0.65);
        } else {
          // Proton / observer detection marks
          particle.material.color.setRGB(1.6, 1.6, 1.5);
        }
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