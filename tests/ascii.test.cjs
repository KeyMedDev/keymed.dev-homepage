const { test } = require('node:test');
const assert = require('node:assert/strict');
const { luminance, glyph, shouldAnimate } = require('../ascii-core.js');

test('black and white produce opposite ends of the character density ramp', () => {
  assert.equal(glyph(luminance(0, 0, 0)), ' ');
  assert.equal(glyph(luminance(255, 255, 255)), '@');
  assert.notEqual(glyph(luminance(60, 60, 60)), glyph(luminance(200, 200, 200)));
});
test('perceived luminance gives green more weight than red and blue', () => {
  assert.ok(luminance(0, 255, 0) > luminance(255, 0, 0));
  assert.ok(luminance(255, 0, 0) > luminance(0, 0, 255));
});
test('motion stops when paused, reduced motion is enabled, or the tab is hidden', () => {
  assert.equal(shouldAnimate(false, false, false), true);
  assert.equal(shouldAnimate(true, false, false), false);
  assert.equal(shouldAnimate(false, true, false), false);
  assert.equal(shouldAnimate(false, false, true), false);
});
