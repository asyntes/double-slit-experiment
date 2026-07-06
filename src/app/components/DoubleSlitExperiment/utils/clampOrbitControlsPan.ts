import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SCENE_FLOOR_PAN_HALF } from '../components/SceneBackground';

/** Keeps orbit target (and camera) inside half the floor extent on ±X and ±Z. */
export const clampOrbitControlsPan = (controls: OrbitControls): void => {
  const target = controls.target;
  const camera = controls.object;

  const clampedX = THREE.MathUtils.clamp(target.x, -SCENE_FLOOR_PAN_HALF, SCENE_FLOOR_PAN_HALF);
  const clampedZ = THREE.MathUtils.clamp(target.z, -SCENE_FLOOR_PAN_HALF, SCENE_FLOOR_PAN_HALF);
  const dx = clampedX - target.x;
  const dz = clampedZ - target.z;

  if (dx === 0 && dz === 0) return;

  target.x = clampedX;
  target.z = clampedZ;
  camera.position.x += dx;
  camera.position.z += dz;
};
