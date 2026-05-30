import { cx } from './config.js';

/** Рисует спрайт с чётким масштабированием */
export function drawSpriteCentered(img, x, y, size, opts = {}) {
  if (!img?.naturalWidth) return false;

  const aspect = img.naturalWidth / img.naturalHeight || 1;
  let dw = size;
  let dh = size;
  if (aspect > 1) dh = size / aspect;
  else dw = size * aspect;

  const ax = opts.anchor?.cx ?? 0.5;
  const ay = opts.anchor?.cy ?? 0.5;
  const alpha = opts.alpha ?? 1;
  const sx = opts.scaleX ?? 1;
  const sy = opts.scaleY ?? 1;

  cx.save();
  if (alpha < 1) cx.globalAlpha = alpha;
  if (opts.crisp) {
    cx.imageSmoothingEnabled = false;
  } else {
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
  }
  cx.translate(x, y);
  cx.scale(sx, sy);
  cx.drawImage(img, -dw * ax, -dh * ay, dw, dh);
  cx.restore();
  return true;
}
