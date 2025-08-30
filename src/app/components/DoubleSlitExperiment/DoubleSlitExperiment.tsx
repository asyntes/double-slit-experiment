'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './DoubleSlitExperiment.css';
import PhaseSelector from './components/PhaseSelector/PhaseSelector';
import TopBar from './components/TopBar/TopBar';


export default function DoubleSlitExperiment() {
  const [activePhase, setActivePhase] = useState('proton');
  const activePhaseRef = useRef('proton'); // Ref per accesso immediato nel loop
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const protonsRef = useRef<THREE.Mesh[]>([]);
  const detectionScreenRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const diffractionPanelRef = useRef<THREE.Group | null>(null);
  const labelsRef = useRef<THREE.Group[]>([]);


  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-19.165995152477358, 9.637643699188821, 5.055107657476825);
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
    createLabels(scene);
    
    console.log('Initial setup complete, activePhase:', activePhase);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(1.6695085561159786, -3.0874538457220844, 16.502079563322997);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.minDistance = 1;
    controls.maxDistance = 60;
    controlsRef.current = controls;

    // Adjust scene position and camera distance based on orientation
    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait) {
      // Check for low-height portrait devices (like iPhone SE)
      const isLowHeightDevice = window.innerHeight <= 667; // iPhone SE height threshold
      const sceneOffset = isLowHeightDevice ? 12 : 5; // Move scene up more for low-height devices

      // Move the entire scene upward
      scene.position.y += sceneOffset;

      // Set camera to max distance (60) for portrait mode
      const direction = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).add(direction.multiplyScalar(60));
      controls.update();
    }

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);

      // Reset scene position first
      sceneRef.current.position.y = 0;

      // Reapply scene positioning and camera distance for portrait mode
      const isPortrait = window.innerHeight > window.innerWidth;
      if (isPortrait) {
        // Check for low-height portrait devices (like iPhone SE)
        const isLowHeightDevice = window.innerHeight <= 667; // iPhone SE height threshold
        const sceneOffset = isLowHeightDevice ? 12 : 5; // Move scene up more for low-height devices

        // Move the entire scene upward
        sceneRef.current.position.y += sceneOffset;

        // Set camera to max distance (60) for portrait mode
        if (controlsRef.current) {
          const direction = cameraRef.current.position.clone().sub(controlsRef.current.target).normalize();
          cameraRef.current.position.copy(controlsRef.current.target).add(direction.multiplyScalar(60));
          controlsRef.current.update();
        }
      }
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

      // Cleanup labels
      labelsRef.current.forEach(labelGroup => {
        if (sceneRef.current) {
          sceneRef.current.remove(labelGroup);
        }
        labelGroup.children.forEach(child => {
          if (child instanceof THREE.Sprite && child.material.map) {
            child.material.map.dispose();
            child.material.dispose();
          }
        });
      });
      labelsRef.current = [];

      rendererRef.current?.dispose();
    };
  }, []);

  // Rimuovo updatePhaseVisualization dall'useEffect iniziale per testare

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

    const diffractionPanelGroup = new THREE.Group();
    const diffractionPanelMaterial = new THREE.MeshBasicMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    const topGeometry = new THREE.PlaneGeometry(20, 5.5);
    const topDiffractionPanel = new THREE.Mesh(topGeometry, diffractionPanelMaterial);
    topDiffractionPanel.position.set(0, 4.75, 15);
    topDiffractionPanel.rotation.y = Math.PI;
    diffractionPanelGroup.add(topDiffractionPanel);

    const bottomGeometry = new THREE.PlaneGeometry(20, 5.5);
    const bottomDiffractionPanel = new THREE.Mesh(bottomGeometry, diffractionPanelMaterial);
    bottomDiffractionPanel.position.set(0, -4.75, 15);
    bottomDiffractionPanel.rotation.y = Math.PI;
    diffractionPanelGroup.add(bottomDiffractionPanel);

    const leftGeometry = new THREE.PlaneGeometry(8.5, 4);
    const leftDiffractionPanel = new THREE.Mesh(leftGeometry, diffractionPanelMaterial);
    leftDiffractionPanel.position.set(-5.75, 0, 15);
    leftDiffractionPanel.rotation.y = Math.PI;
    diffractionPanelGroup.add(leftDiffractionPanel);

    const middleGeometry = new THREE.PlaneGeometry(1, 4);
    const middleDiffractionPanel = new THREE.Mesh(middleGeometry, diffractionPanelMaterial);
    middleDiffractionPanel.position.set(0, 0, 15);
    middleDiffractionPanel.rotation.y = Math.PI;
    diffractionPanelGroup.add(middleDiffractionPanel);

    const rightGeometry = new THREE.PlaneGeometry(8.5, 4);
    const rightDiffractionPanel = new THREE.Mesh(rightGeometry, diffractionPanelMaterial);
    rightDiffractionPanel.position.set(5.75, 0, 15);
    rightDiffractionPanel.rotation.y = Math.PI;
    diffractionPanelGroup.add(rightDiffractionPanel);

    scene.add(diffractionPanelGroup);
    diffractionPanelRef.current = diffractionPanelGroup;
  };

  const createLabels = (scene: THREE.Scene) => {
    // Particle Generator Label
    const particleGeneratorLabel = createTextLabel('Particle Generator');
    particleGeneratorLabel.position.set(0, 1.5, 0);
    particleGeneratorLabel.scale.setScalar(1);
    scene.add(particleGeneratorLabel);
    labelsRef.current.push(particleGeneratorLabel);

    // Diffraction Slit Label
    const diffractionSlitLabel = createTextLabel('Diffraction Slits');
    diffractionSlitLabel.position.set(0, 8.5, 15);
    diffractionSlitLabel.scale.setScalar(1);
    scene.add(diffractionSlitLabel);
    labelsRef.current.push(diffractionSlitLabel);

    // Detection Screen Label
    const detectionScreenLabel = createTextLabel('Detection Screen');
    detectionScreenLabel.position.set(0, 8.5, 30);
    detectionScreenLabel.scale.setScalar(1);
    scene.add(detectionScreenLabel);
    labelsRef.current.push(detectionScreenLabel);
  };

  const createTextLabel = (text: string): THREE.Group => {
    const labelGroup = new THREE.Group();

    // Create a simple text using canvas texture as fallback
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 128;

    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.font = 'bold 36px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const lines = text.split('\n');
    const lineHeight = 45;
    const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;

    lines.forEach((line, index) => {
      context.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(6, 1.5, 1);
    labelGroup.add(sprite);

    return labelGroup;
  };


  const createSingleProton = (scene: THREE.Scene) => {
    console.log('Creating single proton in phase:', activePhase);
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

    scene.add(proton);
    protonsRef.current.push(proton);
  };

  const createProtons = (scene: THREE.Scene) => {
    protonsRef.current = [];
    for (let i = 0; i < 50; i++) {
      createSingleProton(scene);
    }
    console.log('Created initial batch of 50 protons');
  };

  const createProtonsForPhase = (scene: THREE.Scene, phase: string) => {
    if (phase === 'proton') {
      console.log('Creating protons for proton phase');
      protonsRef.current = [];
      for (let i = 0; i < 50; i++) {
        createSingleProtonForPhase(scene, phase);
      }
      console.log('Created initial batch of 50 protons');
    }
    // Non crea nulla per lightwave
  };

  const createSingleProtonForPhase = (scene: THREE.Scene, phase: string) => {
    console.log('Creating single proton for phase:', phase);
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

    scene.add(proton);
    protonsRef.current.push(proton);
  };


  const removeProtonFromScene = (proton: THREE.Mesh) => {
    if (!sceneRef.current) return;

    sceneRef.current.remove(proton);

    if (proton instanceof THREE.Mesh) {
      proton.geometry.dispose();
      if (proton.material instanceof THREE.Material) {
        proton.material.dispose();
      }
    }
  };



  const handlePhaseChange = (phase: string) => {
    console.log('Phase changing to:', phase);
    setActivePhase(phase);
    activePhaseRef.current = phase; // Aggiorna immediatamente il ref

    if (phase === 'lightwave') {
      // Ferma tutto e pulisci lo schermo - non spara niente
      console.log('Switching to lightwave: clearing all protons');
      clearAllProtons();
      clearDetectionScreen();
    } else if (phase === 'proton') {
      // Ripulisci tutto e riparti da capo
      console.log('Switching to proton: clearing and restarting');
      clearAllProtons();
      clearDetectionScreen();
      // Crea i protoni iniziali solo per proton
      if (sceneRef.current) {
        createProtonsForPhase(sceneRef.current, phase);
      }
    }
  };

  const clearDetectionScreen = () => {
    if (!sceneRef.current) return;

    // Rimuovi tutti i protoni che sono diventati segni bianchi sullo schermo
    protonsRef.current = protonsRef.current.filter(proton => {
      if (proton.userData.isMark) {
        sceneRef.current!.remove(proton);
        proton.geometry.dispose();
        if (proton.material instanceof THREE.Material) {
          proton.material.dispose();
        }
        return false;
      }
      return true;
    });
  };

  const clearAllProtons = () => {
    if (!sceneRef.current) return;

    protonsRef.current.forEach(proton => {
      sceneRef.current!.remove(proton);
      proton.geometry.dispose();
      if (proton.material instanceof THREE.Material) {
        proton.material.dispose();
      }
    });
    protonsRef.current = [];
  };

  const updateExperiment = () => {
    if (!sceneRef.current) return;

    const time = Date.now() * 0.001;

    // Crea nuovi protoni solo nella fase proton - USA IL REF!
    const currentPhase = activePhaseRef.current;
    if (currentPhase === 'proton' && protonsRef.current.length < 120) {
      const protonsToAdd = Math.min(5, 120 - protonsRef.current.length);
      for (let i = 0; i < protonsToAdd; i++) {
        if (sceneRef.current) {
          createSingleProtonForPhase(sceneRef.current, currentPhase);
        }
      }
    }
    // In fase lightwave non si crea niente - DEBUG
    if (currentPhase === 'lightwave') {
      console.log('Light wave mode: not creating protons, current count:', protonsRef.current.length);
    }

    protonsRef.current = protonsRef.current.filter(proton => {
      proton.position.x += proton.userData.velocity.x;
      proton.position.y += proton.userData.velocity.y;
      proton.position.z += proton.userData.velocity.z;

      if (proton.position.z >= 15 && !((proton.position.x >= -1.5 && proton.position.x <= -0.5 && proton.position.y >= -2 && proton.position.y <= 2) || (proton.position.x >= 0.5 && proton.position.x <= 1.5 && proton.position.y >= -2 && proton.position.y <= 2))) {
        removeProtonFromScene(proton);
        return false;
      }

      if (detectionScreenRef.current && !proton.userData.isMark && proton.position.z >= 30 &&
        Math.abs(proton.position.x) <= 10 && Math.abs(proton.position.y) <= 7.5) {
        proton.position.z = 30;
        if (proton.material instanceof THREE.MeshBasicMaterial) {
          proton.material.color.setHex(0xffffff);
        }
        proton.userData.velocity.x = 0;
        proton.userData.velocity.y = 0;
        proton.userData.velocity.z = 0;
        proton.scale.setScalar(1.2);
        proton.userData.isMark = true;
        proton.userData.markTime = time;
      }


      if (proton.position.z > 35 || Math.abs(proton.position.x) > 15 || Math.abs(proton.position.y) > 15) {
        if (sceneRef.current) {
          sceneRef.current.remove(proton);
        }
        proton.geometry.dispose();
        if (proton.material instanceof THREE.Material) {
          proton.material.dispose();
        }
        return false;
      }

      return true;
    });



  };

  const updatePhaseVisualization = () => {
    if (!sceneRef.current) return;

    protonsRef.current.forEach(proton => {
      sceneRef.current!.remove(proton);
      if (proton instanceof THREE.Mesh) {
        proton.geometry.dispose();
        if (proton.material instanceof THREE.Material) {
          proton.material.dispose();
        }
      }
    });
    protonsRef.current = [];

    // Crea protoni solo nella fase proton
    if (activePhaseRef.current === 'proton') {
      createProtons(sceneRef.current);
    }
  };



  return (
    <div className="relative w-full h-screen bg-black overflow-hidden" style={{ fontFamily: 'Nimbus Sans, Arial, sans-serif' }}>
      <div ref={mountRef} className="w-full h-full" />

      <TopBar />

      <PhaseSelector activePhase={activePhase} onPhaseChange={handlePhaseChange} />

    </div>
  );
}