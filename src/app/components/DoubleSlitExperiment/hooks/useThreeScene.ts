import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createExperimentSetup } from '../components/ExperimentSetup';
import { createSceneLabels } from '../components/SceneLabels';
import { ParticleSystem } from '../components/ParticleSystem';

const createObserver = (scene: THREE.Scene): THREE.Group => {
  const observerGroup = new THREE.Group();

  const sphereGeometry = new THREE.SphereGeometry(0.8, 16, 16);
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    emissive: 0x333333
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  observerGroup.add(sphere);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d')!;

  context.fillStyle = '#ffffff';
  context.font = 'bold 36px Arial';
  context.textAlign = 'center';
  context.fillText('Observer', canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(6, 1.5, 1);
  sprite.position.set(0, 1.2, 0);

  observerGroup.add(sprite);

  observerGroup.position.set(3, 0, 14);
  observerGroup.visible = true;

  scene.add(observerGroup);
  return observerGroup;
};

export const useThreeScene = () => {
  const [sceneReady, setSceneReady] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const detectionScreenRef = useRef<THREE.Mesh | null>(null);
  const detectionScreenOverlayRef = useRef<THREE.Mesh | null>(null);
  const diffractionPanelRef = useRef<THREE.Group | null>(null);
  const lightBeamRef = useRef<THREE.Mesh | null>(null);
  const leftTrapezoidRef = useRef<THREE.Mesh | null>(null);
  const rightTrapezoidRef = useRef<THREE.Mesh | null>(null);
  const labelsRef = useRef<THREE.Group[]>([]);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const observerRef = useRef<THREE.Group | null>(null);
  const defaultScreenMaterialRef = useRef<THREE.Material | null>(null);
  const stripeScreenMaterialRef = useRef<THREE.Material | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;
    console.log('Three.js scene created:', scene);

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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(1.6695085561159786, -3.0874538457220844, 16.502079563322997);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.minDistance = 1;
    controls.maxDistance = 60;
    controlsRef.current = controls;

    console.log('Three.js setup complete - Camera:', camera.position, 'Target:', controls.target);

    const { detectionScreen, detectionScreenOverlay, diffractionPanelGroup, lightBeam, leftTrapezoid, rightTrapezoid } = createExperimentSetup(scene);
    detectionScreenRef.current = detectionScreen;
    detectionScreenOverlayRef.current = detectionScreenOverlay;
    diffractionPanelRef.current = diffractionPanelGroup;
    lightBeamRef.current = lightBeam;
    leftTrapezoidRef.current = leftTrapezoid;
    rightTrapezoidRef.current = rightTrapezoid;

    const labels = createSceneLabels(scene);
    labelsRef.current = labels;

    const particleSystem = new ParticleSystem(scene);
    particleSystemRef.current = particleSystem;

    const observer = createObserver(scene);
    observerRef.current = observer;

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
    detectionScreenOverlayRef,
    diffractionPanelRef,
    lightBeamRef,
    leftTrapezoidRef,
    rightTrapezoidRef,
    labelsRef,
    particleSystemRef,
    observerRef,
    sceneReady
  };
};