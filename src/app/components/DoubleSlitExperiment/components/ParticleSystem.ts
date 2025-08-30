import * as THREE from 'three';

export interface Particle extends THREE.Mesh {
  userData: {
    velocity: {
      x: number;
      y: number;
      z: number;
    };
    isMark: boolean;
    markTime: number;
  };
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  createSingleProton() {
    const geometry = new THREE.SphereGeometry(0.05, 8, 6);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: false
    });

    const proton = new THREE.Mesh(geometry, material);
    proton.position.set(
      (Math.random() - 0.5) * 1.0,
      (Math.random() - 0.5) * 1.0,
      0.5
    );

    proton.userData = {
      velocity: {
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: 0.5 + Math.random() * 0.3
      },
      isMark: false,
      markTime: 0
    };

    this.scene.add(proton);
    this.particles.push(proton as unknown as Particle);
    return proton as unknown as Particle;
  }

  createInitialProtons(count: number = 50) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.createSingleProton();
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

  clearDetectionMarks() {
    this.particles = this.particles.filter(particle => {
      if (particle.userData.isMark) {
        this.removeParticle(particle);
        return false;
      }
      return true;
    });
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
}