'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './DoubleSlitExperiment.css';
import PhaseSelector from './components/PhaseSelector/PhaseSelector';
import TopBar from './components/TopBar/TopBar';


export default function DoubleSlitExperiment() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Mesh[]>([]);
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
    createLabels(scene);

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
    sprite.scale.set(8, 2, 1);
    labelGroup.add(sprite);
    
    return labelGroup;
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

      <TopBar />

      <PhaseSelector />

    </div>
  );
}