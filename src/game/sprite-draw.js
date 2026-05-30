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

  cx.save();
  if (alpha < 1) cx.globalAlpha = alpha;
  if (opts.crisp) {
    cx.imageSmoothingEnabled = false;
  } else {
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
  }
  cx.drawImage(img, x - dw * ax, y - dh * ay, dw, dh);
  cx.restore();
  return true;
}
