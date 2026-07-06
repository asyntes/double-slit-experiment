import * as THREE from 'three';

const disposeMaterial = (material: THREE.Material) => {
  Object.values(material).forEach(value => {
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  });
  material.dispose();
};

/** Walk a scene graph and release GPU buffers, materials and textures. */
export const disposeSceneResources = (root: THREE.Object3D) => {
  root.traverse(object => {
    if (object instanceof THREE.Mesh) {
      object.geometry?.dispose();

      if (Array.isArray(object.material)) {
        object.material.forEach(disposeMaterial);
      } else if (object.material) {
        disposeMaterial(object.material);
      }
    } else if (object instanceof THREE.Points || object instanceof THREE.Line || object instanceof THREE.LineSegments) {
      object.geometry?.dispose();

      if (Array.isArray(object.material)) {
        object.material.forEach(disposeMaterial);
      } else if (object.material) {
        disposeMaterial(object.material);
      }
    } else if (object instanceof THREE.Sprite) {
      object.material.map?.dispose();
      object.material.dispose();
    }
  });
};
