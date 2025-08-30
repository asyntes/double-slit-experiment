import * as THREE from 'three';

const createTextLabel = (text: string): THREE.Group => {
  const labelGroup = new THREE.Group();

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
  sprite.scale.set(6, 1.5, 1);
  labelGroup.add(sprite);

  return labelGroup;
};

export const createSceneLabels = (scene: THREE.Scene): THREE.Group[] => {
  const labels: THREE.Group[] = [];

  // Particle Generator Label
  const particleGeneratorLabel = createTextLabel('Particle Generator');
  particleGeneratorLabel.position.set(0, 1.5, 0);
  particleGeneratorLabel.scale.setScalar(1);
  scene.add(particleGeneratorLabel);
  labels.push(particleGeneratorLabel);

  // Diffraction Slit Label
  const diffractionSlitLabel = createTextLabel('Diffraction Slits');
  diffractionSlitLabel.position.set(0, 8.5, 15);
  diffractionSlitLabel.scale.setScalar(1);
  scene.add(diffractionSlitLabel);
  labels.push(diffractionSlitLabel);

  // Detection Screen Label
  const detectionScreenLabel = createTextLabel('Detection Screen');
  detectionScreenLabel.position.set(0, 8.5, 30);
  detectionScreenLabel.scale.setScalar(1);
  scene.add(detectionScreenLabel);
  labels.push(detectionScreenLabel);

  return labels;
};

export const cleanupLabels = (scene: THREE.Scene | null, labels: THREE.Group[]) => {
  labels.forEach(labelGroup => {
    if (scene) {
      scene.remove(labelGroup);
    }
    labelGroup.children.forEach(child => {
      if (child instanceof THREE.Sprite && child.material.map) {
        child.material.map.dispose();
        child.material.dispose();
      }
    });
  });
};