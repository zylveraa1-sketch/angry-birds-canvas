import { WW, GROUND } from './config.js';
import { Block } from './block.js';
import { Pig } from './pig.js';

export function makeLevel(n) {
  const blocks = [];
  const pigs = [];
  const OX = WW * 0.5;

  if (n === 1) {
    blocks.push(new Block(OX, GROUND - 80, 18, 80, 'wood'));
    blocks.push(new Block(OX + 18, GROUND - 80, 18, 80, 'wood'));
    blocks.push(new Block(OX - 2, GROUND - 98, 40, 18, 'wood'));
    pigs.push(new Pig(OX + 18, GROUND - 120, 20, 1));
    blocks.push(new Block(OX + 140, GROUND - 60, 18, 60, 'wood'));
    blocks.push(new Block(OX + 158, GROUND - 60, 18, 60, 'wood'));
    blocks.push(new Block(OX + 138, GROUND - 78, 40, 18, 'wood'));
    pigs.push(new Pig(OX + 158, GROUND - 100, 20, 1));
    pigs.push(new Pig(OX + 300, GROUND - 22, 22, 1));
    return { blocks, pigs, birds: ['red', 'red', 'yellow'] };
  }

  if (n === 2) {
    blocks.push(new Block(OX, GROUND - 20, 140, 20, 'stone'));
    blocks.push(new Block(OX, GROUND - 100, 18, 80, 'wood'));
    blocks.push(new Block(OX + 122, GROUND - 100, 18, 80, 'wood'));
    blocks.push(new Block(OX, GROUND - 118, 140, 18, 'wood'));
    pigs.push(new Pig(OX + 70, GROUND - 145, 24, 2));
    blocks.push(new Block(OX + 200, GROUND - 70, 18, 70, 'wood'));
    blocks.push(new Block(OX + 228, GROUND - 70, 18, 70, 'wood'));
    blocks.push(new Block(OX + 198, GROUND - 88, 50, 18, 'wood'));
    pigs.push(new Pig(OX + 223, GROUND - 112, 20, 1));
    pigs.push(new Pig(OX + 320, GROUND - 22, 22, 1));
    return { blocks, pigs, birds: ['red', 'yellow', 'black'] };
  }

  if (n === 3) {
    blocks.push(new Block(OX, GROUND - 22, 200, 22, 'ice'));
    blocks.push(new Block(OX, GROUND - 122, 20, 100, 'ice'));
    blocks.push(new Block(OX + 180, GROUND - 122, 20, 100, 'ice'));
    blocks.push(new Block(OX, GROUND - 142, 200, 20, 'ice'));
    pigs.push(new Pig(OX + 100, GROUND - 168, 26, 2, true));
    blocks.push(new Block(OX + 260, GROUND - 130, 20, 130, 'stone'));
    blocks.push(new Block(OX + 310, GROUND - 130, 20, 130, 'stone'));
    blocks.push(new Block(OX + 258, GROUND - 150, 74, 22, 'stone'));
    pigs.push(new Pig(OX + 295, GROUND - 178, 24, 3, true));
    pigs.push(new Pig(OX + 380, GROUND - 22, 22, 1));
    return { blocks, pigs, birds: ['yellow', 'black', 'red', 'yellow'] };
  }

  if (n === 4) {
    blocks.push(new Block(OX, GROUND - 22, 320, 22, 'stone'));
    for (let c = 0; c < 3; c++) {
      const cx2 = OX + c * 120;
      blocks.push(new Block(cx2, GROUND - 122, 22, 100, 'stone'));
      blocks.push(new Block(cx2 + 98, GROUND - 122, 22, 100, 'stone'));
      blocks.push(new Block(cx2, GROUND - 142, 120, 20, 'wood'));
      blocks.push(new Block(cx2, GROUND - 202, 20, 60, 'wood'));
      blocks.push(new Block(cx2 + 100, GROUND - 202, 20, 60, 'wood'));
      blocks.push(new Block(cx2, GROUND - 222, 120, 20, 'wood'));
      pigs.push(new Pig(cx2 + 60, GROUND - 245, 22, c === 1 ? 3 : 2, c === 1));
    }
    pigs.push(new Pig(OX + 160, GROUND - 50, 28, 4, true));
    return { blocks, pigs, birds: ['black', 'yellow', 'black', 'red', 'yellow'] };
  }

  blocks.push(new Block(OX, GROUND - 22, 380, 22, 'stone'));
  blocks.push(new Block(OX, GROUND - 182, 22, 160, 'stone'));
  blocks.push(new Block(OX + 358, GROUND - 182, 22, 160, 'stone'));
  blocks.push(new Block(OX, GROUND - 202, 380, 22, 'stone'));
  blocks.push(new Block(OX, GROUND - 322, 22, 120, 'stone'));
  blocks.push(new Block(OX + 358, GROUND - 322, 22, 120, 'stone'));
  blocks.push(new Block(OX, GROUND - 344, 380, 22, 'stone'));
  blocks.push(new Block(OX + 120, GROUND - 122, 20, 100, 'wood'));
  blocks.push(new Block(OX + 240, GROUND - 122, 20, 100, 'wood'));
  blocks.push(new Block(OX + 120, GROUND - 302, 20, 100, 'wood'));
  blocks.push(new Block(OX + 240, GROUND - 302, 20, 100, 'wood'));
  pigs.push(new Pig(OX + 60, GROUND - 50, 26, 2));
  pigs.push(new Pig(OX + 190, GROUND - 50, 30, 5, true));
  pigs.push(new Pig(OX + 320, GROUND - 50, 26, 2));
  pigs.push(new Pig(OX + 60, GROUND - 230, 24, 3, true));
  pigs.push(new Pig(OX + 190, GROUND - 230, 28, 6, true));
  pigs.push(new Pig(OX + 320, GROUND - 230, 24, 3, true));
  pigs.push(new Pig(OX + 190, GROUND - 370, 32, 8, true));
  return { blocks, pigs, birds: ['black', 'yellow', 'black', 'yellow', 'black', 'red'] };
}
