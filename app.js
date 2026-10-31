(() => {
  'use strict';
  const canvas = document.querySelector('#landscape');
  const ctx = canvas.getContext('2d', { alpha: false });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const config = window.SITE_CONFIG || {};
  const link = document.querySelector('#twitch-link');
  try {
    const url = new URL(config.twitchUrl || 'https://www.twitch.tv/');
    if (url.protocol === 'https:' && /(^|\.)twitch\.tv$/.test(url.hostname)) link.href = url.href;
  } catch { /* Una URL inválida mantiene el enlace seguro a Twitch. */ }
  if (!ctx) return;
  const sample = document.createElement('canvas');
  const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
  if (!sampleCtx) return;
  let width = 0, height = 0, columns = 0, rows = 0, cell = 0, line = 0;
  let pixels, frame = 0, previous = 0, elapsed = 0;
  let ready = false;
  const image = new Image();
  image.decoding = 'async';

  function measure() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = width < 640 ? 6 : 7.5; line = cell * 1.65;
    columns = Math.ceil(width / cell) + 2; rows = Math.ceil(height / line) + 2;
    sample.width = columns; sample.height = rows;
    // Cover: préserver la proporción de la fotografía antes de muestrear.
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sourceWidth = width / scale, sourceHeight = height / scale;
    sampleCtx.drawImage(image,
      (image.naturalWidth - sourceWidth) / 2, (image.naturalHeight - sourceHeight) / 2,
      sourceWidth, sourceHeight, 0, 0, columns, rows);
    pixels = sampleCtx.getImageData(0, 0, columns, rows).data;
    render();
  }
  function render() {
    if (!pixels) return;
    ctx.fillStyle = '#0b241b'; ctx.fillRect(0, 0, width, height);
    ctx.font = `${line}px "JetBrains Mono", monospace`;
    ctx.textBaseline = 'top';
    const time = elapsed / 1000;
    for (let y = 0; y < rows; y++) {
      // Una ondulación pequeña desplaza el muestreo, sin perder la imagen original.
      const drift = Math.sin(y * .11 + time * .18) * 1.1;
      for (let x = 0; x < columns; x++) {
        const sx = Math.max(0, Math.min(columns - 1, Math.round(x + drift)));
        const p = (y * columns + sx) * 4;
        const light = Ascii.luminance(pixels[p], pixels[p + 1], pixels[p + 2]);
        const shimmer = Math.sin(x * .13 + y * .17 + time * .5) * .025;
        ctx.fillStyle = `rgb(${Math.round(79 + light * 67)} ${Math.round(111 + light * 75)} ${Math.round(72 + light * 61)})`;
        ctx.fillText(Ascii.glyph(light + shimmer), x * cell, y * line);
      }
    }
  }
  function tick(now) {
    frame = 0;
    if (!Ascii.shouldAnimate(false, reduced.matches, document.hidden)) return;
    if (!previous) previous = now;
    if (now - previous >= 1000 / 16) {
      elapsed += Math.min(now - previous, 120); previous = now; render();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    if (ready && Ascii.shouldAnimate(false, reduced.matches, document.hidden)) frame = requestAnimationFrame(tick);
  }
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  let resizeTimer;
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (ready) measure(); }, 120); });
  image.onload = async () => {
    await document.fonts.ready;
    try {
      measure(); ready = true; sync();
      canvas.dataset.state = 'ready';
    } catch (error) {
      canvas.dataset.state = 'error'; console.warn('No se pudo leer la fotografía en canvas.', error);
    }
  };
  image.onerror = () => { canvas.dataset.state = 'error'; console.warn('No se pudo cargar la fotografía del paisaje.'); };
  image.src = config.photoUrl || './assets/nature.jpg';
})();
