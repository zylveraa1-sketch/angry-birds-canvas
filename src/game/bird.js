import { WW, GROUND, GRAVITY, BOUNCE, cx } from './config.js';
import { hillSurfaceY } from './terrain.js';
import { BIRD_CENTER_ABOVE_POUCH } from './slingshot.js';
import { spawnP, spawnBoom } from './particles.js';
import { drawBird } from './sprite-bird.js';
import { showHint } from './hint.js';

let gameRef = null;
export function setGameRef(g) {
  gameRef = g;
}

export class Bird {
  constructor(type, x, y) {
    this.type = type;
    this.r = type === 'black' ? 27 : 22;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.launched = false;
    this.dead = false;
    this.trail = [];
    this.abilityUsed = false;
    this.boosted = false;
    this.fuseTimer = 0;
    this.fuseActive = false;
    this.exploding = false;
    this.explodeFrame = 0;
    this.groundHits = 0;
    this.slingGrace = 0;
  }

  launch(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    this.launched = true;
    this.slingGrace = 42;
  }

  useAbility() {
    if (this.abilityUsed || !this.launched || this.dead) return false;
    if (this.type === 'yellow') {
      const spd = Math.hypot(this.vx, this.vy);
      const nx = this.vx / spd;
      const ny = this.vy / spd;
      this.vx = nx * (spd * 2.4 + 3);
      this.vy = ny * (spd * 2.4 + 3);
      this.boosted = true;
      this.abilityUsed = true;
      spawnP(this.x, this.y, '#FFD700', 12, 7);
      showHint('⚡ Ускорение!');
      return true;
    }
    if (this.type === 'black') {
      this.fuseActive = true;
      this.fuseTimer = 35;
      this.abilityUsed = true;
      showHint('💣 Взрыв!');
      return true;
    }
    return false;
  }

  doExplode() {
    spawnBoom(this.x, this.y);
    this.exploding = true;
    this.explodeFrame = 10;
    gameRef.explosionDamage(this.x, this.y, 115);
  }

  update() {
    if (!this.launched || this.dead) return;
    if (this.slingGrace > 0) this.slingGrace--;
    if (this.exploding) {
      this.explodeFrame--;
      if (this.explodeFrame <= 0) this.dead = true;
      return;
    }
    if (this.fuseActive) {
      this.fuseTimer--;
      if (this.fuseTimer <= 0) {
        this.doExplode();
        return;
      }
    }
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 30) this.trail.shift();
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    if (this.y >= GROUND - this.r) {
      this.y = GROUND - this.r;
      const imp = Math.abs(this.vy);
      this.vy *= -BOUNCE * 0.6;
      this.vx *= 0.65;
      this.groundHits++;
      if (imp < 2 || this.groundHits > 2) {
        this.dead = true;
        spawnP(this.x, this.y, '#aaa', 6, 3);
        return;
      }
      spawnP(this.x, this.y, '#aaa', 4, 2);
    }
    if (this.x > WW + 80 || this.x < -80) this.dead = true;
  }

  angle() {
    return this.launched ? Math.atan2(this.vy, this.vx) : 0;
  }

  draw() {
    if (this.dead && !this.exploding) return;
    if (this.exploding) {
      cx.save();
      const ef = this.explodeFrame / 10;
      cx.globalAlpha = ef * 0.9;
      const eg = cx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 115);
      eg.addColorStop(0, '#fff');
      eg.addColorStop(0.25, '#FFE000');
      eg.addColorStop(0.6, '#FF4400');
      eg.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = eg;
      cx.beginPath();
      cx.arc(this.x, this.y, 115, 0, Math.PI * 2);
      cx.fill();
      cx.restore();
      return;
    }
    this.trail.forEach((p, i) => {
      cx.save();
      cx.globalAlpha = (i / this.trail.length) * 0.25;
      cx.fillStyle =
        this.type === 'yellow' ? '#FFD700' : this.type === 'black' ? '#FF6600' : '#FF4444';
      cx.beginPath();
      cx.arc(p.x, p.y, this.r * (i / this.trail.length) * 0.5, 0, Math.PI * 2);
      cx.fill();
      cx.restore();
    });
    let drawY = this.y;
    let anchor = 'center';
    if (!this.launched) {
      anchor = 'feet';
      drawY = this.y + BIRD_CENTER_ABOVE_POUCH;
    } else if (this.y >= GROUND - this.r - 3) {
      anchor = 'feet';
      drawY = hillSurfaceY(this.x);
    }
    drawBird(this.type, this.x, drawY, this.r, this.angle(), {
      boosted: this.boosted,
      fuse: this.fuseActive ? this.fuseTimer / 35 : 0,
      anchor,
    });
  }
}
