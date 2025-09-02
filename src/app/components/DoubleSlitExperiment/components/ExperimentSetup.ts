import * as THREE from 'three';

export const createExperimentSetup = (scene: THREE.Scene) => {
  const cylinderGeometry = new THREE.CylinderGeometry(3.5, 3.5, 12, 32);
  const cylinderMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x222222
  });
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
  cylinder.position.set(0, 0, -5);
  cylinder.rotation.x = Math.PI / 2;
  scene.add(cylinder);

  const screenGeometry = new THREE.PlaneGeometry(20, 15);
  const baseMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    side: THREE.DoubleSide
  });
  const detectionScreen = new THREE.Mesh(screenGeometry, baseMaterial);
  detectionScreen.position.set(0, 0, 30.1);
  detectionScreen.rotation.x = 0;
  scene.add(detectionScreen);

  const overlayGeometry = new THREE.PlaneGeometry(20, 15);
  const overlayMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0
  });
  const detectionScreenOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
  detectionScreenOverlay.position.set(0, 0, 30);
  detectionScreenOverlay.rotation.x = 0;
  scene.add(detectionScreenOverlay);

  const diffractionPanelGroup = new THREE.Group();
  const diffractionPanelMaterial = new THREE.MeshBasicMaterial({
    color: 0x666666,
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

  const beamRadius = 2.5;
  const beamLength = 15;
  const beamGeometry = new THREE.CylinderGeometry(beamRadius, beamRadius, beamLength, 32, 1, true);
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const lightBeam = new THREE.Mesh(beamGeometry, beamMaterial);

  lightBeam.position.set(0, 0, beamLength / 2);
  lightBeam.rotation.x = Math.PI / 2;
  lightBeam.visible = false;
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
    color: 0x00ff00,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });

  const leftTrapezoidGeometry = createTrapezoidGeometry(1, 8, 4, 15);
  const leftTrapezoid = new THREE.Mesh(leftTrapezoidGeometry, trapezoidMaterial);
  leftTrapezoid.position.set(-1, 0, 15);
  leftTrapezoid.visible = false;
  scene.add(leftTrapezoid);

  const rightTrapezoidGeometry = createTrapezoidGeometry(1, 8, 4, 15);
  const rightTrapezoid = new THREE.Mesh(rightTrapezoidGeometry, trapezoidMaterial);
  rightTrapezoid.position.set(1, 0, 15);
  rightTrapezoid.visible = false;
  scene.add(rightTrapezoid);

  return { detectionScreen, detectionScreenOverlay, diffractionPanelGroup, lightBeam, leftTrapezoid, rightTrapezoid };
};