import { cx } from './config.js';
import { rnd } from './utils.js';
import { spawnP } from './particles.js';
import { Body } from './body.js';

const BLOCK_HP = { wood: 3, stone: 6, ice: 2 };

export class Block extends Body {
  constructor(x, y, w, h, type = 'wood') {
    super(x, y, w, h, type === 'stone' ? 4 : type === 'wood' ? 2 : 1);
    this.type = type;
    this.hp = BLOCK_HP[type];
    this.maxHp = this.hp;
  }

  onImpact(force) {
    const dmg = Math.floor(force * 0.35);
    if (dmg > 0) this.damage(dmg);
  }

  damage(d) {
    this.hp -= d;
    this.shakeT = 10;
    spawnP(
      this.cx,
      this.cy,
      this.type === 'stone' ? '#aaa' : this.type === 'wood' ? '#c8902a' : '#aaddf0',
      6
    );
    if (this.hp <= 0) {
      this.dead = true;
      spawnP(
        this.cx,
        this.cy,
        this.type === 'stone' ? '#999' : this.type === 'wood' ? '#b07820' : '#88ccee',
        16
      );
      return true;
    }
    return false;
  }

  draw() {
    if (this.dead) return;
    const ox = this.shakeT > 0 ? rnd(-2, 2) : 0;
    cx.save();
    cx.translate(ox, 0);
    const fills = { wood: '#D4A55A', stone: '#BBBBBB', ice: '#AADDFF' };
    const strokes = { wood: '#A06820', stone: '#777', ice: '#5599CC' };
    cx.fillStyle = fills[this.type] || fills.wood;
    cx.strokeStyle = strokes[this.type] || strokes.wood;
    cx.lineWidth = 2;
    cx.beginPath();
    cx.roundRect(this.x, this.y, this.w, this.h, 3);
    cx.fill();
    cx.stroke();
    if (this.type === 'wood') {
      cx.strokeStyle = '#A06820AA';
      cx.lineWidth = 1;
      for (let i = 1; i < Math.floor(this.h / 18); i++) {
        const ly = this.y + this.h * (i / Math.floor(this.h / 18));
        cx.beginPath();
        cx.moveTo(this.x + 3, ly);
        cx.lineTo(this.x + this.w - 3, ly);
        cx.stroke();
      }
    }
    if (this.type === 'stone') {
      cx.fillStyle = 'rgba(0,0,0,.07)';
      for (let i = 0; i < 3; i++) {
        cx.fillRect(this.x + rnd(3, this.w - 8), this.y + rnd(3, this.h - 8), rnd(4, 12), rnd(2, 5));
      }
    }
    const ratio = this.hp / this.maxHp;
    if (ratio < 0.7) {
      cx.strokeStyle = 'rgba(0,0,0,.45)';
      cx.lineWidth = 1.5;
      cx.beginPath();
      cx.moveTo(this.x + this.w * 0.25, this.y + 4);
      cx.lineTo(this.x + this.w * 0.5, this.y + this.h * 0.45);
      cx.lineTo(this.x + this.w * 0.72, this.y + this.h - 4);
      cx.stroke();
    }
    if (ratio < 0.4) {
      cx.strokeStyle = 'rgba(0,0,0,.4)';
      cx.lineWidth = 1.5;
      cx.beginPath();
      cx.moveTo(this.x + this.w * 0.6, this.y + 4);
      cx.lineTo(this.x + this.w * 0.35, this.y + this.h * 0.55);
      cx.lineTo(this.x + this.w * 0.55, this.y + this.h - 4);
      cx.stroke();
    }
    cx.restore();
  }
}
