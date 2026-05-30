import { GROUND, WW } from './config.js';

/** Точки верхнего края холма (как в game.js draw) */
const HILL = [
  [0, GROUND + 15],
  [60, GROUND - 55],
  [160, GROUND - 30],
  [280, GROUND - 70],
  [430, GROUND - 40],
  [560, GROUND - 80],
  [680, GROUND - 35],
  [800, GROUND - 60],
  [WW, GROUND - 20],
];

/** Y поверхности земли/холма в точке x */
export function hillSurfaceY(x) {
  const px = Math.max(0, Math.min(WW, x));
  if (px <= HILL[0][0]) return HILL[0][1];
  for (let i = 1; i < HILL.length; i++) {
    const [x1, y1] = HILL[i];
    if (px <= x1) {
      const [x0, y0] = HILL[i - 1];
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return HILL[HILL.length - 1][1];
}
