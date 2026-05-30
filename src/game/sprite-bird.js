import { cx } from './config.js';
import { getBirdSprite, getBirdAnchor } from './assets.js';
import { drawRed, drawYellow, drawBlack } from './draw-birds.js';

/**
 * @param {'feet'|'center'} opts.anchor — feet: (x,y) на земле; center: (x,y) центр спрайта
 */
export function drawBird(type, x, y, r, angle, opts = {}) {
  const img = getBirdSprite(type);
  if (img) {
    const size = r * 2.2;
    const aspect = img.naturalWidth / img.naturalHeight || 1;
    let dw = size;
    let dh = size;
    if (aspect > 1) dh = size / aspect;
    else dw = size * aspect;

    const a = getBirdAnchor(type);
    const ay = opts.anchor === 'feet' ? a.foot : a.cy;

    cx.save();
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    cx.translate(x, y);
    cx.rotate(angle);
    cx.drawImage(img, -dw * a.cx, -dh * ay, dw, dh);

    if (type === 'yellow' && opts.boosted) {
      cx.strokeStyle = 'rgba(255,220,0,.55)';
      cx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const ly = (i - 2) * (r * 0.35);
        cx.beginPath();
        cx.moveTo(-dw, ly);
        cx.lineTo(-dw * 0.55, ly);
        cx.stroke();
      }
    }
    if (type === 'black' && opts.fuse > 0) {
      cx.save();
      cx.globalAlpha = (1 - opts.fuse) * 0.5;
      const fg = cx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.6);
      fg.addColorStop(0, '#FF4400');
      fg.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = fg;
      cx.beginPath();
      cx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      cx.fill();
      cx.restore();
    }
    cx.restore();
    return;
  }

  if (type === 'red') drawRed(x, y, r, angle);
  else if (type === 'yellow') drawYellow(x, y, r, angle, opts.boosted);
  else drawBlack(x, y, r, angle, opts.fuse || 0);
}
