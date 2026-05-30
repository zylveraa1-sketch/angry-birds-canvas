import { cx, GROUND, SL } from './config.js';
import { getSlingshotSprite, slingMetrics } from './assets.js';
import { circleSegment } from './collision.js';

/** Размер и точки привязки (доли от PNG 207×205, bbox учтён) */
/** Центр птицы над лежаком рогатки */
export const BIRD_CENTER_ABOVE_POUCH = 20;

const SLING_H = 158;
const SLING_ASPECT = 207 / 205;
const SPLIT = { nx: 0.48, ny: 0.58 };
const FORK_L_N = { nx: 55 / 207, ny: 23 / 205 };
const FORK_R_N = { nx: 149 / 207, ny: 23 / 205 };

let geomCache = null;
let geomFootNy = null;

export function getSlingGeometry() {
  const footNy = slingMetrics.footNy || 1;
  if (geomCache && geomFootNy === footNy) return geomCache;

  const img = getSlingshotSprite();
  const aspect = img?.naturalWidth
    ? img.naturalWidth / img.naturalHeight
    : SLING_ASPECT;
  const slingW = SLING_H * aspect;
  const anchorNx = slingMetrics.anchorNx ?? 0.48;

  const drawX = SL.x - slingW * anchorNx;
  const drawY = GROUND - SLING_H * footNy;
  const map = (p) => ({ x: drawX + p.nx * slingW, y: drawY + p.ny * SLING_H });

  const forkL = map(FORK_L_N);
  const forkR = map(FORK_R_N);
  const split = map(SPLIT);
  const foot = { x: SL.x, y: GROUND };

  geomFootNy = footNy;
  geomCache = {
    drawX,
    drawY,
    drawW: slingW,
    drawH: SLING_H,
    foot,
    forkL,
    forkR,
    split,
    pouch: {
      x: (forkL.x + forkR.x) / 2,
      y: (forkL.y + forkR.y) / 2 + 24,
    },
    segments: [
      { x1: foot.x, y1: foot.y - 4, x2: split.x, y2: split.y, thick: 16 },
      { x1: split.x, y1: split.y, x2: forkL.x, y2: forkL.y, thick: 13 },
      { x1: split.x, y1: split.y, x2: forkR.x, y2: forkR.y, thick: 13 },
    ],
  };
  return geomCache;
}

export function slingPouchRest() {
  return getSlingGeometry().pouch;
}

/** Точка крепления резинки на птице (лежак) */
export function birdPouchFromCenter(cx, cy) {
  return { x: cx, y: cy + BIRD_CENTER_ABOVE_POUCH };
}

export function birdCenterFromPouch(px, py) {
  return { x: px, y: py - BIRD_CENTER_ABOVE_POUCH };
}

export function birdPouchPoint(bird) {
  return birdPouchFromCenter(bird.x, bird.y);
}

export function getSlingSegments() {
  return getSlingGeometry().segments;
}

/** Ограничение натяжения: птица не уходит дальше max от лежака */
export function constrainPull(px, py, max = 96) {
  const p = slingPouchRest();
  const dx = px - p.x;
  const dy = py - p.y;
  const d = Math.hypot(dx, dy);
  if (d <= max) return { x: px, y: py };
  return { x: p.x + (dx / d) * max, y: p.y + (dy / d) * max };
}

function drawRope(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const sag = Math.min(10, len * 0.06);
  const cxp = mx - (dy / len) * sag;
  const cyp = my + (dx / len) * sag;

  cx.strokeStyle = '#2a1606';
  cx.lineWidth = 7;
  cx.lineCap = 'round';
  cx.lineJoin = 'round';
  cx.beginPath();
  cx.moveTo(x1, y1);
  cx.quadraticCurveTo(cxp, cyp, x2, y2);
  cx.stroke();

  cx.strokeStyle = '#d4a84b';
  cx.lineWidth = 3.5;
  cx.beginPath();
  cx.moveTo(x1, y1);
  cx.quadraticCurveTo(cxp, cyp, x2, y2);
  cx.stroke();
}

export function drawSlingFrame() {
  const g = getSlingGeometry();
  const img = getSlingshotSprite();

  cx.save();
  if (img?.naturalWidth) {
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(img, g.drawX, g.drawY, g.drawW, g.drawH);
  } else {
    cx.strokeStyle = '#7B4F28';
    cx.lineWidth = 12;
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(g.foot.x, g.foot.y);
    cx.lineTo(g.split.x, g.split.y);
    cx.stroke();
    cx.lineWidth = 10;
    cx.beginPath();
    cx.moveTo(g.split.x, g.split.y);
    cx.lineTo(g.forkL.x, g.forkL.y);
    cx.stroke();
    cx.beginPath();
    cx.moveTo(g.split.x, g.split.y);
    cx.lineTo(g.forkR.x, g.forkR.y);
    cx.stroke();
  }
  cx.restore();
}

/** Резинка сзади птицы: правая ветка */
export function drawSlingBandBack(bx, by) {
  const { forkR } = getSlingGeometry();
  cx.save();
  drawRope(forkR.x, forkR.y, bx, by);
  cx.restore();
}

/** Резинка спереди: левая ветка */
export function drawSlingBandFront(bx, by) {
  const { forkL } = getSlingGeometry();
  cx.save();
  drawRope(forkL.x, forkL.y, bx, by);
  cx.restore();
}

export function slingBirdPos(bird, dragging, dragCx, dragCy) {
  if (dragging) return birdPouchFromCenter(dragCx, dragCy);
  if (bird) return birdPouchPoint(bird);
  return { ...slingPouchRest() };
}

/** Коллизия круга с рогаткой (свиньи, блоки) */
export function collideCircleWithSling(cx2, cy2, r) {
  for (const seg of getSlingSegments()) {
    const mtv = circleSegment(cx2, cy2, r, seg.x1, seg.y1, seg.x2, seg.y2, seg.thick);
    if (mtv) return mtv;
  }
  return null;
}

/** Птица: не бьётся о свою рогатку сразу после выстрела */
export function collideBirdWithSling(bird) {
  if (bird.slingGrace > 0) return null;
  const { forkR } = getSlingGeometry();
  if (bird.x < forkR.x + 12) return null;

  const mtv = collideCircleWithSling(bird.x, bird.y, bird.r * 0.72);
  if (!mtv) return null;

  const imp = bird.vx * mtv.nx + bird.vy * mtv.ny;
  if (imp >= 0) return null;

  return mtv;
}

/** Коллизия блока (AABB) с рогаткой */
export function collideBlockWithSling(bl) {
  const r = Math.hypot(bl.w, bl.h) * 0.42;
  const mtv = collideCircleWithSling(bl.cx, bl.cy, r);
  if (!mtv) return null;
  bl.x += mtv.nx * mtv.depth;
  bl.y += mtv.ny * mtv.depth;
  const imp = Math.abs(bl.vx * mtv.nx + bl.vy * mtv.ny);
  bl.vx -= mtv.nx * imp * 0.8;
  bl.vy -= mtv.ny * imp * 0.8;
  bl.sleeping = false;
  return mtv;
}
