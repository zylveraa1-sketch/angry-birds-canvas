import { cv, WW, HH } from './config.js';

export const rnd = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function toCanvas(e) {
  const r = cv.getBoundingClientRect();
  const scX = WW / r.width;
  const scY = HH / r.height;
  const t = e.touches ? e.touches[0] : e;
  return { x: (t.clientX - r.left) * scX, y: (t.clientY - r.top) * scY };
}
