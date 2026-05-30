import { WW, HH, GROUND, GRAVITY, cx, SL, FRICTION, BOUNCE } from './config.js';
import { dist } from './utils.js';
import { circleAABB, aabbOverlap } from './collision.js';
import { spawnP, tickParts, drawParts, clearEffects } from './particles.js';
import { Bird, setGameRef } from './bird.js';
import { drawBird } from './sprite-bird.js';
import { hillSurfaceY } from './terrain.js';
import {
  drawSlingFrame,
  drawSlingBandBack,
  drawSlingBandFront,
  slingBirdPos,
  slingPouchRest,
  constrainPull,
  collideCircleWithSling,
  collideBirdWithSling,
  collideBlockWithSling,
  BIRD_CENTER_ABOVE_POUCH,
  birdPouchPoint,
  birdCenterFromPouch,
} from './slingshot.js';
import { drawClouds } from './clouds.js';
import { drawGround } from './ground.js';
import { makeLevel } from './levels.js';
import { showHint, tickHint } from './hint.js';
import { ASSET_VER, SPRITES_BASE } from './assets.js';

function starImg(filled, index = 0) {
  const base = filled
    ? 'opacity:1'
    : 'opacity:0.3;filter:grayscale(1) brightness(1.2)';
  const spin = filled
    ? `transform:rotate(${((G.starAnim * 40 + index * 55) % 360)}deg);`
    : '';
  return `<img class="star-icon" src="${SPRITES_BASE}star.png?v=${ASSET_VER}" alt="" style="${base};${spin}">`;
}

export const G = {
  level: 1,
  score: 0,
  birds: [],
  pigs: [],
  blocks: [],
  activeBird: null,
  birdTypes: [],
  birdIdx: 0,
  dragging: false,
  dragX: 0,
  dragY: 0,
  grabDx: 0,
  grabDy: 0,
  state: 'playing',
  starAnim: 0,
  _advancing: false,

  init(lvl) {
    if (lvl !== undefined) this.level = lvl;
    const def = makeLevel(this.level);
    this.pigs = def.pigs;
    this.blocks = def.blocks;
    this.birdTypes = def.birds;
    this.birdIdx = 0;
    this.birds = [];
    this.score = 0;
    this.dragging = false;
    this.state = 'playing';
    this._advancing = false;
    clearEffects();
    document.getElementById('overlay').classList.remove('show');
    document.getElementById('lvlsel').classList.remove('show');
    this.spawnNext();
    this.updateHUD();
  },

  spawnNext() {
    if (this.birdIdx >= this.birdTypes.length) {
      this.activeBird = null;
      return;
    }
    const t = this.birdTypes[this.birdIdx++];
    const pouch = slingPouchRest();
    const b = new Bird(t, pouch.x, pouch.y - BIRD_CENTER_ABOVE_POUCH);
    this.birds.push(b);
    this.activeBird = b;
    const hints = {
      red: '🔴 Красная — просто летит',
      yellow: '🟡 Жёлтая — двойной клик = ускорение',
      black: '⚫ Чёрная — двойной клик = взрыв',
    };
    showHint(hints[t] || '');
  },

  updateHUD() {
    document.getElementById('h-score').textContent = this.score;
    document.getElementById('h-level').textContent = this.level;
    const bq = document.getElementById('bird-queue');
    bq.innerHTML = '';
    this.birdTypes.slice(this.birdIdx).forEach((t) => {
      const d = document.createElement('div');
      d.className = `bq bq-${t}`;
      bq.appendChild(d);
    });
    const killed = this.pigs.filter((p) => p.dead).length;
    for (let i = 1; i <= 3; i++) {
      document.getElementById('s' + i).innerHTML = starImg(killed >= i, i - 1);
    }
  },

  getStars() {
    return Math.min(3, this.pigs.filter((p) => p.dead).length);
  },

  explosionDamage(ex, ey, rad) {
    for (const p of this.pigs) {
      if (p.dead) continue;
      const d = Math.max(0, dist({ x: ex, y: ey }, { x: p.cx, y: p.cy }) - p.r);
      if (d < rad) {
        const dmg = Math.ceil((1 - d / rad) * 5);
        const dir = { x: p.cx - ex, y: p.cy - ey };
        const dl = Math.hypot(dir.x, dir.y) || 1;
        const force = (1 - d / rad) * 22;
        p.vx += (dir.x / dl) * force;
        p.vy += (dir.y / dl) * force - 8;
        p.sleeping = false;
        const k = p.takeDmg(dmg);
        if (k) this.score += 300;
      }
    }
    for (const bl of this.blocks) {
      if (bl.dead) continue;
      const d = Math.max(0, dist({ x: ex, y: ey }, { x: bl.cx, y: bl.cy }) - 20);
      if (d < rad) {
        const force = (1 - d / rad) * 18;
        const dir = { x: bl.cx - ex, y: bl.cy - ey };
        const dl = Math.hypot(dir.x, dir.y) || 1;
        bl.vx += (dir.x / dl) * force;
        bl.vy += (dir.y / dl) * force - 6;
        bl.sleeping = false;
        const dmg = Math.ceil((1 - d / rad) * 4);
        const k = bl.damage(dmg);
        if (k) this.score += 60;
      }
    }
    this.updateHUD();
  },

  physicsStep() {
    for (const bl of this.blocks) bl.integrate();
    for (const p of this.pigs) p.integrate();

    for (const bl of this.blocks) {
      if (!bl.dead) collideBlockWithSling(bl);
    }
    for (const p of this.pigs) {
      if (p.dead) continue;
      const mtv = collideCircleWithSling(p.cx, p.cy, p.r + 2);
      if (!mtv) continue;
      p.x += mtv.nx * mtv.depth;
      p.y += mtv.ny * mtv.depth;
      const imp = p.vx * mtv.nx + p.vy * mtv.ny;
      p.vx -= (1 + BOUNCE) * imp * mtv.nx;
      p.vy -= (1 + BOUNCE) * imp * mtv.ny;
      p.vx *= FRICTION;
      p.sleeping = false;
    }

    for (let i = 0; i < this.blocks.length; i++) {
      const a = this.blocks[i];
      if (a.dead) continue;
      for (let j = i + 1; j < this.blocks.length; j++) {
        const b = this.blocks[j];
        if (b.dead) continue;
        if (!aabbOverlap(a.x, a.y, a.w, a.h, b.x, b.y, b.w, b.h)) continue;
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ox < oy) {
          const d = ox * 0.5;
          const sign = a.cx < b.cx ? -1 : 1;
          if (!a.sleeping) {
            a.x += sign * d;
            const imp = Math.abs(a.vx);
            a.vx *= -0.4;
            if (imp > 3) a.damage(Math.floor(imp * 0.3));
          }
          if (!b.sleeping) {
            b.x -= sign * d;
            const imp = Math.abs(b.vx);
            b.vx *= -0.4;
            if (imp > 3) b.damage(Math.floor(imp * 0.3));
          }
        } else {
          const sign = a.cy < b.cy ? -1 : 1;
          if (!a.sleeping && sign < 0) {
            a.y += sign * oy * 0.5;
            const imp = Math.abs(a.vy);
            a.vy *= -0.35;
            if (imp > 3) a.damage(Math.floor(imp * 0.3));
          }
          if (!b.sleeping && sign > 0) {
            b.y -= sign * oy * 0.5;
            const imp = Math.abs(b.vy);
            b.vy *= -0.35;
            if (imp > 3) b.damage(Math.floor(imp * 0.3));
          }
        }
      }
    }

    for (const p of this.pigs) {
      if (p.dead) continue;
      for (const bl of this.blocks) {
        if (bl.dead) continue;
        const mtv = circleAABB(p.cx, p.cy, p.r + 2, bl.x, bl.y, bl.w, bl.h);
        if (!mtv) continue;
        p.x += mtv.nx * mtv.depth;
        p.y += mtv.ny * mtv.depth;
        const imp = Math.abs(p.vx * mtv.nx + p.vy * mtv.ny);
        const dot = p.vx * mtv.nx + p.vy * mtv.ny;
        p.vx -= (1 + BOUNCE) * dot * mtv.nx;
        p.vy -= (1 + BOUNCE) * dot * mtv.ny;
        p.vx *= FRICTION;
        if (imp > 3) {
          const k = p.takeDmg(Math.floor(imp * 0.45));
          if (k) this.score += 200;
          this.updateHUD();
        }
        p.sleeping = false;
      }
    }
  },

  birdCollision() {
    const ab = this.activeBird;
    if (!ab || !ab.launched || ab.dead || ab.exploding) return;
    const spd = Math.hypot(ab.vx, ab.vy);
    const dmg = Math.max(1, Math.floor(spd * 0.35));

    const slingHit = collideBirdWithSling(ab);
    if (slingHit) {
      ab.x += slingHit.nx * slingHit.depth;
      ab.y += slingHit.ny * slingHit.depth;
      const imp = ab.vx * slingHit.nx + ab.vy * slingHit.ny;
      ab.vx -= 1.4 * imp * slingHit.nx;
      ab.vy -= 1.4 * imp * slingHit.ny;
      if (spd > 5) spawnP(ab.x, ab.y, '#8B6914', 4);
      return;
    }

    for (const p of this.pigs) {
      if (p.dead) continue;
      if (dist(ab, { x: p.cx, y: p.cy }) < ab.r + p.r) {
        const k = p.takeDmg(dmg);
        if (k) this.score += 200;
        const dx = p.cx - ab.x;
        const dy = p.cy - ab.y;
        const dl = Math.hypot(dx, dy) || 1;
        p.vx += (dx / dl) * spd * 0.5;
        p.vy += (dy / dl) * spd * 0.5 - 4;
        p.sleeping = false;
        ab.dead = true;
        spawnP(ab.x, ab.y, '#FF8844', 14);
        this.updateHUD();
        return;
      }
    }

    for (const bl of this.blocks) {
      if (bl.dead) continue;
      const mtv = circleAABB(ab.x, ab.y, ab.r, bl.x, bl.y, bl.w, bl.h);
      if (!mtv) continue;
      ab.x += mtv.nx * mtv.depth;
      ab.y += mtv.ny * mtv.depth;
      const imp = ab.vx * mtv.nx + ab.vy * mtv.ny;
      bl.vx -= mtv.nx * spd * 0.6;
      bl.vy -= mtv.ny * spd * 0.6 - 3;
      bl.sleeping = false;
      const k = bl.damage(dmg);
      if (k) this.score += 50;
      ab.vx -= 1.6 * imp * mtv.nx;
      ab.vy -= 1.6 * imp * mtv.ny;
      ab.vx *= 0.6;
      ab.vy *= 0.6;
      ab.groundHits++;
      if (ab.groundHits > 1) {
        ab.dead = true;
        spawnP(ab.x, ab.y, '#CC8844', 10);
      }
      this.updateHUD();
      return;
    }
  },

  checkEnd() {
    if (this.state !== 'playing') return;
    if (this.pigs.filter((p) => !p.dead).length === 0) {
      const rem =
        this.birdTypes.length - this.birdIdx +
        (!this.activeBird || this.activeBird.launched ? 0 : 1);
      this.score += rem * 500;
      this.state = 'win';
      this.updateHUD();
      setTimeout(() => this.showResult(true), 1000);
      return;
    }
    if (!this.activeBird && !this._advancing) {
      this.state = 'lose';
      setTimeout(() => this.showResult(false), 1000);
    }
  },

  showResult(win) {
    const stars = win ? this.getStars() : 0;
    const key = 'ab_l' + this.level;
    const prev = parseInt(localStorage.getItem(key) || '0', 10);
    if (stars > prev) localStorage.setItem(key, stars);
    const best = Math.max(stars, prev);
    document.getElementById('ov-title').textContent = win ? 'Победа! 🎉' : 'Проигрыш 😢';
    const ovStars = document.getElementById('ov-stars');
    ovStars.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      ovStars.innerHTML += starImg(win && i < stars, i);
    }
    document.getElementById('ov-score').textContent = this.score;
    const ovBest = document.getElementById('ov-best');
    ovBest.innerHTML = 'Рекорд: ';
    for (let i = 0; i < 3; i++) {
      ovBest.innerHTML += starImg(i < best, i);
    }
    const nb = document.getElementById('ov-next');
    if (win && this.level < 5) {
      nb.textContent = 'Далее ▶';
      nb.onclick = () => {
        G.init(G.level + 1);
      };
    } else {
      nb.textContent = 'Заново 🔄';
      nb.onclick = () => G.init();
    }
    document.getElementById('overlay').classList.add('show');
  },

  showLevelSel() {
    document.getElementById('overlay').classList.remove('show');
    const grid = document.getElementById('ls-grid');
    grid.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const st = parseInt(localStorage.getItem('ab_l' + i) || '0', 10);
      const btn = document.createElement('div');
      btn.className = 'ls-btn';
      btn.innerHTML = `<span>${i}</span><span class="ls-stars-sm">${'⭐'.repeat(st)}${'☆'.repeat(3 - st)}</span>`;
      btn.onclick = () => G.init(i);
      grid.appendChild(btn);
    }
    document.getElementById('lvlsel').classList.add('show');
  },

  onDown(e) {
    if (this.state !== 'playing') return;
    const { x, y } = e;
    if (this.activeBird && this.activeBird.launched) {
      this.activeBird.useAbility();
      return;
    }
    if (!this.activeBird || this.activeBird.launched) return;
    const hit = dist({ x, y }, { x: this.activeBird.x, y: this.activeBird.y });
    const pouchPt = birdPouchPoint(this.activeBird);
    const hitPouch = dist({ x, y }, pouchPt);
    if (hit < 50 || hitPouch < 44) {
      this.dragging = true;
      this.grabDx = x - pouchPt.x;
      this.grabDy = y - pouchPt.y;
      this.dragX = this.activeBird.x;
      this.dragY = this.activeBird.y;
    }
  },

  onMove(e) {
    if (!this.dragging) return;
    const { x, y } = e;
    const pt = constrainPull(x - this.grabDx, y - this.grabDy);
    const c = birdCenterFromPouch(pt.x, pt.y);
    this.dragX = c.x;
    this.dragY = c.y;
    if (this.activeBird) {
      this.activeBird.x = c.x;
      this.activeBird.y = c.y;
    }
  },

  onUp() {
    if (!this.dragging || !this.activeBird) return;
    this.dragging = false;
    const rest = slingPouchRest();
    const pull = birdPouchPoint(this.activeBird);
    const dx = rest.x - pull.x;
    const dy = rest.y - pull.y;
    const pw = 0.22;
    this.activeBird.launch(dx * pw, dy * pw - 0.5);
  },

  update() {
    this.starAnim += 0.14;
    if (this.state !== 'playing') return;
    for (const b of this.birds) b.update();
    this.physicsStep();
    this.birdCollision();
    tickParts();
    tickHint();
    if (this.activeBird && this.activeBird.dead && !this._advancing) {
      this._advancing = true;
      setTimeout(() => {
        this._advancing = false;
        this.spawnNext();
        this.updateHUD();
      }, 750);
      this.activeBird = null;
    }
    this.checkEnd();
  },

  draw() {
    const sky = cx.createLinearGradient(0, 0, 0, HH);
    sky.addColorStop(0, '#3A7DC9');
    sky.addColorStop(0.6, '#87CEEB');
    cx.fillStyle = sky;
    cx.fillRect(0, 0, WW, HH);

    cx.fillStyle = '#5aa038';
    cx.beginPath();
    cx.moveTo(0, GROUND + 15);
    const hills = [
      [60, GROUND - 55],
      [160, GROUND - 30],
      [280, GROUND - 70],
      [430, GROUND - 40],
      [560, GROUND - 80],
      [680, GROUND - 35],
      [800, GROUND - 60],
      [WW, GROUND - 20],
    ];
    hills.forEach((h) => cx.lineTo(h[0], h[1]));
    cx.lineTo(WW, HH);
    cx.lineTo(0, HH);
    cx.closePath();
    cx.fill();

    drawClouds();
    drawGround();

    drawSlingFrame();

    for (const bl of this.blocks) bl.draw();
    for (const p of this.pigs) p.draw();

    const bp = slingBirdPos(
      !this.activeBird || this.activeBird.launched ? null : this.activeBird,
      this.dragging,
      this.dragX,
      this.dragY
    );
    drawSlingBandBack(bp.x, bp.y);

    for (const b of this.birds) b.draw();

    drawSlingBandFront(bp.x, bp.y);

    if (this.dragging && this.activeBird) {
      const rest = slingPouchRest();
      const pull = birdPouchPoint(this.activeBird);
      const dx = rest.x - pull.x;
      const dy = rest.y - pull.y;
      const pw = 0.22;
      let px = pull.x;
      let py = pull.y;
      let vx = dx * pw;
      let vy = dy * pw - 0.5;
      cx.save();
      cx.strokeStyle = 'rgba(255,255,255,.4)';
      cx.setLineDash([5, 9]);
      cx.lineWidth = 2;
      cx.beginPath();
      cx.moveTo(px, py);
      for (let i = 0; i < 42; i++) {
        vy += GRAVITY;
        px += vx;
        py += vy;
        if (py > GROUND) break;
        cx.lineTo(px, py);
      }
      cx.stroke();
      cx.restore();
    }

    const waiting = this.birdTypes.slice(this.birdIdx);
    waiting.forEach((t, i) => {
      const wx = SL.x - 36 - i * 38;
      const r = t === 'black' ? 16 : 14;
      drawBird(t, wx, hillSurfaceY(wx), r, 0, { anchor: 'feet' });
    });

    drawParts();
  },
};

setGameRef(G);

// Глобально для onclick в HTML
if (typeof window !== 'undefined') {
  window.G = G;
}
