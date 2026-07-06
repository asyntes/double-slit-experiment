import * as THREE from 'three';

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

  private static readonly protonGeometry = new THREE.SphereGeometry(0.1, 12, 8);
  private static readonly protonMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xff5533).multiplyScalar(2.5),
    transparent: false
  });
  private static readonly electronGeometry = new THREE.SphereGeometry(0.05, 12, 8);
  private static readonly electronMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x3388ff).multiplyScalar(2.5),
    transparent: false
  });

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  createSingleProton() {
    const proton = new THREE.Mesh(ParticleSystem.protonGeometry, ParticleSystem.protonMaterial);
    proton.position.set(
      (Math.random() - 0.5) * 4.5,
      (Math.random() - 0.5) * 4.0,
      0.5
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
    const electron = new THREE.Mesh(ParticleSystem.electronGeometry, ParticleSystem.electronMaterial);
    electron.position.set(
      (Math.random() - 0.5) * 4.5,
      (Math.random() - 0.5) * 4.0,
      0.5
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