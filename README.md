# KeyMed.dev

HTML semántico, Tailwind CSS y JavaScript puro. Fondo ASCII generado desde la fotografía local, con fuente local y diseño adaptable.

## Desarrollo

Ejecuta `npm install` y `npm run dev` para compilar los estilos y observar cambios. Sirve la raíz con un servidor HTTP (por ejemplo `python -m http.server 3000`) y abre `http://localhost:3000`. Canvas necesita leer la imagen desde HTTP.

## Vercel y GitHub

Sube esta carpeta a GitHub e importa el repositorio en Vercel. `vercel.json` configura `npm run build` y el directorio público `dist`. No requiere backend ni variables de entorno. Para compilar localmente, usa `npm install` seguido de `npm run build`. Conserva el `package-lock.json` que genera la instalación en GitHub; a partir de entonces puedes instalar con `npm ci`.

## Estructura

- `index.html`: conserva main, section, article, div y footer; añade header.
- `src/styles/input.css`: Tailwind y ajustes visuales.
- `src/styles/output.css`: CSS compilado.
- `src/js/main.js`: generación del fondo y URL de Twitch.
- `assests/images/`: fotografía y favicon.
- `assests/fotns/`: fuente local. Se conservan los nombres originales de las carpetas.
- `scripts/build.js`: prepara la carpeta de producción.

Personaliza `TWITCH_URL` en `src/js/main.js` y el href de respaldo en `index.html` con tu canal. Actualmente apuntan a https://www.twitch.tv/keymeddev. Los textos de muestra se conservan como en la referencia. Una onda suave cambia los caracteres de toda la cuadrícula sin desplazar la imagen; la animación está limitada a 16 fps, se pausa al ocultar la pestaña y se desactiva con la preferencia de movimiento reducido. Ejecuta `npm test` para comprobar los cambios entre fotogramas y las pausas de animación.

## Verificación en este entorno

Se incluyen estilos locales en `output.css` para visualizar la página sin descargar dependencias. `npm run build` reemplaza ese archivo con la compilación real de Tailwind. La instalación de npm quedó bloqueada por la red del entorno, por lo que la compilación completa de Tailwind está pendiente de ejecutarse con acceso al registro npm. El empaquetado estático se comprobó con `node scripts/build.js`, junto con la sintaxis de ambos archivos JavaScript y las respuestas HTTP de los recursos locales. No fue posible hacer una inspección visual en navegador porque la integración de navegador no estaba disponible.
