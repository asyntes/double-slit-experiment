import * as THREE from 'three';

export type PatternMode = 'interference' | 'classical';

const CANVAS_W = 512;
const CANVAS_H = 384;

/** Sample a detection-screen hit for interference or classical (which-path) mixture. */
export function sampleScreenHit(mode: PatternMode): { x: number; y: number } | null {
  const stripeRegionWidth = CANVAS_W * 0.5;
  const stripeHeight = CANVAS_H * (4 / 15);

  const x = Math.random() * stripeRegionWidth - stripeRegionWidth / 2;
  const y = (Math.random() - 0.5) * stripeHeight;
  const normalizedX = Math.abs(x) / (stripeRegionWidth / 2);
  const envelope = Math.exp(-normalizedX * normalizedX * 3);

  let totalIntensity: number;
  if (mode === 'interference') {
    const fringe = Math.cos(x * 0.08) * Math.cos(x * 0.08);
    totalIntensity = fringe * envelope;
  } else {
    // Classical mixture of two single-slit envelopes (no interference fringes)
    const slitOffset = stripeRegionWidth * 0.12;
    const left = Math.exp(-Math.pow((x + slitOffset) / (stripeRegionWidth / 2), 2) * 4);
    const right = Math.exp(-Math.pow((x - slitOffset) / (stripeRegionWidth / 2), 2) * 4);
    totalIntensity = 0.55 * (left + right) * envelope;
  }

  if (Math.random() >= totalIntensity) {
    return null;
  }

  return {
    x: CANVAS_W / 2 + x + (Math.random() - 0.5) * 2,
    y: CANVAS_H / 2 + y + (Math.random() - 0.5) * 2
  };
}

export interface PatternCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
}

export function createEmptyPatternCanvas(): PatternCanvas {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return { canvas, ctx, texture };
}

export function clearPatternCanvas(pattern: PatternCanvas) {
  pattern.ctx.fillStyle = '#333333';
  pattern.ctx.fillRect(0, 0, pattern.canvas.width, pattern.canvas.height);
  pattern.texture.needsUpdate = true;
}

/** Paint N probabilistic hits onto an accumulating pattern canvas. */
export function paintShots(pattern: PatternCanvas, mode: PatternMode, shots: number) {
  pattern.ctx.fillStyle = '#ffffff';
  for (let i = 0; i < shots; i++) {
    const hit = sampleScreenHit(mode);
    if (!hit) continue;
    pattern.ctx.beginPath();
    pattern.ctx.arc(hit.x, hit.y, 0.5 + Math.random() * 0.5, 0, Math.PI * 2);
    pattern.ctx.fill();
  }
  pattern.texture.needsUpdate = true;
}

/** One-shot full pattern (used for light-wave phase). */
export function createFilledPatternTexture(mode: PatternMode, attempts = 8000): THREE.CanvasTexture {
  const pattern = createEmptyPatternCanvas();
  paintShots(pattern, mode, attempts);
  return pattern.texture;
}
