import * as THREE from 'three';
import { EMITTER_WORLD_Z } from './ExperimentSetup';

export interface Particle extends THREE.Mesh {
  userData: {
    velocity: {
      x: number;
      y: number;
      z: number;
    };
    isMark: boolean;
    /** Which slit this particle is headed toward (-1 left, +1 right); used when path is measured. */
    slitChoice?: -1 | 1;
    trail?: THREE.Line;
  };
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private scene: THREE.Scene;
  private pathsVisible = true;
  private trailGroup: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.trailGroup = new THREE.Group();
    this.trailGroup.name = 'particleTrails';
    this.scene.add(this.trailGroup);
  }

  setPathsVisible(visible: boolean) {
    this.pathsVisible = visible;
    this.trailGroup.visible = visible;
    for (const particle of this.particles) {
      // Marks on screens/panels stay visible; only in-flight paths can be hidden
      if (!particle.userData.isMark) {
        particle.visible = visible;
        if (particle.userData.trail) {
          particle.userData.trail.visible = visible;
        }
      }
    }
  }

  private attachTrail(particle: Particle, color: THREE.ColorRepresentation) {
    const positions = new Float32Array(6);
    positions[0] = particle.position.x;
    positions[1] = particle.position.y;
    positions[2] = particle.position.z;
    positions[3] = particle.position.x;
    positions[4] = particle.position.y;
    positions[5] = particle.position.z;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    const trail = new THREE.Line(geometry, material);
    trail.visible = this.pathsVisible;
    trail.renderOrder = 1;
    this.trailGroup.add(trail);
    particle.userData.trail = trail;
  }

  updateTrails() {
    for (const particle of this.particles) {
      const trail = particle.userData.trail;
      if (!trail || particle.userData.isMark) continue;
      const pos = trail.geometry.getAttribute('position') as THREE.BufferAttribute;
      // Keep start fixed; end follows the particle
      pos.setXYZ(1, particle.position.x, particle.position.y, particle.position.z);
      pos.needsUpdate = true;
    }
  }

  createSingleProton() {
    // Protons are drawn larger than electrons to suggest their much greater mass
    const geometry = new THREE.SphereGeometry(0.1, 12, 8);
    // HDR color (values > 1) so the bloom pass makes particles glow
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xff5533).multiplyScalar(2.5),
      transparent: false
    });

    const proton = new THREE.Mesh(geometry, material);
    const spawnZ = EMITTER_WORLD_Z + Math.random() * 0.08;
    proton.position.set(
      (Math.random() - 0.5) * 4.5,
      (Math.random() - 0.5) * 4.0,
      spawnZ
    );

    proton.userData = {
      velocity: {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: 0.5 + Math.random() * 0.1
      },
      isMark: false
    };

    proton.visible = this.pathsVisible;
    this.attachTrail(proton as unknown as Particle, 0xff6644);
    this.scene.add(proton);
    this.particles.push(proton as unknown as Particle);
    return proton as unknown as Particle;
  }

  createSingleElectron(options?: { forceSlit?: -1 | 1 }) {
    // Electrons are drawn smaller than protons to suggest their much smaller mass
    const geometry = new THREE.SphereGeometry(0.05, 12, 8);
    // HDR color (values > 1) so the bloom pass makes particles glow
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x3388ff).multiplyScalar(2.5),
      transparent: false
    });

    const electron = new THREE.Mesh(geometry, material);
    const spawnZ = EMITTER_WORLD_Z + Math.random() * 0.08;
    const slitChoice: -1 | 1 = options?.forceSlit ?? (Math.random() < 0.5 ? -1 : 1);
    electron.position.set(
      (Math.random() - 0.5) * 4.5,
      (Math.random() - 0.5) * 4.0,
      spawnZ
    );

    electron.userData = {
      velocity: {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: 0.5 + Math.random() * 0.1
      },
      isMark: false,
      slitChoice
    };

    electron.visible = this.pathsVisible;
    this.attachTrail(electron as unknown as Particle, 0x66aaff);
    this.scene.add(electron);
    this.particles.push(electron as unknown as Particle);
    return electron as unknown as Particle;
  }

  createInitialProtons(count: number = 50) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.createSingleProton();
    }
  }

  createInitialElectrons(count: number = 50) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.createSingleElectron();
    }
  }

  removeParticle(particle: Particle) {
    if (particle.userData.trail) {
      this.trailGroup.remove(particle.userData.trail);
      particle.userData.trail.geometry.dispose();
      if (particle.userData.trail.material instanceof THREE.Material) {
        particle.userData.trail.material.dispose();
      }
      particle.userData.trail = undefined;
    }
    this.scene.remove(particle);
    particle.geometry.dispose();
    if (particle.material instanceof THREE.Material) {
      particle.material.dispose();
    }
  }

  clearAllParticles() {
    this.particles.forEach(particle => {
      this.removeParticle(particle);
    });
    this.particles = [];
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  setParticles(particles: Particle[]) {
    this.particles = particles;
  }

  getParticleCount(): number {
    return this.particles.length;
  }

  getActiveParticleCount(): number {
    return this.particles.filter(particle => !particle.userData.isMark).length;
  }
}
