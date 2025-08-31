import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ResponsiveLayoutProps {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  controls: OrbitControls | null;
}

export const useResponsiveLayout = ({ scene, camera, renderer, controls }: ResponsiveLayoutProps) => {
  useEffect(() => {
    if (!scene || !camera || !renderer || !controls) return;

    // Initial responsive setup
    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait) {
      const isLowHeightDevice = window.innerHeight <= 667;
      const sceneOffset = isLowHeightDevice ? 12 : 5;

      scene.position.y += sceneOffset;

      const direction = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).add(direction.multiplyScalar(55));
      controls.update();
    }

    const handleResize = () => {
      if (!camera || !renderer || !scene || !controls) return;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Reset scene position first
      scene.position.y = 0;

      // Reapply scene positioning and camera distance for portrait mode
      const isPortrait = window.innerHeight > window.innerWidth;
      if (isPortrait) {
        const isLowHeightDevice = window.innerHeight <= 667;
        const sceneOffset = isLowHeightDevice ? 12 : 5;

        scene.position.y += sceneOffset;

        const direction = camera.position.clone().sub(controls.target).normalize();
        camera.position.copy(controls.target).add(direction.multiplyScalar(55));
        controls.update();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [scene, camera, renderer, controls]);
};