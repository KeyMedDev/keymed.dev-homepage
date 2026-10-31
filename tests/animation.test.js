import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Exercise the real entry point with a canvas recorder and a controlled clock.
async function openPage(reduced = false) {
  const frames = new Map();
  const listeners = {};
  let nextId = 0;
  function makeCanvas() {
    const glyphs = new Map();
    const canvas = { width: 0, height: 0, hidden: false };
    const context = {
      setTransform() {},
      fillRect(x, y, width, height) {
        if (x === 0 && y === 0 && width >= 300 && height >= 200) glyphs.clear();
      },
      fillText(glyph, x, y) { glyphs.set(`${x},${y}`, glyph); },
      drawImage(image) {
        if (image.glyphs) {
          glyphs.clear();
          for (const [key, value] of image.glyphs) glyphs.set(key, value);
        }
      },
      getImageData() {
        const data = new Uint8ClampedArray(canvas.width * canvas.height * 4);
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i + 1] = data[i + 2] = 80 + (i / 4 % 160);
          data[i + 3] = 255;
        }
        return { data };
      },
    };
    canvas.glyphs = glyphs;
    canvas.getContext = () => context;
    return canvas;
  }
  const canvas = makeCanvas();
  const motion = { matches: reduced, addEventListener() {} };
  const document = {
    hidden: false,
    querySelector: selector => selector === '#ascii-background' ? canvas : {},
    createElement: makeCanvas,
    fonts: { ready: Promise.resolve() },
    addEventListener: (name, callback) => { listeners[name] = callback; },
  };
  class Image {
    complete = true;
    naturalWidth = 1000;
    naturalHeight = 800;
    width = 1000;
    height = 800;
    addEventListener(name, callback) { this[name] = callback; }
    set src(value) { this.load(); }
  }
  const sandbox = vm.createContext({
    document, Image, URL, console, setTimeout, clearTimeout,
    window: { innerWidth: 360, innerHeight: 240, devicePixelRatio: 1,
      matchMedia: () => motion, addEventListener() {} },
    requestAnimationFrame: callback => { frames.set(++nextId, callback); return nextId; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  const source = await readFile(new URL('../src/js/main.js', import.meta.url), 'utf8');
  const module = new vm.SourceTextModule(source, {
    context: sandbox,
    initializeImportMeta: meta => { meta.url = new URL('../src/js/main.js', import.meta.url).href; },
  });
  await module.link(() => {});
  await module.evaluate();
  await Promise.resolve();
  return {
    canvas, document, listeners, frames,
    tick(time) {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(callback => callback(time));
    },
  };
}

test('characters visibly evolve across the field while grid coordinates stay fixed', async () => {
  const page = await openPage();
  page.tick(100);
  const before = new Map(page.canvas.glyphs);
  page.tick(4100);
  const after = page.canvas.glyphs;
  assert.ok(before.size > 500, 'the photo must be rendered');
  assert.deepEqual([...after.keys()], [...before.keys()], 'the grid must not move');
  const changed = [...before].filter(([key, glyph]) => after.get(key) !== glyph).length;
  assert.ok(changed / before.size > .15, `only ${changed}/${before.size} characters changed`);
});

test('reduced motion leaves a complete static landscape', async () => {
  const page = await openPage(true);
  assert.ok(page.canvas.glyphs.size > 500);
  assert.equal(page.frames.size, 0);
});

test('animation pauses when the tab is hidden and resumes on return', async () => {
  const page = await openPage();
  assert.equal(page.frames.size, 1);
  page.document.hidden = true;
  page.listeners.visibilitychange();
  assert.equal(page.frames.size, 0);
  page.document.hidden = false;
  page.listeners.visibilitychange();
  assert.equal(page.frames.size, 1);
});
