import { cx } from './config.js';
import { rnd } from './utils.js';

export const PARTS = [];
export const SHOCKWAVES = [];

export function spawnP(x, y, col, n = 10, spd = 5) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, Math.PI * 2);
    const s = rnd(1, spd);
    PARTS.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 1.5,
      life: 1,
      decay: rnd(0.018, 0.045),
      r: rnd(3, 9),
      col,
    });
  }
}

export function spawnBoom(x, y) {
  spawnP(x, y, '#FF6600', 30, 12);
  spawnP(x, y, '#FFD700', 22, 16);
  spawnP(x, y, '#FF2200', 16, 9);
  spawnP(x, y, '#fff', 10, 6);
  SHOCKWAVES.push({ x, y, r: 10, maxR: 130, life: 1 });
}

export function tickParts() {
  for (let i = PARTS.length - 1; i >= 0; i--) {
    const p = PARTS[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.22;
    p.life -= p.decay;
    if (p.life <= 0) PARTS.splice(i, 1);
  }
  for (let i = SHOCKWAVES.length - 1; i >= 0; i--) {
    const s = SHOCKWAVES[i];
    s.r += 12;
    s.life -= 0.08;
    if (s.life <= 0) SHOCKWAVES.splice(i, 1);
  }
}

export function drawParts() {
  PARTS.forEach((p) => {
    cx.save();
    cx.globalAlpha = p.life;
    cx.fillStyle = p.col;
    cx.beginPath();
    cx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    cx.fill();
    cx.restore();
  });
  SHOCKWAVES.forEach((s) => {
    cx.save();
    cx.globalAlpha = s.life * 0.5;
    cx.strokeStyle = '#FF6600';
    cx.lineWidth = 4;
    cx.beginPath();
    cx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    cx.stroke();
    cx.restore();
  });
}

export function clearEffects() {
  PARTS.length = 0;
  SHOCKWAVES.length = 0;
}
