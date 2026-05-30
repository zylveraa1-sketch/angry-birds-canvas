import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { circleAABB, aabbOverlap } from '../src/game/collision.js';

describe('collision', () => {
  it('circleAABB returns null when circle misses rect', () => {
    assert.equal(circleAABB(10, 10, 5, 100, 100, 20, 20), null);
  });

  it('circleAABB returns MTV when overlapping', () => {
    const mtv = circleAABB(50, 50, 20, 40, 40, 30, 30);
    assert.ok(mtv);
    assert.ok(mtv.depth > 0);
  });

  it('aabbOverlap detects intersection', () => {
    assert.equal(aabbOverlap(0, 0, 10, 10, 5, 5, 10, 10), true);
    assert.equal(aabbOverlap(0, 0, 10, 10, 20, 20, 10, 10), false);
  });
});
