import { WW, GROUND, GRAVITY, FRICTION, BOUNCE, SLEEP_THRESH } from './config.js';

export class Body {
  constructor(x, y, w, h, mass = 1) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.mass = mass;
    this.sleeping = false;
    this.sleepTimer = 0;
    this.dead = false;
    this.shakeT = 0;
  }

  get cx() {
    return this.x + this.w / 2;
  }

  get cy() {
    return this.y + this.h / 2;
  }

  applyImpulse(ix, iy) {
    this.vx += ix / this.mass;
    this.vy += iy / this.mass;
    this.sleeping = false;
    this.sleepTimer = 0;
  }

  integrate() {
    if (this.dead || this.sleeping) return;
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    if (this.y + this.h >= GROUND) {
      const impact = Math.abs(this.vy);
      this.y = GROUND - this.h;
      this.vy *= -BOUNCE;
      this.vx *= FRICTION;
      if (impact > 3) this.onImpact(impact);
    }
    if (this.x < 0) {
      this.x = 0;
      this.vx = Math.abs(this.vx) * 0.5;
    }
    if (this.x + this.w > WW) {
      this.x = WW - this.w;
      this.vx = -Math.abs(this.vx) * 0.5;
    }

    const spd = Math.hypot(this.vx, this.vy);
    if (spd < SLEEP_THRESH && this.y + this.h >= GROUND - 1) {
      this.sleepTimer++;
      if (this.sleepTimer > 20) {
        this.sleeping = true;
        this.vx = 0;
        this.vy = 0;
      }
    } else {
      this.sleepTimer = 0;
    }

    if (this.shakeT > 0) this.shakeT--;
  }

  onImpact() {}
}
