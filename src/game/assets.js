export const SPRITES_BASE = `${import.meta.env.BASE_URL}assets/sprites/`;
const BASE = SPRITES_BASE;
export const ASSET_VER = '25';

export const SPRITE_FILES = {
  birdRed: 'bird-red.png',
  birdYellow: 'bird-yellow.png',
  birdBlack: 'bird-black.png',
  slingshot: 'slingshot.png',
  pig: 'pig.png',
  pigHelmet: 'pig-helmet.png',
  star: 'star.png',
  groundGrass: 'ground-grass.png',
  explosion1: 'explosion-1.png',
  explosion2: 'explosion-2.png',
  explosion3: 'explosion-3.png',
};

export const sprites = {
  birdRed: null,
  birdYellow: null,
  birdBlack: null,
  slingshot: null,
  pig: null,
  pigHelmet: null,
  star: null,
  groundGrass: null,
  explosion1: null,
  explosion2: null,
  explosion3: null,
};

export const birdAnchor = {
  red: { cx: 0.5, cy: 0.5, foot: 0.85 },
  yellow: { cx: 0.5, cy: 0.5, foot: 0.85 },
  black: { cx: 0.54, cy: 0.47, foot: 0.84 },
};

export const pigAnchor = {
  normal: { cx: 0.5, cy: 0.52, foot: 0.88 },
  armor: { cx: 0.5, cy: 0.5, foot: 0.88 },
};

/** Нижняя точка рогатки в долях высоты PNG (для посадки на землю) */
export const slingMetrics = { footNy: 1, anchorNx: 99.5 / 207 };

let ready = false;

function measureAnchor(img) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const data = g.getImageData(0, 0, w, h).data;
  let x0 = w;
  let y0 = h;
  let x1 = 0;
  let y1 = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 24) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 <= x0) return { cx: 0.5, cy: 0.5, foot: 0.85 };
  return {
    cx: (x0 + x1) / 2 / w,
    cy: (y0 + y1) / 2 / h,
    foot: y1 / h,
  };
}

function loadImage(key, file, onLoad) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      sprites[key] = img;
      if (onLoad) onLoad(img);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = `${BASE}${file}?v=${ASSET_VER}`;
  });
}

export function loadSprites() {
  if (ready) return Promise.resolve();
  return Promise.all([
    loadImage('birdRed', SPRITE_FILES.birdRed, (img) => {
      birdAnchor.red = measureAnchor(img);
    }),
    loadImage('birdYellow', SPRITE_FILES.birdYellow, (img) => {
      birdAnchor.yellow = measureAnchor(img);
    }),
    loadImage('birdBlack', SPRITE_FILES.birdBlack, (img) => {
      birdAnchor.black = measureAnchor(img);
    }),
    loadImage('slingshot', SPRITE_FILES.slingshot, (img) => {
      const a = measureAnchor(img);
      slingMetrics.footNy = a.foot;
      slingMetrics.anchorNx = a.cx;
    }),
    loadImage('pig', SPRITE_FILES.pig, (img) => {
      const a = measureAnchor(img);
      pigAnchor.normal = { cx: a.cx, cy: a.cy, foot: a.foot };
    }),
    loadImage('pigHelmet', SPRITE_FILES.pigHelmet, (img) => {
      const a = measureAnchor(img);
      pigAnchor.armor = { cx: a.cx, cy: a.cy, foot: a.foot };
    }),
    loadImage('star', SPRITE_FILES.star),
    loadImage('groundGrass', SPRITE_FILES.groundGrass),
    loadImage('explosion1', SPRITE_FILES.explosion1),
    loadImage('explosion2', SPRITE_FILES.explosion2),
    loadImage('explosion3', SPRITE_FILES.explosion3),
  ]).then(() => {
    ready = true;
  });
}

export function getBirdSprite(type) {
  if (type === 'red') return sprites.birdRed;
  if (type === 'yellow') return sprites.birdYellow;
  if (type === 'black') return sprites.birdBlack;
  return null;
}

export function getBirdAnchor(type) {
  return birdAnchor[type] || { cx: 0.5, cy: 0.5, foot: 0.85 };
}

export function getSlingshotSprite() {
  return sprites.slingshot;
}

export function getPigSprite(armor = false) {
  return armor ? sprites.pigHelmet : sprites.pig;
}

export function getPigAnchor(armor = false) {
  return armor ? pigAnchor.armor : pigAnchor.normal;
}

export function getStarSprite() {
  return sprites.star;
}

export function getGroundGrassSprite() {
  return sprites.groundGrass;
}

/** Кадры взрыва из ассет-пака (explosion-1 → 3) */
export function getExplosionFrame(index) {
  if (index <= 0) return sprites.explosion1;
  if (index === 1) return sprites.explosion2;
  return sprites.explosion3;
}
