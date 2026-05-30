/** Базовые настройки canvas и физики */
export const WW = 900;
export const HH = 540;
export const GROUND = HH - 80;
export const GRAVITY = 0.4;
export const FRICTION = 0.55;
export const BOUNCE = 0.3;
export const SLEEP_THRESH = 0.08;

export const SL = { x: 145, y: GROUND - 92 };

export let cv;
export let cx;
export let dpr = 1;

function applyCanvasDpr() {
  dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  cv.width = Math.round(WW * dpr);
  cv.height = Math.round(HH * dpr);
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.imageSmoothingEnabled = true;
  cx.imageSmoothingQuality = 'high';
}

export function initCanvas() {
  cv = document.getElementById('c');
  cx = cv.getContext('2d');
  applyCanvasDpr();
}

export function resizeCanvas() {
  const s = Math.min((window.innerWidth - 8) / WW, (window.innerHeight - 8) / HH);
  cv.style.width = WW * s + 'px';
  cv.style.height = HH * s + 'px';
  document.getElementById('wrapper').style.width = WW * s + 'px';
  document.getElementById('wrapper').style.height = HH * s + 'px';
  applyCanvasDpr();
}
