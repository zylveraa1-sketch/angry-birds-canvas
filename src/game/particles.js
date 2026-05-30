import { cx } from './config.js';
import { rnd } from './utils.js';
import { getExplosionFrame } from './assets.js';

export const PARTS = [];
export const SHOCKWAVES = [];
/** Спрайтовые взрывы: 3 кадра из assets/sprites/explosion-*.png */
export const EXPLOSIONS = [];

const EXP_FRAME_TICKS = 7;
const EXP_FRAMES = 3;

/** Длительность спрайтового взрыва в кадрах игры (~21 при 60fps) */
export function explosionDuration() {
  return EXP_FRAMES * EXP_FRAME_TICKS;
}

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

export function spawnSpriteExplosion(x, y, size = 200) {
  EXPLOSIONS.push({
    x,
    y,
    size,
    frame: 0,
    tick: 0,
    alpha: 1,
  });
}

export function spawnBoom(x, y) {
  spawnSpriteExplosion(x, y, 210);
  spawnP(x, y, '#FF6600', 18, 10);
  spawnP(x, y, '#FFD700', 12, 8);
  SHOCKWAVES.push({ x, y, r: 10, maxR: 130, life: 1.35 });
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
    s.life -= 0.06;
    if (s.life <= 0) SHOCKWAVES.splice(i, 1);
  }
  for (let i = EXPLOSIONS.length - 1; i >= 0; i--) {
    const e = EXPLOSIONS[i];
    e.tick++;
    if (e.tick >= EXP_FRAME_TICKS) {
      e.tick = 0;
      e.frame++;
      if (e.frame >= EXP_FRAMES) {
        EXPLOSIONS.splice(i, 1);
        continue;
      }
    }
    if (e.frame === EXP_FRAMES - 1) e.alpha = 1 - e.tick / EXP_FRAME_TICKS;
  }
}

function drawSpriteExplosions() {
  EXPLOSIONS.forEach((e) => {
    const img = getExplosionFrame(e.frame);
    if (!img?.naturalWidth) return;
    const s = e.size;
    cx.save();
    cx.globalAlpha = e.alpha;
    cx.imageSmoothingEnabled = true;
    cx.drawImage(img, e.x - s / 2, e.y - s / 2, s, s);
    cx.restore();
  });
}

export function drawParts() {
  drawSpriteExplosions();
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
  EXPLOSIONS.length = 0;
}
