import { cx } from './config.js';
import { rnd } from './utils.js';
import { spawnP } from './particles.js';

export function drawRed(x, y, r, a) {
  cx.save();
  cx.translate(x, y);
  cx.rotate(a);
  cx.save();
  cx.globalAlpha = 0.2;
  cx.fillStyle = '#000';
  cx.beginPath();
  cx.ellipse(0, r + 2, r * 0.85, r * 0.28, 0, 0, Math.PI * 2);
  cx.fill();
  cx.restore();
  const g = cx.createRadialGradient(-r * 0.22, -r * 0.25, r * 0.08, 0, 0, r);
  g.addColorStop(0, '#FF7777');
  g.addColorStop(1, '#BB0000');
  cx.fillStyle = g;
  cx.beginPath();
  cx.arc(0, 0, r, 0, Math.PI * 2);
  cx.fill();
  cx.strokeStyle = '#880000';
  cx.lineWidth = 1.5;
  cx.beginPath();
  cx.arc(0, 0, r, 0, Math.PI * 2);
  cx.stroke();
  cx.fillStyle = '#990000';
  cx.beginPath();
  cx.moveTo(-4, -r - 1);
  cx.lineTo(2, -r - 11);
  cx.lineTo(8, -r - 1);
  cx.lineTo(13, -r + 3);
  cx.lineTo(8, -r + 6);
  cx.closePath();
  cx.fill();
  cx.fillStyle = '#fff';
  cx.beginPath();
  cx.arc(r * 0.28, -r * 0.18, r * 0.34, 0, Math.PI * 2);
  cx.fill();
  cx.fillStyle = '#111';
  cx.beginPath();
  cx.arc(r * 0.34, -r * 0.15, r * 0.17, 0, Math.PI * 2);
  cx.fill();
  cx.fillStyle = '#fff';
  cx.beginPath();
  cx.arc(r * 0.41, -r * 0.22, r * 0.07, 0, Math.PI * 2);
  cx.fill();
  cx.strokeStyle = '#550000';
  cx.lineWidth = r * 0.13;
  cx.lineCap = 'round';
  cx.beginPath();
  cx.moveTo(r * 0.04, -r * 0.46);
  cx.lineTo(r * 0.55, -r * 0.31);
  cx.stroke();
  cx.fillStyle = '#FFA500';
  cx.beginPath();
  cx.moveTo(r * 0.55, r * 0.06);
  cx.lineTo(r * 0.92, -r * 0.08);
  cx.lineTo(r * 0.55, r * 0.28);
  cx.closePath();
  cx.fill();
  cx.restore();
}

export function drawYellow(x, y, r, a, boosted) {
  cx.save();
  cx.translate(x, y);
  cx.rotate(a);
  if (boosted) {
    cx.strokeStyle = 'rgba(255,220,0,.55)';
    cx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const ly = rnd(-r, r);
      cx.beginPath();
      cx.moveTo(-r * 2.2, ly);
      cx.lineTo(-r * 1.1, ly);
      cx.stroke();
    }
  }
  const g = cx.createRadialGradient(-r * 0.2, -r * 0.22, r * 0.06, 0, 0, r);
  g.addColorStop(0, '#FFEE55');
  g.addColorStop(1, '#CC8800');
  cx.fillStyle = g;
  cx.beginPath();
  cx.moveTo(r * 0.92, 0);
  cx.lineTo(0, -r * 0.78);
  cx.lineTo(-r * 0.92, 0);
  cx.lineTo(0, r * 0.78);
  cx.closePath();
  cx.fill();
  cx.strokeStyle = '#996600';
  cx.lineWidth = 1.5;
  cx.beginPath();
  cx.moveTo(r * 0.92, 0);
  cx.lineTo(0, -r * 0.78);
  cx.lineTo(-r * 0.92, 0);
  cx.lineTo(0, r * 0.78);
  cx.closePath();
  cx.stroke();
  cx.fillStyle = '#fff';
  cx.beginPath();
  cx.arc(r * 0.26, -r * 0.1, r * 0.3, 0, Math.PI * 2);
  cx.fill();
  cx.fillStyle = '#111';
  cx.beginPath();
  cx.arc(r * 0.31, -r * 0.08, r * 0.15, 0, Math.PI * 2);
  cx.fill();
  cx.fillStyle = '#fff';
  cx.beginPath();
  cx.arc(r * 0.37, -r * 0.15, r * 0.06, 0, Math.PI * 2);
  cx.fill();
  cx.strokeStyle = '#553300';
  cx.lineWidth = r * 0.12;
  cx.lineCap = 'round';
  cx.beginPath();
  cx.moveTo(r * 0.06, -r * 0.38);
  cx.lineTo(r * 0.52, -r * 0.24);
  cx.stroke();
  cx.fillStyle = '#FF8800';
  cx.beginPath();
  cx.moveTo(r * 0.6, 0);
  cx.lineTo(r * 0.98, 0.1);
  cx.lineTo(r * 0.6, r * 0.22);
  cx.closePath();
  cx.fill();
  cx.restore();
}

export function drawBlack(x, y, r, a, fuse) {
  cx.save();
  cx.translate(x, y);
  cx.rotate(a);
  if (fuse < 0.5 && fuse > 0) {
    cx.save();
    cx.globalAlpha = (1 - fuse) * 0.6;
    const fg = cx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.8);
    fg.addColorStop(0, '#FF4400');
    fg.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = fg;
    cx.beginPath();
    cx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
    cx.fill();
    cx.restore();
  }
  const g = cx.createRadialGradient(-r * 0.22, -r * 0.3, r * 0.08, 0, 0, r);
  g.addColorStop(0, '#666');
  g.addColorStop(1, '#111');
  cx.fillStyle = g;
  cx.beginPath();
  cx.arc(0, 0, r, 0, Math.PI * 2);
  cx.fill();
  cx.strokeStyle = '#333';
  cx.lineWidth = 1.5;
  cx.beginPath();
  cx.arc(0, 0, r, 0, Math.PI * 2);
  cx.stroke();
  cx.strokeStyle = '#aa8833';
  cx.lineWidth = r * 0.13;
  cx.lineCap = 'round';
  cx.beginPath();
  cx.moveTo(r * 0.1, -r);
  cx.bezierCurveTo(r * 0.3, -r * 1.45, r * 0.5, -r * 1.3, r * 0.4, -r * 1.65);
  cx.stroke();
  if (fuse > 0) {
    spawnP(
      x + r * 0.4 * Math.cos(a) - r * 1.65 * Math.sin(a),
      y + r * 0.4 * Math.sin(a) - r * 1.65 * Math.cos(a),
      '#FFD700',
      1,
      2
    );
  }
  cx.fillStyle = '#fff';
  cx.beginPath();
  cx.arc(r * 0.28, -r * 0.16, r * 0.3, 0, Math.PI * 2);
  cx.fill();
  cx.fillStyle = '#111';
  cx.beginPath();
  cx.arc(r * 0.33, -r * 0.13, r * 0.16, 0, Math.PI * 2);
  cx.fill();
  cx.strokeStyle = '#111';
  cx.lineWidth = r * 0.14;
  cx.lineCap = 'round';
  cx.beginPath();
  cx.moveTo(r * 0.03, -r * 0.44);
  cx.lineTo(r * 0.53, -r * 0.3);
  cx.stroke();
  cx.fillStyle = '#cc7700';
  cx.beginPath();
  cx.moveTo(r * 0.55, r * 0.08);
  cx.lineTo(r * 0.93, -r * 0.07);
  cx.lineTo(r * 0.55, r * 0.28);
  cx.closePath();
  cx.fill();
  cx.restore();
}
