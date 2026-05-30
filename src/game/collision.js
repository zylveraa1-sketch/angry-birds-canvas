import { clamp } from './utils.js';

export function circleAABB(cx2, cy2, r, rx, ry, rw, rh) {
  const nearX = clamp(cx2, rx, rx + rw);
  const nearY = clamp(cy2, ry, ry + rh);
  const dx = cx2 - nearX;
  const dy = cy2 - nearY;
  const d = Math.hypot(dx, dy);
  if (d >= r) return null;
  if (d === 0) {
    const overX = r - Math.abs(cx2 - (rx + rw / 2));
    const overY = r - Math.abs(cy2 - (ry + rh / 2));
    return overX < overY
      ? { nx: Math.sign(cx2 - (rx + rw / 2)), ny: 0, depth: overX }
      : { nx: 0, ny: Math.sign(cy2 - (ry + rh / 2)), depth: overY };
  }
  const pen = r - d;
  return { nx: dx / d, ny: dy / d, depth: pen };
}

export function aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/** Круг vs отрезок (стойка/рука рогатки), thickness — полная толщина коллизии */
export function circleSegment(cx, cy, r, x1, y1, x2, y2, thickness) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-6) return null;

  let t = ((cx - x1) * dx + (cy - y1) * dy) / len2;
  t = clamp(t, 0, 1);
  const qx = x1 + t * dx;
  const qy = y1 + t * dy;
  const dist = Math.hypot(cx - qx, cy - qy);
  const rad = r + thickness * 0.5;
  if (dist >= rad) return null;
  if (dist < 1e-6) {
    const len = Math.hypot(dx, dy) || 1;
    return { nx: -dy / len, ny: dx / len, depth: rad };
  }
  const depth = rad - dist;
  return { nx: (cx - qx) / dist, ny: (cy - qy) / dist, depth };
}
