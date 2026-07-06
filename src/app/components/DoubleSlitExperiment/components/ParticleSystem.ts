import * as THREE from 'three';
import { EMITTER_WORLD_Y, EMITTER_WORLD_Z } from './ExperimentSetup';

export interface Particle extends THREE.Mesh {
  userData: {
    velocity: {
      x: number;
      y: number;
      z: number;
    };
    isMark: boolean;
  };
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
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
      EMITTER_WORLD_Y + (Math.random() - 0.5) * 4.0,
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

    this.scene.add(proton);
    this.particles.push(proton as unknown as Particle);
    return proton as unknown as Particle;
  }

  createSingleElectron() {
    // Electrons are drawn smaller than protons to suggest their much smaller mass
    const geometry = new THREE.SphereGeometry(0.05, 12, 8);
    // HDR color (values > 1) so the bloom pass makes particles glow
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x3388ff).multiplyScalar(2.5),
      transparent: false
    });

    const electron = new THREE.Mesh(geometry, material);
    const spawnZ = EMITTER_WORLD_Z + Math.random() * 0.08;
    electron.position.set(
      (Math.random() - 0.5) * 4.5,
      EMITTER_WORLD_Y + (Math.random() - 0.5) * 4.0,
      spawnZ
    );

    electron.userData = {
      velocity: {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: 0.5 + Math.random() * 0.1
      },
      isMark: false
    };

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