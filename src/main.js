import { initCanvas, resizeCanvas, cv } from './game/config.js';
import { toCanvas } from './game/utils.js';
import { G } from './game/game.js';
import { loadSprites } from './game/assets.js';

initCanvas();
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let lastTap = 0;

function handleDown(e) {
  const now = Date.now();
  if (now - lastTap < 320 && G.activeBird && G.activeBird.launched) {
    G.activeBird.useAbility();
    lastTap = 0;
    return;
  }
  lastTap = now;
  G.onDown(toCanvas(e));
}

cv.addEventListener('mousedown', handleDown);
cv.addEventListener('mousemove', (e) => G.onMove(toCanvas(e)));
cv.addEventListener('mouseup', () => G.onUp());
cv.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleDown(e);
}, { passive: false });
cv.addEventListener('touchmove', (e) => {
  e.preventDefault();
  G.onMove(toCanvas(e));
}, { passive: false });
cv.addEventListener('touchend', (e) => {
  e.preventDefault();
  G.onUp();
}, { passive: false });

function loop() {
  G.update();
  G.draw();
  requestAnimationFrame(loop);
}

loadSprites()
  .then(() => {
    G.init(1);
    loop();
  })
  .catch((err) => {
    console.warn(err);
    G.init(1);
    loop();
  });
