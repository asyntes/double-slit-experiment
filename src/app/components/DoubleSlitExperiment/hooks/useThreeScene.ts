import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createExperimentSetup } from '../components/ExperimentSetup';
import { createSceneLabels } from '../components/SceneLabels';
import { ParticleSystem } from '../components/ParticleSystem';

export const useThreeScene = () => {
  const [sceneReady, setSceneReady] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const detectionScreenRef = useRef<THREE.Mesh | null>(null);
  const diffractionPanelRef = useRef<THREE.Group | null>(null);
  const lightConeRef = useRef<THREE.Mesh | null>(null);
  const labelsRef = useRef<THREE.Group[]>([]);
  const particleSystemRef = useRef<ParticleSystem | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;
    console.log('Three.js scene created:', scene);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-19.165995152477358, 9.637643699188821, 5.055107657476825);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4444ff, 0.5, 20);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(1.6695085561159786, -3.0874538457220844, 16.502079563322997);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.minDistance = 1;
    controls.maxDistance = 60;
    controlsRef.current = controls;
    
    console.log('Three.js setup complete - Camera:', camera.position, 'Target:', controls.target);

    // Create experiment setup
    const { detectionScreen, diffractionPanelGroup, lightCone } = createExperimentSetup(scene);
    detectionScreenRef.current = detectionScreen;
    diffractionPanelRef.current = diffractionPanelGroup;
    lightConeRef.current = lightCone;

    // Create labels
    const labels = createSceneLabels(scene);
    labelsRef.current = labels;

    // Create particle system
    const particleSystem = new ParticleSystem(scene);
    particleSystemRef.current = particleSystem;
    
    // Create initial protons for proton phase
    particleSystem.createInitialProtons(50);

    console.log('Experiment setup complete, scene objects:', scene.children.length);
    console.log('Initial particles created:', particleSystem.getParticleCount());
    
    setSceneReady(true);

    return () => {
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  return {
    mountRef,
    sceneRef,
    rendererRef,
    cameraRef,
    controlsRef,
    detectionScreenRef,
    diffractionPanelRef,
    lightConeRef,
    labelsRef,
    particleSystemRef,
    sceneReady
  };
};