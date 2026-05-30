import { cx, WW, HH, GROUND } from './config.js';
import { getGroundGrassSprite } from './assets.js';

export function drawGround() {
  const img = getGroundGrassSprite();
  const gh = HH - GROUND;

  if (img?.naturalWidth) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const tileH = gh;
    const tileW = (iw / ih) * tileH;

    cx.save();
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';

    for (let x = 0; x < WW; x += tileW) {
      const w = Math.min(tileW, WW - x);
      const srcW = (w / tileW) * iw;
      cx.drawImage(img, 0, 0, srcW, ih, x, GROUND, w, tileH);
    }

    cx.restore();
    return;
  }

  const gg = cx.createLinearGradient(0, GROUND, 0, HH);
  gg.addColorStop(0, '#7EC850');
  gg.addColorStop(0.2, '#5A9E35');
  gg.addColorStop(1, '#3a6e20');
  cx.fillStyle = gg;
  cx.fillRect(0, GROUND, WW, gh);
  cx.fillStyle = '#6abf40';
  cx.fillRect(0, GROUND, WW, 6);
}
