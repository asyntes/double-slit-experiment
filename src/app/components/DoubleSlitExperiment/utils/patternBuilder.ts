import * as THREE from 'three';

export type PatternMode = 'interference' | 'classical';

const CANVAS_W = 512;
const CANVAS_H = 384;

/** Creates a blank detection-screen canvas used to accumulate single-electron hits. */
export const createPatternCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  return canvas;
};

export const createPatternTexture = (canvas: HTMLCanvasElement): THREE.CanvasTexture => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

export const resetPatternCanvas = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

/**
 * Sample a hit position on the detection screen.
 * Interference: cos² fringes under a Gaussian envelope (path unknown).
 * Classical: two Gaussian blobs aligned with the slits (path known).
 */
const sampleHit = (mode: PatternMode): { x: number; y: number } | null => {
  const stripeRegionWidth = CANVAS_W * 0.5;
  const stripeHeight = CANVAS_H * (4 / 15);

  for (let attempt = 0; attempt < 40; attempt++) {
    const x = Math.random() * stripeRegionWidth - stripeRegionWidth / 2;
    const y = (Math.random() - 0.5) * stripeHeight;
    const normalizedX = Math.abs(x) / (stripeRegionWidth / 2);
    const envelope = Math.exp(-normalizedX * normalizedX * 3);

    let intensity: number;
    if (mode === 'interference') {
      const fringe = Math.cos(x * 0.08) ** 2;
      intensity = fringe * envelope;
    } else {
      // Two lobes centered near the geometric projections of the slits
      const left = Math.exp(-((x + stripeRegionWidth * 0.22) / (stripeRegionWidth * 0.12)) ** 2);
      const right = Math.exp(-((x - stripeRegionWidth * 0.22) / (stripeRegionWidth * 0.12)) ** 2);
      intensity = (left + right) * 0.55 * envelope;
    }

    if (Math.random() < intensity) {
      return {
        x: CANVAS_W / 2 + x + (Math.random() - 0.5) * 2,
        y: CANVAS_H / 2 + y + (Math.random() - 0.5) * 2
      };
    }
  }
  return null;
};

/** Paint one electron hit onto the accumulating pattern canvas. Returns true if a dot was drawn. */
export const addShotToPattern = (
  canvas: HTMLCanvasElement,
  mode: PatternMode
): boolean => {
  const hit = sampleHit(mode);
  if (!hit) return false;

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(hit.x, hit.y, 0.5 + Math.random() * 0.5, 0, Math.PI * 2);
  ctx.fill();
  return true;
};
