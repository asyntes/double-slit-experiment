import * as THREE from 'three';

export const createExperimentSetup = (scene: THREE.Scene) => {
  // Light generator (cube)
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0x222222
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(0, 0, 0);
  scene.add(cube);

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
    color: 0xff0000,
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

  return { detectionScreen, diffractionPanelGroup, lightCone };
};