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
  const barrierRef = useRef<THREE.Group | null>(null);


  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-3, 2, -8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4444ff, 0.5, 20);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    createExperimentSetup(scene);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controlsRef.current = controls;

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

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
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x222222
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, 0);
    scene.add(cube);

    const screenGeometry = new THREE.PlaneGeometry(20, 15);
    const screenMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const detectionScreen = new THREE.Mesh(screenGeometry, screenMaterial);
    detectionScreen.position.set(0, 0, 30);
    detectionScreen.rotation.x = 0;
    scene.add(detectionScreen);
    detectionScreenRef.current = detectionScreen;

    const barrierGroup = new THREE.Group();
    const barrierMaterial = new THREE.MeshBasicMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    const topGeometry = new THREE.PlaneGeometry(20, 5.5);
    const topBarrier = new THREE.Mesh(topGeometry, barrierMaterial);
    topBarrier.position.set(0, 4.75, 15);
    topBarrier.rotation.y = Math.PI;
    barrierGroup.add(topBarrier);

    const bottomGeometry = new THREE.PlaneGeometry(20, 5.5);
    const bottomBarrier = new THREE.Mesh(bottomGeometry, barrierMaterial);
    bottomBarrier.position.set(0, -4.75, 15);
    bottomBarrier.rotation.y = Math.PI;
    barrierGroup.add(bottomBarrier);

    const leftGeometry = new THREE.PlaneGeometry(8.5, 4);
    const leftBarrier = new THREE.Mesh(leftGeometry, barrierMaterial);
    leftBarrier.position.set(-5.75, 0, 15);
    leftBarrier.rotation.y = Math.PI;
    barrierGroup.add(leftBarrier);

    const middleGeometry = new THREE.PlaneGeometry(1, 4);
    const middleBarrier = new THREE.Mesh(middleGeometry, barrierMaterial);
    middleBarrier.position.set(0, 0, 15);
    middleBarrier.rotation.y = Math.PI;
    barrierGroup.add(middleBarrier);

    const rightGeometry = new THREE.PlaneGeometry(8.5, 4);
    const rightBarrier = new THREE.Mesh(rightGeometry, barrierMaterial);
    rightBarrier.position.set(5.75, 0, 15);
    rightBarrier.rotation.y = Math.PI;
    barrierGroup.add(rightBarrier);

    scene.add(barrierGroup);
    barrierRef.current = barrierGroup;
  };


  const createSingleParticle = (scene: THREE.Scene) => {
    const geometry = new THREE.SphereGeometry(0.05, 8, 6);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: false
    });

    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(
      (Math.random() - 0.5) * 1.0,
      (Math.random() - 0.5) * 1.0,
      0.5
    );

    particle.userData = {
      velocity: {
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: 0.5 + Math.random() * 0.3
      },
      isMark: false,
      markTime: 0
    };

    scene.add(particle);
    particlesRef.current.push(particle);
  };

  const createParticles = (scene: THREE.Scene) => {
    particlesRef.current = [];
    for (let i = 0; i < 50; i++) {
      createSingleParticle(scene);
    }
    console.log('Created initial batch of 50 particles');
  };

  const removeParticleFromScene = (particle: THREE.Mesh) => {
    if (!sceneRef.current) return;

    sceneRef.current.remove(particle);

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

    if (particlesRef.current.length < 120) {
      const particlesToAdd = Math.min(5, 120 - particlesRef.current.length);
      for (let i = 0; i < particlesToAdd; i++) {
        if (sceneRef.current) {
          createSingleParticle(sceneRef.current);
        }
      }
    }

    particlesRef.current = particlesRef.current.filter(particle => {
      particle.position.x += particle.userData.velocity.x;
      particle.position.y += particle.userData.velocity.y;
      particle.position.z += particle.userData.velocity.z;

      if (particle.position.z >= 15 && !((particle.position.x >= -1.5 && particle.position.x <= -0.5 && particle.position.y >= -2 && particle.position.y <= 2) || (particle.position.x >= 0.5 && particle.position.x <= 1.5 && particle.position.y >= -2 && particle.position.y <= 2))) {
        removeParticleFromScene(particle);
        return false;
      }

      if (detectionScreenRef.current && !particle.userData.isMark && particle.position.z >= 30 &&
        Math.abs(particle.position.x) <= 10 && Math.abs(particle.position.y) <= 7.5) {
        particle.position.z = 30;
        if (particle.material instanceof THREE.MeshBasicMaterial) {
          particle.material.color.setHex(0xffffff);
        }
        particle.userData.velocity.x = 0;
        particle.userData.velocity.y = 0;
        particle.userData.velocity.z = 0;
        particle.scale.setScalar(1.2);
        particle.userData.isMark = true;
        particle.userData.markTime = time;
      }

      if (particle.userData.isMark) {
        if (time - particle.userData.markTime > 3) {
          if (sceneRef.current) {
            sceneRef.current.remove(particle);
          }
          particle.geometry.dispose();
          if (particle.material instanceof THREE.Material) {
            particle.material.dispose();
          }
          return false;
        }
      }

      if (particle.position.z > 35 || Math.abs(particle.position.x) > 15 || Math.abs(particle.position.y) > 15) {
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

    particlesRef.current.forEach(particle => {
      sceneRef.current!.remove(particle);
      if (particle instanceof THREE.Mesh) {
        particle.geometry.dispose();
        if (particle.material instanceof THREE.Material) {
          particle.material.dispose();
        }
      }
    });
    particlesRef.current = [];

    createParticles(sceneRef.current);
  };



  return (
    <div className="relative w-full h-screen bg-black overflow-hidden" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
      <div ref={mountRef} className="w-full h-full" />

      <div className="phase-selector absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20" style={{ fontFamily: 'Nimbus Sans, system-ui, sans-serif' }}>
        <div className="phase-selector-controls">
          <button className="px-4 py-2 bg-white text-black rounded-md font-semibold text-sm transition-all duration-300 hover:bg-gray-200 uppercase">
            Particle
          </button>
          <button className="px-4 py-2 bg-black border border-white/30 text-white rounded-md font-semibold text-sm cursor-not-allowed opacity-50 uppercase" disabled>
            Wave
          </button>
          <button className="px-4 py-2 bg-black border border-white/30 text-white rounded-md font-semibold text-sm cursor-not-allowed opacity-50 uppercase" disabled>
            Quantum Object
          </button>
          <button className="px-4 py-2 bg-black border border-white/30 text-white rounded-md font-semibold text-sm cursor-not-allowed opacity-50 uppercase" disabled>
            Add an Observer
          </button>
        </div>
      </div>

    </div>
  );
}