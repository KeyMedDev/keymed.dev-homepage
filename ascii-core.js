(function (root) {
  'use strict';
  const ramp = ' .,:;irsXA253hMHGS#9B&@';
  const api = {
    luminance: (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255,
    glyph: (light) => ramp[Math.round(Math.max(0, Math.min(1, light)) * (ramp.length - 1))],
    shouldAnimate: (paused, reduced, hidden) => !paused && !reduced && !hidden,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Ascii = api;
})(globalThis);
