import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { createExperimentSetup } from '../components/ExperimentSetup';
import { createSceneBackground } from '../components/SceneBackground';
import { createSceneLabels } from '../components/SceneLabels';
import { ParticleSystem } from '../components/ParticleSystem';

const createObserver = (scene: THREE.Scene): THREE.Group => {
  const observerGroup = new THREE.Group();

  const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xc2c9d6,
    metalness: 0.8,
    roughness: 0.25,
    emissive: 0x1a2438,
    emissiveIntensity: 0.5
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.castShadow = true;
  observerGroup.add(sphere);

  // Glowing "lens" aimed at the slits so the observer reads as a sensor
  const eyeDirection = new THREE.Vector3(-3, 0, 1).normalize();
  const eyeGeometry = new THREE.CircleGeometry(0.3, 24);
  const eyeMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x66ffcc).multiplyScalar(2.2)
  });
  const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye.position.copy(eyeDirection.clone().multiplyScalar(0.82));
  eye.lookAt(eyeDirection.clone().multiplyScalar(5));
  observerGroup.add(eye);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext('2d')!;

  context.fillStyle = '#ffffff';
  context.font = 'bold 72px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  // Subtle halo only, so the label stays readable without glowing
  context.shadowColor = 'rgba(120, 200, 255, 0.35)';
  context.shadowBlur = 6;
  context.fillText('Observer', canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.9,
    color: 0xffffff,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(6, 1.5, 1);
  sprite.position.set(0, 1.2, 0);
  sprite.renderOrder = 2;

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
  const composerRef = useRef<EffectComposer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const detectionScreenRef = useRef<THREE.Mesh | null>(null);
  const detectionScreenBackRef = useRef<THREE.Mesh | null>(null);
  const diffractionPanelRef = useRef<THREE.Group | null>(null);
  const lightBeamRef = useRef<THREE.Mesh | null>(null);
  const leftTrapezoidRef = useRef<THREE.Mesh | null>(null);
  const rightTrapezoidRef = useRef<THREE.Mesh | null>(null);
  const labelsRef = useRef<THREE.Group[]>([]);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const observerRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    // Fallback color behind the gradient dome; fog matches the dome's horizon tone
    scene.background = new THREE.Color(0x060a14);
    scene.fog = new THREE.Fog(0x0d1424, 70, 190);
    sceneRef.current = scene;

    createSceneBackground(scene);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-19.165995152477358, 9.637643699188821, 5.055107657476825);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Image-based lighting so metallic PBR materials pick up soft reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.35;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0x8fa3c7, 0x1c2433, 0.5);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff2e0, 2.0);
    keyLight.position.set(-25, 30, 0);
    keyLight.target.position.set(0, 0, 15);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -45;
    keyLight.shadow.camera.right = 45;
    keyLight.shadow.camera.top = 45;
    keyLight.shadow.camera.bottom = -45;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 120;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);
    scene.add(keyLight.target);

    const rimLight = new THREE.DirectionalLight(0x5f7dff, 0.45);
    rimLight.position.set(22, 8, 42);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(0x4466ff, 22, 45, 2);
    accentLight.position.set(0, 3, 8);
    scene.add(accentLight);

    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.55,
      0.4,
      0.6
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    composerRef.current = composer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(1.6695085561159786, -3.0874538457220844, 16.502079563322997);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1;
    controls.maxDistance = 60;
    controlsRef.current = controls;

    const { detectionScreen, detectionScreenBack, diffractionPanelGroup, lightBeam, leftTrapezoid, rightTrapezoid } = createExperimentSetup(scene);
    detectionScreenRef.current = detectionScreen;
    detectionScreenBackRef.current = detectionScreenBack;
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

    setSceneReady(true);

    return () => {
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      composerRef.current?.dispose();
      rendererRef.current?.dispose();
    };
  }, []);

  return {
    mountRef,
    sceneRef,
    rendererRef,
    composerRef,
    cameraRef,
    controlsRef,
    detectionScreenRef,
    detectionScreenBackRef,
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
