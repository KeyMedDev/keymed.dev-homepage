// Canal de Twitch de KeyMed.dev.
const TWITCH_URL = 'https://www.twitch.tv/keymeddev';
document.querySelector('#twitch-link').href = TWITCH_URL;
const canvas = document.querySelector('#ascii-background');
const context = canvas.getContext('2d');
const photograph = new Image();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const characters = ' .:2A5X3hMGSH9B#&@';
let cells = [];
let animationFrame = 0;
let lastFrameTime = 0;
let cellWidth;
let cellHeight;

function renderCharacters(time = 0) {
  if (!context) return;
  context.fillStyle = '#071b16';
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);
  for (const cell of cells) {
    // Like the reference project, a travelling wave changes the density ramp.
    // Only the glyph changes: the sampled photograph and grid remain fixed.
    const shimmer = Math.sin(cell.column * .13 + cell.row * .17 + time * .0005) * .045;
    const light = Math.max(0, Math.min(1, cell.brightness + shimmer));
    const character = characters[Math.round(light * (characters.length - 1))];
    context.fillStyle = `rgba(142, 169, 92, ${cell.opacity})`;
    context.fillText(character, cell.column * cellWidth, cell.row * cellHeight);
  }
}

function animateCharacters(time) {
  animationFrame = 0;
  if (reducedMotion.matches || document.hidden || !context || !cells.length) return;
  // Limit repainting to 16 fps; the image sampling is only done on resize.
  if (time - lastFrameTime >= 1000 / 16) {
    lastFrameTime = time;
    renderCharacters(time);
  }
  animationFrame = requestAnimationFrame(animateCharacters);
}

function updateAnimation() {
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  if (!context || !cells.length) return;
  renderCharacters();
  if (!reducedMotion.matches && !document.hidden) {
    lastFrameTime = 0;
    animationFrame = requestAnimationFrame(animateCharacters);
  }
}

function drawLandscape() {
  if (!context || !photograph.complete || !photograph.naturalWidth) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.fillStyle = '#071b16';
  context.fillRect(0, 0, width, height);
  cellWidth = width < 640 ? 6 : 7.5;
  cellHeight = width < 640 ? 10 : 13;
  cells = [];
  const columns = Math.ceil(width / cellWidth);
  const rows = Math.ceil(height / cellHeight);
  const sample = document.createElement('canvas');
  sample.width = columns;
  sample.height = rows;
  const sampler = sample.getContext('2d', { willReadFrequently: true });
  if (!sampler) return;
  const scale = Math.max(width / photograph.width, height / photograph.height);
  const cropWidth = width / scale;
  const cropHeight = height / scale;
  sampler.drawImage(photograph, (photograph.width - cropWidth) / 2,
    (photograph.height - cropHeight) / 2, cropWidth, cropHeight, 0, 0, columns, rows);
  const { data } = sampler.getImageData(0, 0, columns, rows);
  context.font = `400 ${cellHeight}px "JetBrains Mono", monospace`;
  context.textBaseline = 'top';
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const offset = (row * columns + column) * 4;
      const brightness = (data[offset] * .2126 + data[offset + 1] * .7152 + data[offset + 2] * .0722) / 255;
      const variation = ((column * 17 + row * 13) % 7) / 100;
      cells.push({ column, row, brightness, opacity: .21 + brightness * .25 + variation });
    }
  }
  updateAnimation();
}
reducedMotion.addEventListener('change', updateAnimation);
document.addEventListener('visibilitychange', updateAnimation);
photograph.addEventListener('load', () => document.fonts.ready.then(drawLandscape));
photograph.addEventListener('error', () => { canvas.hidden = true; });
photograph.src = new URL('../../assests/images/nature.jpg', import.meta.url).href;
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawLandscape, 120);
});
