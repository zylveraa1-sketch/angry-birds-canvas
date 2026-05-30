import { cx, WW } from './config.js';
import { rnd } from './utils.js';

const CLOUDS = [];
for (let i = 0; i < 7; i++) {
  CLOUDS.push({
    x: rnd(0, WW),
    y: rnd(20, 160),
    w: rnd(80, 190),
    spd: rnd(0.08, 0.32),
    a: rnd(0.6, 0.95),
  });
}

export function drawClouds() {
  CLOUDS.forEach((c) => {
    c.x += c.spd;
    if (c.x > WW + 140) c.x = -180;
    cx.save();
    cx.globalAlpha = c.a;
    cx.fillStyle = '#fff';
    cx.beginPath();
    cx.ellipse(c.x, c.y, c.w * 0.5, 28, 0, 0, Math.PI * 2);
    cx.fill();
    cx.beginPath();
    cx.ellipse(c.x - c.w * 0.22, c.y + 8, c.w * 0.32, 21, 0, 0, Math.PI * 2);
    cx.fill();
    cx.beginPath();
    cx.ellipse(c.x + c.w * 0.22, c.y + 9, c.w * 0.3, 19, 0, 0, Math.PI * 2);
    cx.fill();
    cx.restore();
  });
}
