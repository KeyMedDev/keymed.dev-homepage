import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/src/styles', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('assests', 'dist/assests', { recursive: true });
await cp('src/js', 'dist/src/js', { recursive: true });
await cp('src/styles/output.css', 'dist/src/styles/output.css');
console.log('Sitio estático preparado en dist/');
