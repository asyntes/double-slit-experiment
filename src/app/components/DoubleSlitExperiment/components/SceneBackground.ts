import * as THREE from 'three';

/** Half-extent of the floor grid in world X/Z — barrel tail aligns with this edge. */
export const SCENE_FLOOR_GRID_HALF = 140;
/** Camera pan limit on ±X and ±Z (half the floor grid). */
export const SCENE_FLOOR_PAN_HALF = SCENE_FLOOR_GRID_HALF / 2;
export const SCENE_FLOOR_Y = -7.6;

const createGradientDome = (): THREE.Mesh => {
  const geometry = new THREE.SphereGeometry(400, 32, 24);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTopColor: { value: new THREE.Color(0x060a14) },
      uHorizonColor: { value: new THREE.Color(0x0e1526) },
      uBottomColor: { value: new THREE.Color(0x04060c) }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTopColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uBottomColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        // Soft band around the horizon, fading toward zenith and nadir
        vec3 color = mix(uHorizonColor, uTopColor, smoothstep(0.0, 0.55, h));
        color = mix(uBottomColor, color, smoothstep(-0.35, 0.05, h));
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  const dome = new THREE.Mesh(geometry, material);
  // Rendered first so everything else draws on top without depth issues
  dome.renderOrder = -2;
  return dome;
};

const createStarField = (): THREE.Points => {
  const starCount = 700;
  const positions = new Float32Array(starCount * 3);
  const phases = new Float32Array(starCount);
  const sizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    // Random direction, kept above the horizon so stars never clash with the floor
    const theta = Math.random() * Math.PI * 2;
    const y = 0.06 + Math.random() * 0.94;
    const horizontal = Math.sqrt(1 - y * y);
    const radius = 240 + Math.random() * 130;

    positions[i * 3] = Math.cos(theta) * horizontal * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * horizontal * radius;

    phases[i] = Math.random() * Math.PI * 2;
    sizes[i] = 0.9 + Math.random() * 2.1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      attribute float aPhase;
      attribute float aSize;
      uniform float uTime;
      varying float vTwinkle;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vTwinkle = 0.6 + 0.4 * sin(uTime * 0.9 + aPhase);
        gl_PointSize = aSize * vTwinkle * (320.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vTwinkle;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float alpha = smoothstep(0.5, 0.0, d) * vTwinkle;
        gl_FragColor = vec4(vec3(0.72, 0.82, 1.0), alpha * 0.85);
      }
    `
  });

  const stars = new THREE.Points(geometry, material);
  stars.renderOrder = -1;
  stars.onBeforeRender = () => {
    material.uniforms.uTime.value = performance.now() / 1000;
  };
  return stars;
};

const createFloor = (): THREE.Group => {
  const floorGroup = new THREE.Group();
  const floorY = SCENE_FLOOR_Y;

  const floorGeometry = new THREE.CircleGeometry(150, 64);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x0c1018,
    metalness: 0.15,
    roughness: 0.9
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = floorY;
  floor.receiveShadow = true;
  floorGroup.add(floor);

  const grid = new THREE.GridHelper(SCENE_FLOOR_GRID_HALF * 2, 56, 0x4a5f8a, 0x2a3a5c);
  grid.position.y = floorY + 0.04;
  const gridMaterial = grid.material as THREE.LineBasicMaterial;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.45;
  gridMaterial.depthWrite = false;
  floorGroup.add(grid);

  return floorGroup;
};

export const createSceneBackground = (scene: THREE.Scene): THREE.Group => {
  const backgroundGroup = new THREE.Group();
  backgroundGroup.name = 'sceneBackground';

  backgroundGroup.add(createGradientDome());
  backgroundGroup.add(createStarField());
  backgroundGroup.add(createFloor());

  scene.add(backgroundGroup);
  return backgroundGroup;
};
