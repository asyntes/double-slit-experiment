'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type ExperimentPhase = 'particle' | 'wave' | 'quantum' | 'observer';

interface PhaseConfig {
  title: string;
  description: string;
}

const PHASE_CONFIGS: Record<ExperimentPhase, PhaseConfig> = {
  particle: {
    title: 'Particella Classica',
    description: 'Le particelle vengono inviate attraverso due fenditure. Passano attraverso una fenditura o l\'altra.'
  },
  wave: {
    title: 'Onda',
    description: 'Le onde passano attraverso entrambe le fenditure simultaneamente e interferiscono tra loro.'
  },
  quantum: {
    title: 'Oggetto Quantistico',
    description: 'Gli oggetti quantistici mostrano pattern di interferenza ondulatoria.'
  },
  observer: {
    title: 'Aggiungi Osservatore',
    description: 'Quando osservate, la funzione d\'onda collassa nel comportamento particellare.'
  }
};

export default function DoubleSlitExperiment() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Mesh[]>([]);
  const waveGroupRef = useRef<THREE.Group | null>(null);
  const detectionScreenRef = useRef<THREE.Mesh | null>(null);
  const hitPointsRef = useRef<THREE.Vector2[]>([]);

  const [currentPhase, setCurrentPhase] = useState<ExperimentPhase>('particle');
  const [particleCount, setParticleCount] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup - optimal view for continuous particle flow
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-2, 2, 5);
    camera.lookAt(1, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4444ff, 0.5, 20);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Create the experiment apparatus
    createExperimentSetup(scene);

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Start animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      updateExperiment();
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    updatePhaseVisualization();
  }, [currentPhase]);

  const createExperimentSetup = (scene: THREE.Scene) => {
    // Create the barrier with double slits - make it more visible
    const barrierGeometry = new THREE.BoxGeometry(0.3, 8, 0.2);
    const barrierMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.9
    });

    // Top part of barrier
    const topBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    topBarrier.position.set(0, 3, 0);
    topBarrier.scale.y = 0.5;
    scene.add(topBarrier);

    // Bottom part of barrier
    const bottomBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    bottomBarrier.position.set(0, -3, 0);
    bottomBarrier.scale.y = 0.5;
    scene.add(bottomBarrier);

    // Middle barriers (creating the slits) - make them more visible
    const slitBarrier1 = new THREE.Mesh(barrierGeometry, barrierMaterial);
    slitBarrier1.position.set(0, 0.75, 0);
    slitBarrier1.scale.y = 0.25;
    scene.add(slitBarrier1);

    const slitBarrier2 = new THREE.Mesh(barrierGeometry, barrierMaterial);
    slitBarrier2.position.set(0, -0.75, 0);
    slitBarrier2.scale.y = 0.25;
    scene.add(slitBarrier2);

    // Create slit openings - make them clearly visible
    const slitGeometry = new THREE.PlaneGeometry(0.4, 1.5);
    const slitMaterial = new THREE.MeshBasicMaterial({
      color: 0x001122,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    const upperSlit = new THREE.Mesh(slitGeometry, slitMaterial);
    upperSlit.position.set(0, 1.25, 0.1);
    scene.add(upperSlit);

    const lowerSlit = new THREE.Mesh(slitGeometry, slitMaterial);
    lowerSlit.position.set(0, -1.25, 0.1);
    scene.add(lowerSlit);

    // Create the detection screen - make it more visible
    const screenGeometry = new THREE.PlaneGeometry(0.2, 8);
    const screenMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 0.8,
      emissive: 0x001100
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(8, 0, 0);
    scene.add(screen);

    // Create particle source indicator - make it more prominent
    const sourceGeometry = new THREE.SphereGeometry(0.3);
    const sourceMaterial = new THREE.MeshPhongMaterial({
      color: 0xff3333,
      emissive: 0x330000
    });
    const source = new THREE.Mesh(sourceGeometry, sourceMaterial);
    source.position.set(-8, 0, 0);
    scene.add(source);

    // Add visual guides and labels
    createVisualGuides(scene);
  };

  const createVisualGuides = (scene: THREE.Scene) => {
    // Arrow showing particle direction
    const arrowGeometry = new THREE.ConeGeometry(0.15, 0.4);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(-6, 0, 0);
    arrow.rotation.z = Math.PI / 2;
    scene.add(arrow);

    // Light beam effect
    const beamGeometry = new THREE.CylinderGeometry(0.03, 0.03, 8);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x4444ff,
      transparent: true,
      opacity: 0.3
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.set(-4, 0, 0);
    beam.rotation.z = Math.PI / 2;
    scene.add(beam);

    // Slit labels
    const labelGeometry = new THREE.PlaneGeometry(0.8, 0.3);
    const upperLabelMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    const lowerLabelMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });

    // Note: In a real implementation, you'd use TextGeometry or a texture with text
    // For now, we'll use colored indicators
    const upperIndicator = new THREE.Mesh(
      new THREE.SphereGeometry(0.1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    upperIndicator.position.set(0, 1.8, 0.2);
    scene.add(upperIndicator);

    const lowerIndicator = new THREE.Mesh(
      new THREE.SphereGeometry(0.1),
      new THREE.MeshBasicMaterial({ color: 0x0000ff })
    );
    lowerIndicator.position.set(0, -1.8, 0.2);
    scene.add(lowerIndicator);
  };

  const createSingleParticle = (scene: THREE.Scene) => {
    // Make particles BIGGER and more visible
    const geometry = new THREE.SphereGeometry(0.4, 8, 6); // Increased from 0.2 to 0.4
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: false
    });

    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(-12, (Math.random() - 0.5) * 8, 0);

    // Simple data - just slit assignment
    particle.userData = {
      slitAssigned: Math.random() > 0.5 ? 'upper' : 'lower',
      hasPassedSlit: false,
      hasBeenDetected: false
    };

    console.log('Created BIG particle at:', particle.position.x, particle.position.y);
    scene.add(particle);
    particlesRef.current.push(particle);
  };

  const createParticles = (scene: THREE.Scene) => {
    // Start with MORE particles for immediate visibility
    particlesRef.current = [];
    for (let i = 0; i < 50; i++) { // Increased from 20 to 50
      createSingleParticle(scene);
    }
    console.log('Created initial batch of 50 particles');
  };

  const removeParticleFromScene = (particle: THREE.Mesh) => {
    if (!sceneRef.current) return;

    // Dispose trail particles properly
    if (particle.userData.trailGroup) {
      while (particle.userData.trailGroup.children.length > 0) {
        const trailParticle = particle.userData.trailGroup.children[0];
        particle.userData.trailGroup.remove(trailParticle);
        if (trailParticle instanceof THREE.Mesh) {
          trailParticle.geometry.dispose();
          if (trailParticle.material instanceof THREE.Material) {
            trailParticle.material.dispose();
          }
        }
      }
      sceneRef.current.remove(particle.userData.trailGroup);
    }

    // Remove particle from scene
    sceneRef.current.remove(particle);

    // Dispose particle geometry and material
    if (particle instanceof THREE.Mesh) {
      particle.geometry.dispose();
      if (particle.material instanceof THREE.Material) {
        particle.material.dispose();
      }
    }
  };

  const createWaves = (scene: THREE.Scene) => {
    const waveGroup = new THREE.Group();

    // Create clear striped interference pattern - simple horizontal lines
    for (let i = 0; i < 30; i++) {
      const y = (i - 15) * 0.2; // Evenly spaced horizontal lines

      const points = [];
      for (let x = -10; x <= 10; x += 0.1) {
        let waveY = y;

        if (x > 0) {
          // After barrier - create clear interference stripes
          const distance1 = Math.abs(x - 0);
          const distance2 = Math.abs(x - 0);
          const phase1 = distance1 * 2;
          const phase2 = distance2 * 2;
          waveY += (Math.sin(phase1) + Math.sin(phase2)) * 0.3;
        }

        points.push(new THREE.Vector3(x, waveY, 0));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x00ffff, // Bright cyan for waves
        transparent: true,
        opacity: 0.8
      });

      const line = new THREE.Line(geometry, material);
      waveGroup.add(line);
    }

    scene.add(waveGroup);
    waveGroupRef.current = waveGroup;
  };


  const updateExperiment = () => {
    if (!sceneRef.current) return;

    const time = Date.now() * 0.001;

    // Add new particles continuously for dense stream - only for particle-based modes
    if ((currentPhase === 'particle' || currentPhase === 'quantum' || currentPhase === 'observer') &&
      particlesRef.current.length < 80) { // Maintain around 80 particles for good visibility
      const particlesToAdd = Math.min(3, 80 - particlesRef.current.length);
      for (let i = 0; i < particlesToAdd; i++) {
        if (sceneRef.current) {
          createSingleParticle(sceneRef.current);
        }
      }
      if (particlesToAdd > 0) {
        console.log(`Added ${particlesToAdd} new particles. Total: ${particlesRef.current.length}`);
      }
    }

    // Update particles - handle different modes
    particlesRef.current = particlesRef.current.filter(particle => {
      if (currentPhase === 'particle' || currentPhase === 'quantum' || currentPhase === 'observer') {
        // Move particle to the right - increased speed for better visibility
        particle.position.x += 0.8; // Increased from 0.6 to 0.8

        // Handle quantum clouds
        if (currentPhase === 'quantum' && particle.userData.quantumClouds) {
          particle.userData.quantumClouds.forEach((cloud: THREE.Mesh, index: number) => {
            // Make clouds fluctuate around the particle
            const time = Date.now() * 0.001;
            const baseX = particle.position.x;
            const baseY = particle.position.y;

            cloud.position.x = baseX + Math.sin(time * 2 + index) * 0.3;
            cloud.position.y = baseY + Math.cos(time * 1.5 + index) * 0.3;
            cloud.position.z = Math.sin(time * 3 + index) * 0.2;

            // Pulse effect
            const scale = 0.8 + Math.sin(time * 4 + index) * 0.4;
            cloud.scale.setScalar(scale);
          });
        }

        // At barrier (x = 0), deflect based on assigned slit
        if (particle.position.x >= -0.1 && particle.position.x <= 0.1 && !particle.userData.hasPassedSlit) {
          particle.userData.hasPassedSlit = true;

          if (particle.userData.slitAssigned === 'upper') {
            particle.position.y = 1.5; // Go to upper slit
            if (particle.material instanceof THREE.MeshBasicMaterial) {
              if (currentPhase === 'observer') {
                particle.material.color.setHex(0xff0000); // Red for observer mode
              } else if (currentPhase === 'quantum') {
                particle.material.color.setHex(0xff00ff); // Magenta for quantum
              } else {
                particle.material.color.setHex(0xff0000); // Red for particle
              }
            }
          } else {
            particle.position.y = -1.5; // Go to lower slit
            if (particle.material instanceof THREE.MeshBasicMaterial) {
              if (currentPhase === 'observer') {
                particle.material.color.setHex(0x0000ff); // Blue for observer mode
              } else if (currentPhase === 'quantum') {
                particle.material.color.setHex(0xff00ff); // Magenta for quantum
              } else {
                particle.material.color.setHex(0x0000ff); // Blue for particle
              }
            }
          }
        }

        // Continue moving after slit
        if (particle.userData.hasPassedSlit) {
          particle.position.x += 0.8; // Match the main speed
        }

        // Check if particle hits detection screen (at x = 6 for better visibility)
        if (particle.position.x >= 5.9 && particle.position.x <= 6.1 && !particle.userData.hasBeenDetected) {
          particle.userData.hasBeenDetected = true;
          setParticleCount(prev => {
            console.log('Particle detected! New count:', prev + 1);
            return prev + 1;
          });

          // Visual hit effect - make it more visible
          const hitEffect = new THREE.Mesh(
            new THREE.SphereGeometry(0.15),
            new THREE.MeshBasicMaterial({
              color: 0xffff00,
              transparent: true,
              opacity: 1.0
            })
          );
          hitEffect.position.copy(particle.position);
          if (sceneRef.current) {
            sceneRef.current.add(hitEffect);
            setTimeout(() => {
              if (sceneRef.current) {
                sceneRef.current.remove(hitEffect);
              }
              hitEffect.geometry.dispose();
              hitEffect.material.dispose();
            }, 500);
          }
        }
      }

      // Remove if off screen
      if (particle.position.x > 10 || Math.abs(particle.position.y) > 8) {
        if (sceneRef.current) {
          sceneRef.current.remove(particle);

          // Remove quantum clouds too
          if (particle.userData.quantumClouds) {
            particle.userData.quantumClouds.forEach((cloud: THREE.Mesh) => {
              sceneRef.current!.remove(cloud);
              cloud.geometry.dispose();
              if (cloud.material instanceof THREE.Material) {
                cloud.material.dispose();
              }
            });
          }
        }
        particle.geometry.dispose();
        if (particle.material instanceof THREE.Material) {
          particle.material.dispose();
        }
        return false;
      }

      return true;
    });

    // Update waves
    if (waveGroupRef.current) {
      waveGroupRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Line) {
          const positions = child.geometry.attributes.position;
          const baseY = (index - 20) * 0.08;

          for (let i = 0; i < positions.count; i++) {
            const x = positions.array[i * 3];
            let y = baseY;

            if (x < 0) {
              // Before barrier - propagating wave
              y += Math.sin(x * 0.15 + time * 2 + index * 0.05) * 0.4 * Math.exp(x * 0.05);
            } else {
              // After barrier - interference pattern
              const d1 = Math.sqrt((x - 0) ** 2 + (baseY - 1.25) ** 2);
              const d2 = Math.sqrt((x - 0) ** 2 + (baseY - (-1.25)) ** 2);
              const phase1 = d1 * 0.8 - time * 2.5;
              const phase2 = d2 * 0.8 - time * 2.5;
              y += (Math.sin(phase1) + Math.sin(phase2)) * 0.35 * Math.exp(-x * 0.08);
            }

            positions.array[i * 3 + 1] = y;
            // Add some z-movement for 3D effect
            positions.array[i * 3 + 2] = Math.sin(x * 0.1 + time + index * 0.1) * 0.05;
          }
          positions.needsUpdate = true;

          // Update line material for dynamic effect
          if (child.material instanceof THREE.LineBasicMaterial) {
            child.material.opacity = 0.3 + Math.sin(time * 2 + index * 0.1) * 0.2;
          }
        } else if (child instanceof THREE.Mesh && child.userData.phase !== undefined) {
          // Update wave particles
          const phase = child.userData.phase;
          const amplitude = child.userData.amplitude;
          const baseX = child.position.x;
          const baseY = child.position.y;

          child.position.x = baseX + Math.sin(time * 3 + phase) * 0.1;
          child.position.y = baseY + Math.cos(time * 2 + phase) * amplitude * 0.5;
          child.position.z = Math.sin(time * 4 + phase) * 0.2;

          // Pulse effect
          const scale = 0.8 + Math.sin(time * 5 + phase) * 0.3;
          child.scale.setScalar(scale);

          if (child.material instanceof THREE.MeshBasicMaterial) {
            child.material.opacity = 0.4 + Math.sin(time * 3 + phase) * 0.3;
          }
        }

        return true; // Keep particle in array
      });
    }

    // Update quantum superposition effects
    if (currentPhase === 'quantum' && waveGroupRef.current) {
      const quantumGroup = (waveGroupRef.current as THREE.Group).userData?.quantumGroup;
      if (quantumGroup) {
        quantumGroup.children.forEach((child: THREE.Object3D, index: number) => {
          if (child instanceof THREE.Mesh && child.userData.phase !== undefined) {
            // Animate probability clouds
            const phase = child.userData.phase;
            const amplitude = child.userData.amplitude;

            child.position.y += Math.sin(time * 2 + phase) * 0.01;
            child.position.z += Math.cos(time * 1.5 + phase) * 0.008;

            const scale = 0.8 + Math.sin(time * 3 + phase) * 0.4;
            child.scale.setScalar(scale * amplitude);

            if (child.material instanceof THREE.MeshBasicMaterial) {
              child.material.opacity = 0.15 + Math.sin(time * 4 + phase) * 0.2;
            }
          } else if (child instanceof THREE.Line) {
            // Animate quantum field lines
            const positions = child.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
              const x = positions.array[i * 3];
              const baseY = positions.array[i * 3 + 1];
              const baseZ = positions.array[i * 3 + 2];

              positions.array[i * 3 + 1] = baseY + Math.sin(x * 0.2 + time * 2 + index * 0.1) * 0.1;
              positions.array[i * 3 + 2] = baseZ + Math.cos(x * 0.15 + time * 1.8 + index * 0.15) * 0.08;
            }
            positions.needsUpdate = true;
          }
        });
      }
    }

    // Update observer effect - dramatic pattern change
    if (currentPhase === 'observer') {
      // Find observer in scene
      sceneRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh &&
          child.geometry instanceof THREE.BoxGeometry &&
          child.userData.lastToggle !== undefined) {

          const now = Date.now();
          const timeSinceToggle = now - child.userData.lastToggle;

          // Toggle observer visibility every 2 seconds
          if (timeSinceToggle > 2000) {
            child.userData.isVisible = !child.userData.isVisible;
            child.userData.lastToggle = now;

            if (child.material instanceof THREE.MeshBasicMaterial) {
              child.material.opacity = child.userData.isVisible ? 1.0 : 0.1;
            }

            // When observer disappears, particles behave randomly (quantum-like)
            // When observer appears, particles follow assigned slits (classical)
            if (!child.userData.isVisible) {
              // Observer gone - random behavior
              particlesRef.current.forEach(particle => {
                if (particle.userData.observerMode) {
                  // Random deflection for quantum-like behavior
                  particle.userData.slitAssigned = Math.random() > 0.5 ? 'upper' : 'lower';
                  if (particle.material instanceof THREE.MeshBasicMaterial) {
                    particle.material.color.setHex(0x888888); // Gray for unobserved
                  }
                }
              });
            }
          }

          // Rotate observer for visual effect
          child.rotation.y += 0.02;
        }
      });
    }
  };

  const updatePhaseVisualization = () => {
    if (!sceneRef.current) return;

    // Clear previous visualizations
    particlesRef.current.forEach(particle => {
      // Clean up trail groups with proper disposal
      if (particle.userData.trailGroup) {
        while (particle.userData.trailGroup.children.length > 0) {
          const trailParticle = particle.userData.trailGroup.children[0];
          particle.userData.trailGroup.remove(trailParticle);
          if (trailParticle instanceof THREE.Mesh) {
            trailParticle.geometry.dispose();
            if (trailParticle.material instanceof THREE.Material) {
              trailParticle.material.dispose();
            }
          }
        }
        sceneRef.current!.remove(particle.userData.trailGroup);
      }
      sceneRef.current!.remove(particle);
      // Dispose particle geometry and material
      if (particle instanceof THREE.Mesh) {
        particle.geometry.dispose();
        if (particle.material instanceof THREE.Material) {
          particle.material.dispose();
        }
      }
    });
    particlesRef.current = [];

    if (waveGroupRef.current) {
      // Clean up quantum group if it exists
      const quantumGroup = (waveGroupRef.current as THREE.Group).userData?.quantumGroup;
      if (quantumGroup) {
        sceneRef.current.remove(quantumGroup);
      }
      sceneRef.current.remove(waveGroupRef.current);
      waveGroupRef.current = null;
    }

    // Create visualization based on current phase
    switch (currentPhase) {
      case 'particle':
        createParticles(sceneRef.current);
        break;
      case 'wave':
        createWaves(sceneRef.current);
        break;
      case 'quantum':
        // Create quantum particles with visible probability clouds
        for (let i = 0; i < 15; i++) {
          // Main particle
          const particleGeometry = new THREE.SphereGeometry(0.15, 8, 6);
          const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff, // Bright magenta for quantum
            transparent: true,
            opacity: 0.9
          });

          const particle = new THREE.Mesh(particleGeometry, particleMaterial);
          particle.position.set(-12, (Math.random() - 0.5) * 8, 0);
          particle.userData = {
            slitAssigned: Math.random() > 0.5 ? 'upper' : 'lower',
            hasPassedSlit: false,
            hasBeenDetected: false,
            quantumClouds: []
          };

          // Add probability clouds around the particle
          for (let j = 0; j < 5; j++) {
            const cloudGeometry = new THREE.SphereGeometry(0.08, 6, 4);
            const cloudMaterial = new THREE.MeshBasicMaterial({
              color: 0x880088, // Darker magenta for clouds
              transparent: true,
              opacity: 0.4
            });

            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
              particle.position.x + (Math.random() - 0.5) * 0.5,
              particle.position.y + (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.3
            );

            particle.userData.quantumClouds.push(cloud);
            sceneRef.current.add(cloud);
          }

          sceneRef.current.add(particle);
          particlesRef.current.push(particle);
        }
        break;
      case 'observer':
        // Create observer that dramatically changes the pattern
        const observerGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const observerMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000, // Bright red for observer
          transparent: true,
          opacity: 1.0
        });
        const observer = new THREE.Mesh(observerGeometry, observerMaterial);
        observer.position.set(1, 0, 1);
        observer.userData = {
          isVisible: true,
          lastToggle: Date.now()
        };
        sceneRef.current.add(observer);

        // Create particles that change behavior based on observer
        for (let i = 0; i < 20; i++) {
          const particleGeometry = new THREE.SphereGeometry(0.2, 8, 6);
          const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: false
          });

          const particle = new THREE.Mesh(particleGeometry, particleMaterial);
          particle.position.set(-12, (Math.random() - 0.5) * 8, 0);
          particle.userData = {
            slitAssigned: Math.random() > 0.5 ? 'upper' : 'lower',
            hasPassedSlit: false,
            hasBeenDetected: false,
            observerMode: true
          };

          sceneRef.current.add(particle);
          particlesRef.current.push(particle);
        }
        break;
    }
  };

  const resetCounter = () => {
    setParticleCount(0);
    hitPointsRef.current.length = 0;
  };

  // Reset counter when phase changes
  useEffect(() => {
    resetCounter();
  }, [currentPhase]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
      {/* 3D Scene Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Info Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/95 to-transparent p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
            ESPERIMENTO DELLA DOPPIA FENDITURA
          </h1>
          <h2 className="text-lg md:text-xl font-semibold text-white text-center mb-1" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
            {PHASE_CONFIGS[currentPhase].title}
          </h2>
          <p className="text-sm md:text-base text-gray-400 text-center max-w-2xl mx-auto" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
            {PHASE_CONFIGS[currentPhase].description}
          </p>
          <div className="text-center mt-2">
            <span className="text-lg font-semibold text-white" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
              Particelle Rilevate: {particleCount}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Control Panel - Full Width */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/20">
        <div className="max-w-6xl mx-auto p-4">
          {/* Phase Selection Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {(Object.keys(PHASE_CONFIGS) as ExperimentPhase[]).map((phase) => (
              <button
                key={phase}
                onClick={() => setCurrentPhase(phase)}
                className={`px-4 py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 transform hover:scale-105 ${currentPhase === phase
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-black border border-white/30 text-white hover:bg-white/10'
                  }`}
                style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}
              >
                {phase === 'particle' ? 'PARTICELLA' :
                  phase === 'wave' ? 'ONDA' :
                    phase === 'quantum' ? 'QUANTISTICO' :
                      'OSSERVATORE'}
              </button>
            ))}
          </div>

          {/* Reset Counter Button */}
          <div className="flex justify-center">
            <button
              onClick={resetCounter}
              className="px-6 py-3 bg-black border border-white/30 text-white hover:bg-white/10 font-bold text-sm rounded-full transition-all duration-300 transform hover:scale-105"
              style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}
            >
              RESET CONTATORE
            </button>
          </div>
        </div>
      </div>

      {/* Side Instructions */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs hidden lg:block border border-white/20">
        <h3 className="font-bold text-white mb-3 text-center" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>GUIDA ESPERIMENTO</h3>
        <div className="space-y-3 text-sm" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
          <div>
            <div className="font-semibold text-white mb-1">PARTICELLA CLASSICA:</div>
            <div className="text-gray-300 text-xs">Ogni particella passa attraverso UNA sola fenditura</div>
          </div>
          <div>
            <div className="font-semibold text-white mb-1">ONDA:</div>
            <div className="text-gray-300 text-xs">Le onde si diffrangono attraverso ENTRAMBE le fenditure creando interferenza</div>
          </div>
          <div>
            <div className="font-semibold text-white mb-1">QUANTISTICO:</div>
            <div className="text-gray-300 text-xs">Le particelle mostrano comportamento ondulatorio duale</div>
          </div>
          <div>
            <div className="font-semibold text-white mb-1">OSSERVATORE:</div>
            <div className="text-gray-300 text-xs">L'osservazione fa collassare la funzione d'onda</div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="text-xs text-gray-400 text-center" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
            <strong>Consiglio:</strong> Osserva come cambia il pattern di interferenza
          </div>
        </div>
      </div>
    </div>
  );
}