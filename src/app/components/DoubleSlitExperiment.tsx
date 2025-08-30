'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const EXPERIMENT_TITLE = 'Particella Classica';
const EXPERIMENT_DESCRIPTION = 'Le particelle vengono inviate attraverso due fenditure. Passano attraverso una fenditura o l\'altra.';

export default function DoubleSlitExperiment() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Mesh[]>([]);
  const detectionScreenRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const [particleCount, setParticleCount] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup - three-quarter view from behind and slightly above
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-3, 2, -8);
    camera.lookAt(0, 0, 0);
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

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controlsRef.current = controls;

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
      if (controlsRef.current) {
        controlsRef.current.update();
      }
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
  }, []);

  const createExperimentSetup = (scene: THREE.Scene) => {
    // Create the white cube particle generator
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x222222
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, 0);
    scene.add(cube);
  };


  const createSingleParticle = (scene: THREE.Scene) => {
    // Create red particles
    const geometry = new THREE.SphereGeometry(0.2, 8, 6);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: false
    });

    const particle = new THREE.Mesh(geometry, material);
    // Start from the cube position with slight random offset
    particle.position.set(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
      0.5
    );

    // Add random velocity for forward movement with spread
    particle.userData = {
      velocity: {
        x: (Math.random() - 0.5) * 0.2,
        y: (Math.random() - 0.5) * 0.2,
        z: 0.5 + Math.random() * 0.3
      }
    };

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



  const updateExperiment = () => {
    if (!sceneRef.current) return;

    const time = Date.now() * 0.001;

    // Add new particles continuously for dense stream
    if (particlesRef.current.length < 80) { // Maintain around 80 particles for good visibility
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

    // Update particles
    particlesRef.current = particlesRef.current.filter(particle => {
      // Move particle based on its velocity
      particle.position.x += particle.userData.velocity.x;
      particle.position.y += particle.userData.velocity.y;
      particle.position.z += particle.userData.velocity.z;

      // Remove if off screen (far from camera)
      if (particle.position.z > 20 || Math.abs(particle.position.x) > 15 || Math.abs(particle.position.y) > 15) {
        if (sceneRef.current) {
          sceneRef.current.remove(particle);
        }
        particle.geometry.dispose();
        if (particle.material instanceof THREE.Material) {
          particle.material.dispose();
        }
        return false;
      }

      return true;
    });



  };

  const updatePhaseVisualization = () => {
    if (!sceneRef.current) return;

    // Clear previous visualizations
    particlesRef.current.forEach(particle => {
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

    // Create particle visualization
    createParticles(sceneRef.current);
  };

  const resetCounter = () => {
    setParticleCount(0);
  };


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
            {EXPERIMENT_TITLE}
          </h2>
          <p className="text-sm md:text-base text-gray-400 text-center max-w-2xl mx-auto" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
            {EXPERIMENT_DESCRIPTION}
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
          <div className="flex justify-center mb-4">
            <button
              className="px-6 py-3 bg-white text-black rounded-lg font-semibold text-sm md:text-base shadow-lg"
              style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}
            >
              PARTICELLA
            </button>
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
          <div className="mt-3">
            <div className="text-gray-400 text-xs">
              <strong>Particelle rosse:</strong> Passano attraverso la fenditura superiore
            </div>
          </div>
          <div className="mt-2">
            <div className="text-gray-400 text-xs">
              <strong>Particelle blu:</strong> Passano attraverso la fenditura inferiore
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="text-xs text-gray-400 text-center" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
            <strong>Consiglio:</strong> Osserva il flusso continuo di particelle
          </div>
        </div>
      </div>
    </div>
  );
}