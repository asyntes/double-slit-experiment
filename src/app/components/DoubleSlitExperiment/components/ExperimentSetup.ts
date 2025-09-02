import * as THREE from 'three';

export const createExperimentSetup = (scene: THREE.Scene) => {
  // Particle generator (cylinder)
  const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16);
  const cylinderMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x222222
  });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.set(0, 0, 0);
  cylinder.rotation.x = Math.PI / 2; // Rotate 90 degrees to point towards the slits
  scene.add(cylinder);

  // Detection screen
  const screenGeometry = new THREE.PlaneGeometry(20, 15);
  const screenMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    side: THREE.DoubleSide
  });
  const detectionScreen = new THREE.Mesh(screenGeometry, screenMaterial);
  detectionScreen.position.set(0, 0, 30);
  detectionScreen.rotation.x = 0;
  scene.add(detectionScreen);

  // Diffraction panel with slits
  const diffractionPanelGroup = new THREE.Group();
  const diffractionPanelMaterial = new THREE.MeshBasicMaterial({
    color: 0x666666,
    side: THREE.DoubleSide
  });

  // Top panel
  const topGeometry = new THREE.PlaneGeometry(20, 5.5);
  const topDiffractionPanel = new THREE.Mesh(topGeometry, diffractionPanelMaterial);
  topDiffractionPanel.position.set(0, 4.75, 15);
  topDiffractionPanel.rotation.y = Math.PI;
  diffractionPanelGroup.add(topDiffractionPanel);

  // Bottom panel
  const bottomGeometry = new THREE.PlaneGeometry(20, 5.5);
  const bottomDiffractionPanel = new THREE.Mesh(bottomGeometry, diffractionPanelMaterial);
  bottomDiffractionPanel.position.set(0, -4.75, 15);
  bottomDiffractionPanel.rotation.y = Math.PI;
  diffractionPanelGroup.add(bottomDiffractionPanel);

  // Left panel
  const leftGeometry = new THREE.PlaneGeometry(8.5, 4);
  const leftDiffractionPanel = new THREE.Mesh(leftGeometry, diffractionPanelMaterial);
  leftDiffractionPanel.position.set(-5.75, 0, 15);
  leftDiffractionPanel.rotation.y = Math.PI;
  diffractionPanelGroup.add(leftDiffractionPanel);

  // Middle panel (between slits)
  const middleGeometry = new THREE.PlaneGeometry(1, 4);
  const middleDiffractionPanel = new THREE.Mesh(middleGeometry, diffractionPanelMaterial);
  middleDiffractionPanel.position.set(0, 0, 15);
  middleDiffractionPanel.rotation.y = Math.PI;
  diffractionPanelGroup.add(middleDiffractionPanel);

  // Right panel
  const rightGeometry = new THREE.PlaneGeometry(8.5, 4);
  const rightDiffractionPanel = new THREE.Mesh(rightGeometry, diffractionPanelMaterial);
  rightDiffractionPanel.position.set(5.75, 0, 15);
  rightDiffractionPanel.rotation.y = Math.PI;
  diffractionPanelGroup.add(rightDiffractionPanel);

  scene.add(diffractionPanelGroup);

  // Light cone for wave visualization (initially hidden)
  const coneRadius = 4; // Base radius at diffraction panel
  const coneHeight = 15; // Distance from generator (z=0) to diffraction panel (z=15)
  const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 16, 1, true);
  const coneMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const lightCone = new THREE.Mesh(coneGeometry, coneMaterial);

  // Position the cone so the tip is at the generator (z=0) and base is at diffraction panel (z=15)
  lightCone.position.set(0, 0, coneHeight / 2);
  lightCone.rotation.x = -Math.PI / 2; // Rotate to point towards positive Z (towards slits)
  lightCone.visible = false; // Initially hidden
  scene.add(lightCone);

  // Create trapezoid shape for diffraction pattern
  const createTrapezoidGeometry = (
    baseWidth: number,
    topWidth: number,
    height: number,
    depth: number
  ): THREE.BufferGeometry => {
    const geometry = new THREE.BufferGeometry();

    // Define vertices for a trapezoid (8 vertices for a 3D trapezoid)
    // baseWidth = small base (at slit), topWidth = large base (at screen)
    const vertices = new Float32Array([
      // Front face (small base at z=0 - will be at slits)
      -baseWidth / 2, -height / 2, 0,  // bottom left (small)
      baseWidth / 2, -height / 2, 0,  // bottom right (small)
      baseWidth / 2, height / 2, 0,  // top right (small)
      -baseWidth / 2, height / 2, 0,  // top left (small)

      // Back face (large base at z=depth - will be at detection screen)
      -topWidth / 2, -height / 2, depth,  // bottom left (large)
      topWidth / 2, -height / 2, depth,  // bottom right (large)
      topWidth / 2, height / 2, depth,  // top right (large)
      -topWidth / 2, height / 2, depth,  // top left (large)
    ]);

    // Define faces using indices
    const indices = new Uint16Array([
      // Front face
      0, 1, 2, 0, 2, 3,
      // Back face  
      4, 7, 6, 4, 6, 5,
      // Left face
      0, 3, 7, 0, 7, 4,
      // Right face
      1, 5, 6, 1, 6, 2,
      // Top face
      3, 2, 6, 3, 6, 7,
      // Bottom face
      0, 4, 5, 0, 5, 1
    ]);

    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    return geometry;
  };

  // Diffraction trapezoids for light wave phase
  const trapezoidMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });

  // Left trapezoid (from left slit) - base exactly matches slit dimensions
  const leftTrapezoidGeometry = createTrapezoidGeometry(1, 8, 4, 15); // small base=1x4 (slit), large base=8x4 (screen), depth=15
  const leftTrapezoid = new THREE.Mesh(leftTrapezoidGeometry, trapezoidMaterial);
  leftTrapezoid.position.set(-1, 0, 15); // Small base starts exactly at diffraction panel (z=15)
  leftTrapezoid.visible = false;
  scene.add(leftTrapezoid);

  // Right trapezoid (from right slit) - base exactly matches slit dimensions  
  const rightTrapezoidGeometry = createTrapezoidGeometry(1, 8, 4, 15); // small base=1x4 (slit), large base=8x4 (screen), depth=15
  const rightTrapezoid = new THREE.Mesh(rightTrapezoidGeometry, trapezoidMaterial);
  rightTrapezoid.position.set(1, 0, 15); // Small base starts exactly at diffraction panel (z=15)
  rightTrapezoid.visible = false;
  scene.add(rightTrapezoid);

  return { detectionScreen, diffractionPanelGroup, lightCone, leftTrapezoid, rightTrapezoid };
};