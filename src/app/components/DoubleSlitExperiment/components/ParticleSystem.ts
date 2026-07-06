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
    // Protons are drawn larger than electrons to suggest their much greater mass
    const geometry = new THREE.SphereGeometry(0.1, 12, 8);
    // HDR color (values > 1) so the bloom pass makes particles glow
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xff5533).multiplyScalar(2.5),
      transparent: false
    });

    const proton = new THREE.Mesh(geometry, material);
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
      isMark: false,
      markTime: 0
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
      isMark: false,
      markTime: 0
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

  // Keeps at most maxMarks stuck deposits, removing the oldest ones first
  limitMarks(maxMarks: number) {
    const marks = this.particles.filter(particle => particle.userData.isMark);
    if (marks.length <= maxMarks) {
      return;
    }
    marks.sort((a, b) => a.userData.markTime - b.userData.markTime);
    const toRemove = new Set(marks.slice(0, marks.length - maxMarks));
    this.particles = this.particles.filter(particle => {
      if (toRemove.has(particle)) {
        this.removeParticle(particle);
        return false;
      }
      return true;
    });
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

  getActiveParticleCount(): number {
    return this.particles.filter(particle => !particle.userData.isMark).length;
  }
}