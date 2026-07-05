import * as THREE from 'three';

const createGenerator = (scene: THREE.Scene) => {
  const generatorGroup = new THREE.Group();

  const bodyGeometry = new THREE.CylinderGeometry(3.5, 3.5, 12, 48);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8dde6,
    metalness: 0.85,
    roughness: 0.3
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  generatorGroup.add(body);

  // Reinforcement rings along the barrel
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b7484,
    metalness: 0.9,
    roughness: 0.35
  });
  [-4.5, -1.5, 1.5, 4.5].forEach(offset => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.55, 0.18, 16, 64), ringMaterial);
    ring.position.z = offset;
    ring.castShadow = true;
    generatorGroup.add(ring);
  });

  // Glowing emitter aperture on the muzzle
  const apertureGeometry = new THREE.CircleGeometry(1.2, 48);
  const apertureMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x77bbff).multiplyScalar(1.6)
  });
  const aperture = new THREE.Mesh(apertureGeometry, apertureMaterial);
  aperture.position.z = 6.01;
  generatorGroup.add(aperture);

  const apertureRimGeometry = new THREE.TorusGeometry(1.35, 0.12, 16, 48);
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

  // Detection screen back (background layer)
  const backGeometry = new THREE.PlaneGeometry(20, 15);
  const backMaterial = new THREE.MeshStandardMaterial({
    color: 0x30343c,
    metalness: 0.1,
    roughness: 0.85,
    side: THREE.DoubleSide
  });
  const detectionScreenBack = new THREE.Mesh(backGeometry, backMaterial);
  detectionScreenBack.position.set(0, 0, 30.1);
  detectionScreenBack.rotation.x = 0;
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

  const beamRadius = 2.5;
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
