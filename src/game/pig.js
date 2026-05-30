import { cx } from './config.js';
import { rnd } from './utils.js';
import { spawnP } from './particles.js';
import { Body } from './body.js';
import { drawSpriteCentered } from './sprite-draw.js';
import { getPigSprite, getPigAnchor } from './assets.js';

export class Pig extends Body {
  constructor(x, y, r = 22, hp = 1, armor = false) {
    super(x - r, y - r, r * 2, r * 2, armor ? 2.2 : 1.5);
    this.r = r;
    this.hp = hp;
    this.maxHp = hp;
    this.armor = armor;
    this.helmet = armor;
    this.score = armor ? 400 : 200;
  }

  onImpact(force) {
    const dmg = Math.floor(force * 0.4);
    if (dmg > 0) this.takeDmg(dmg);
  }

  takeDmg(d) {
    this.hp -= d;
    this.shakeT = 14;
    spawnP(this.cx, this.cy, '#7EC850', 8);
    if (this.hp <= 0) {
      this.dead = true;
      spawnP(this.cx, this.cy, '#5A9E35', 20);
      return true;
    }
    return false;
  }

  drawHpBar(px, py, r) {
    if (this.maxHp <= 1) return;
    const bw = r * 2.2;
    const bh = 6;
    const bx = px - r * 1.1;
    const by = py - r - 18;
    cx.fillStyle = '#333';
    cx.beginPath();
    cx.roundRect(bx, by, bw, bh, 3);
    cx.fill();
    const ratio = this.hp / this.maxHp;
    cx.fillStyle = ratio > 0.6 ? '#44FF44' : ratio > 0.3 ? '#FFAA00' : '#FF3333';
    cx.beginPath();
    cx.roundRect(bx, by, bw * ratio, bh, 3);
    cx.fill();
  }

  draw() {
    if (this.dead) return;
    const ox = this.shakeT > 0 ? rnd(-3, 3) : 0;
    const px = this.cx + ox;
    const py = this.cy;
    const r = this.r;

    const img = getPigSprite(this.armor);
    const anchor = getPigAnchor(this.armor);
    const footY = py + r;
    if (
      drawSpriteCentered(img, px, footY, r * 2.45, {
        anchor: { cx: anchor.cx, cy: anchor.foot },
      })
    ) {
      this.drawHpBar(px, py, r);
      this.shakeT = Math.max(0, this.shakeT - 1);
      return;
    }

    cx.save();
    cx.translate(px, py);
    cx.save();
    cx.globalAlpha = 0.2;
    cx.fillStyle = '#000';
    cx.beginPath();
    cx.ellipse(0, r + 2, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
    cx.fill();
    cx.restore();

    const g = cx.createRadialGradient(-r * 0.25, -r * 0.28, r * 0.05, 0, 0, r);
    g.addColorStop(0, '#b4ef6a');
    g.addColorStop(0.6, '#7EC850');
    g.addColorStop(1, '#4a9020');
    cx.fillStyle = g;
    cx.beginPath();
    cx.arc(0, 0, r, 0, Math.PI * 2);
    cx.fill();

    if (this.armor) {
      cx.strokeStyle = '#c9a227';
      cx.lineWidth = r * 0.22;
      cx.beginPath();
      cx.arc(0, -r * 0.05, r * 1.05, -Math.PI * 1.08, -Math.PI * 0.02);
      cx.stroke();
    }

    this.drawHpBar(0, 0, r);
    cx.restore();
    this.shakeT = Math.max(0, this.shakeT - 1);
  }
}
