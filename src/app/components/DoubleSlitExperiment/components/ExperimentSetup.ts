import * as THREE from 'three';

const EMITTER_APERTURE_RADIUS = 2.5;

export const createDetectionScreenBackMaterial = (): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({
    color: 0x30343c,
    metalness: 0.1,
    roughness: 0.85,
    side: THREE.DoubleSide
  });

// Rear assembly modelled after real accelerator ion sources: a tapered
// reducer, a ceramic high-voltage insulator stack, a bolted vacuum flange,
// an HV terminal dome and power cables running down to a supply cabinet.
const createGeneratorRearAssembly = (
  bodyMaterial: THREE.MeshStandardMaterial,
  ringMaterial: THREE.MeshStandardMaterial
): THREE.Group => {
  const rearGroup = new THREE.Group();

  const ceramicMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2ede2,
    metalness: 0.05,
    roughness: 0.35
  });
  const darkMetalMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a4150,
    metalness: 0.75,
    roughness: 0.4
  });
  const cableMaterial = new THREE.MeshStandardMaterial({
    color: 0x14161c,
    metalness: 0.2,
    roughness: 0.8
  });

  const addMesh = (mesh: THREE.Mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rearGroup.add(mesh);
    return mesh;
  };

  // Tapered reducer from the barrel down to the source chamber
  const reducer = addMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(3.5, 1.9, 2.2, 48), bodyMaterial)
  );
  reducer.rotation.x = Math.PI / 2;
  reducer.position.z = -7.1;

  const reducerRim = addMesh(
    new THREE.Mesh(new THREE.TorusGeometry(3.55, 0.15, 16, 64), ringMaterial)
  );
  reducerRim.position.z = -6.05;

  // High-voltage insulator: metal core with ceramic corrugation discs
  const insulatorCore = addMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 4.2, 32), darkMetalMaterial)
  );
  insulatorCore.rotation.x = Math.PI / 2;
  insulatorCore.position.z = -10.3;

  for (let i = 0; i < 7; i++) {
    const disc = addMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 0.28, 40), ceramicMaterial)
    );
    disc.rotation.x = Math.PI / 2;
    disc.position.z = -8.5 - i * 0.6;
  }

  // Bolted vacuum flange closing the insulator stack
  const flange = addMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(2.55, 2.55, 0.45, 48), ringMaterial)
  );
  flange.rotation.x = Math.PI / 2;
  flange.position.z = -12.75;

  const boltGeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.62, 12);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const bolt = addMesh(new THREE.Mesh(boltGeometry, darkMetalMaterial));
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, -12.75);
  }

  // Rounded high-voltage terminal dome (corona-free electrode)
  const dome = addMesh(
    new THREE.Mesh(
      new THREE.SphereGeometry(1.65, 40, 28, 0, Math.PI * 2, 0, Math.PI / 2),
      bodyMaterial
    )
  );
  dome.rotation.x = -Math.PI / 2;
  dome.position.z = -12.95;

  // Status light on the terminal, matching the emitter glow
  const statusLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 20, 16),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffaa33).multiplyScalar(1.5) })
  );
  statusLight.position.set(0, 1.35, -14.0);
  rearGroup.add(statusLight);

  // Power supply cabinet on the floor behind the machine
  const cabinet = addMesh(
    new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.6, 2.4), darkMetalMaterial)
  );
  cabinet.position.set(0, -5.3, -17.5);

  const cabinetPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.5),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0x77bbff).multiplyScalar(1.2) })
  );
  cabinetPanel.position.set(0, -3.7, -16.29);
  rearGroup.add(cabinetPanel);

  [-1.0, -0.4, 0.2].forEach((x, i) => {
    const led = new THREE.Mesh(
      new THREE.CircleGeometry(0.09, 16),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(i === 2 ? 0x33ff77 : 0xffaa33).multiplyScalar(1.4)
      })
    );
    led.position.set(x, -4.5, -16.29);
    rearGroup.add(led);
  });

  // Thick HV cables drooping from the terminal down into the cabinet
  const cablePaths: THREE.Vector3[][] = [
    [
      new THREE.Vector3(0.75, 0.4, -13.4),
      new THREE.Vector3(1.5, -1.6, -15.2),
      new THREE.Vector3(1.35, -4.6, -16.6),
      new THREE.Vector3(1.1, -5.6, -17.3)
    ],
    [
      new THREE.Vector3(-0.75, 0.4, -13.4),
      new THREE.Vector3(-1.5, -1.8, -15.4),
      new THREE.Vector3(-1.3, -4.9, -16.7),
      new THREE.Vector3(-1.0, -5.8, -17.3)
    ]
  ];
  cablePaths.forEach(points => {
    const curve = new THREE.CatmullRomCurve3(points);
    const cable = addMesh(
      new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.16, 12), cableMaterial)
    );
    cable.castShadow = true;
  });

  return rearGroup;
};

const createGenerator = (scene: THREE.Scene) => {
  const generatorGroup = new THREE.Group();

  const bodyGeometry = new THREE.CylinderGeometry(3.5, 3.5, 12, 48);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8dde6,
    metalness: 0.6,
    roughness: 0.5
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  generatorGroup.add(body);

  // Reinforcement rings along the barrel
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b7484,
    metalness: 0.65,
    roughness: 0.55
  });
  [-4.5, -1.5, 1.5, 4.5].forEach(offset => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.55, 0.18, 16, 64), ringMaterial);
    ring.position.z = offset;
    ring.castShadow = true;
    generatorGroup.add(ring);
  });

  generatorGroup.add(createGeneratorRearAssembly(bodyMaterial, ringMaterial));

  // Glowing emitter aperture on the muzzle — sized to match laser beam and particle spread
  const apertureGeometry = new THREE.CircleGeometry(EMITTER_APERTURE_RADIUS, 48);
  const apertureMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x77bbff).multiplyScalar(1.6)
  });
  const aperture = new THREE.Mesh(apertureGeometry, apertureMaterial);
  aperture.position.z = 6.01;
  generatorGroup.add(aperture);

  const apertureRimGeometry = new THREE.TorusGeometry(EMITTER_APERTURE_RADIUS + 0.15, 0.12, 16, 48);
  const apertureRim = new THREE.Mesh(apertureRimGeometry, ringMaterial);
  apertureRim.position.z = 6.0;
  generatorGroup.add(apertureRim);

  generatorGroup.position.set(0, 0, -5);
  scene.add(generatorGroup);
  return generatorGroup;
};

export const createExperimentSetup = (scene: THREE.Scene) => {
  createGenerator(scene);

  // Detection screen (main, front layer)
  const screenGeometry = new THREE.PlaneGeometry(20, 15);
  const screenMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0
  });
  const detectionScreen = new THREE.Mesh(screenGeometry, screenMaterial);
  detectionScreen.position.set(0, 0, 30);
  detectionScreen.rotation.x = 0;
  scene.add(detectionScreen);

  // Detection screen back (background layer) — thin box so it casts a full ground shadow
  const screenDepth = 0.12;
  const backGeometry = new THREE.BoxGeometry(20, 15, screenDepth);
  const backMaterial = createDetectionScreenBackMaterial();
  const detectionScreenBack = new THREE.Mesh(backGeometry, backMaterial);
  detectionScreenBack.position.set(0, 0, 30.1);
  detectionScreenBack.castShadow = true;
  detectionScreenBack.receiveShadow = true;
  scene.add(detectionScreenBack);

  // Metallic frame around the detection screen
  const screenFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x555e6e,
    metalness: 0.7,
    roughness: 0.55
  });
  const screenFrame = new THREE.Group();
  const frameThickness = 0.5;
  const frameDepth = 0.6;
  const horizontalBar = new THREE.BoxGeometry(20 + frameThickness * 2, frameThickness, frameDepth);
  const verticalBar = new THREE.BoxGeometry(frameThickness, 15, frameDepth);
  const framePieces: Array<[THREE.BoxGeometry, number, number]> = [
    [horizontalBar, 0, 7.5 + frameThickness / 2],
    [horizontalBar, 0, -7.5 - frameThickness / 2],
    [verticalBar, 10 + frameThickness / 2, 0],
    [verticalBar, -10 - frameThickness / 2, 0]
  ];
  framePieces.forEach(([geometry, x, y]) => {
    const bar = new THREE.Mesh(geometry, screenFrameMaterial);
    bar.position.set(x, y, 30.1);
    bar.castShadow = true;
    bar.receiveShadow = true;
    screenFrame.add(bar);
  });
  scene.add(screenFrame);

  const diffractionPanelGroup = new THREE.Group();
  const diffractionPanelMaterial = new THREE.MeshStandardMaterial({
    color: 0x7b828f,
    metalness: 0.65,
    roughness: 0.45,
    side: THREE.DoubleSide
  });
  const panelDepth = 0.35;

  const addPanel = (width: number, height: number, x: number, y: number) => {
    const geometry = new THREE.BoxGeometry(width, height, panelDepth);
    const panel = new THREE.Mesh(geometry, diffractionPanelMaterial);
    panel.position.set(x, y, 15);
    panel.castShadow = true;
    panel.receiveShadow = true;
    diffractionPanelGroup.add(panel);
    return panel;
  };

  addPanel(20, 5.5, 0, 4.75);
  addPanel(20, 5.5, 0, -4.75);
  addPanel(8.5, 4, -5.75, 0);
  addPanel(1, 4, 0, 0);
  addPanel(8.5, 4, 5.75, 0);

  // Emissive edging that outlines the two slits
  const slitEdgeMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x55aaff).multiplyScalar(1.4)
  });
  [-1, 1].forEach(slitCenterX => {
    const slitFrame = new THREE.Group();
    const edgeSize = 0.06;
    const verticalEdge = new THREE.BoxGeometry(edgeSize, 4, panelDepth + 0.02);
    const horizontalEdge = new THREE.BoxGeometry(1 + edgeSize * 2, edgeSize, panelDepth + 0.02);
    const edges: Array<[THREE.BoxGeometry, number, number]> = [
      [verticalEdge, -0.5 - edgeSize / 2, 0],
      [verticalEdge, 0.5 + edgeSize / 2, 0],
      [horizontalEdge, 0, 2 + edgeSize / 2],
      [horizontalEdge, 0, -2 - edgeSize / 2]
    ];
    edges.forEach(([geometry, x, y]) => {
      const edge = new THREE.Mesh(geometry, slitEdgeMaterial);
      edge.position.set(x, y, 0);
      slitFrame.add(edge);
    });
    slitFrame.position.set(slitCenterX, 0, 15);
    diffractionPanelGroup.add(slitFrame);
  });

  scene.add(diffractionPanelGroup);

  const beamRadius = EMITTER_APERTURE_RADIUS;
  const beamLength = 15;
  const beamGeometry = new THREE.CylinderGeometry(beamRadius, beamRadius, beamLength, 48, 1, true);
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0x33ff77,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const lightBeam = new THREE.Mesh(beamGeometry, beamMaterial);

  lightBeam.position.set(0, 0, beamLength / 2);
  lightBeam.rotation.x = Math.PI / 2;
  lightBeam.visible = false;
  lightBeam.renderOrder = 1;
  scene.add(lightBeam);

  const createTrapezoidGeometry = (
    baseWidth: number,
    topWidth: number,
    height: number,
    depth: number
  ): THREE.BufferGeometry => {
    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array([
      // Front face
      -baseWidth / 2, -height / 2, 0,  // bottom left (small)
      baseWidth / 2, -height / 2, 0,  // bottom right (small)
      baseWidth / 2, height / 2, 0,  // top right (small)
      -baseWidth / 2, height / 2, 0,  // top left (small)

      // Back face
      -topWidth / 2, -height / 2, depth,  // bottom left (large)
      topWidth / 2, -height / 2, depth,  // bottom right (large)
      topWidth / 2, height / 2, depth,  // top right (large)
      -topWidth / 2, height / 2, depth,  // top left (large)
    ]);

    const indices = new Uint16Array([
      0, 1, 2, 0, 2, 3,
      4, 7, 6, 4, 6, 5,
      0, 3, 7, 0, 7, 4,
      1, 5, 6, 1, 6, 2,
      3, 2, 6, 3, 6, 7,
      0, 4, 5, 0, 5, 1
    ]);

    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    return geometry;
  };

  const trapezoidMaterial = new THREE.MeshBasicMaterial({
    color: 0x33ff77,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const leftTrapezoidGeometry = createTrapezoidGeometry(1, 8, 4, 15);
  const leftTrapezoid = new THREE.Mesh(leftTrapezoidGeometry, trapezoidMaterial);
  leftTrapezoid.position.set(-1, 0, 15);
  leftTrapezoid.visible = false;
  leftTrapezoid.renderOrder = 1;
  scene.add(leftTrapezoid);

  const rightTrapezoidGeometry = createTrapezoidGeometry(1, 8, 4, 15);
  const rightTrapezoid = new THREE.Mesh(rightTrapezoidGeometry, trapezoidMaterial);
  rightTrapezoid.position.set(1, 0, 15);
  rightTrapezoid.visible = false;
  rightTrapezoid.renderOrder = 1;
  scene.add(rightTrapezoid);

  return { detectionScreen, detectionScreenBack, diffractionPanelGroup, lightBeam, leftTrapezoid, rightTrapezoid };
};
