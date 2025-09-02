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

  // Generator Label (will change based on phase)
  const generatorLabel = createTextLabel('Particle Generator');
  generatorLabel.position.set(0, 4.5, 0); // Position above the enlarged generator cylinder
  generatorLabel.scale.setScalar(2);
  generatorLabel.name = 'generatorLabel'; // Add name for identification
  scene.add(generatorLabel);
  labels.push(generatorLabel);

  // Diffraction Slit Label
  const diffractionSlitLabel = createTextLabel('Diffraction Slits');
  diffractionSlitLabel.position.set(0, 8.5, 15);
  diffractionSlitLabel.scale.setScalar(2);
  scene.add(diffractionSlitLabel);
  labels.push(diffractionSlitLabel);

  // Detection Screen Label
  const detectionScreenLabel = createTextLabel('Detection Screen');
  detectionScreenLabel.position.set(0, 8.5, 30);
  detectionScreenLabel.scale.setScalar(2);
  scene.add(detectionScreenLabel);
  labels.push(detectionScreenLabel);

  return labels;
};

export const updateGeneratorLabel = (scene: THREE.Scene, newText: string) => {
  const generatorLabel = scene.getObjectByName('generatorLabel') as THREE.Group;
  if (generatorLabel) {
    // Remove old sprite
    const oldSprite = generatorLabel.children[0];
    if (oldSprite instanceof THREE.Sprite && oldSprite.material.map) {
      oldSprite.material.map.dispose();
      oldSprite.material.dispose();
    }
    generatorLabel.remove(oldSprite);

    // Create new label with updated text
    const newLabelGroup = createTextLabel(newText);
    const newSprite = newLabelGroup.children[0];
    generatorLabel.add(newSprite);
  }
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