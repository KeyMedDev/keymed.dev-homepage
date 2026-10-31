# Coming soon

Página estática local. No se ha registrado, publicado ni conectado un dominio.

## Abrir

En esta carpeta, ejecuta `npm.cmd start` (o `node server.cjs`) y abre **http://localhost:3000**.
No necesitas instalar dependencias. Usa Ctrl+C para detener el servidor.
Usa HTTP local: abrir index.html con doble clic puede impedir la lectura de píxeles por las restricciones de canvas con file://.

## Configuración

Edita **config.js**, propiedad `twitchUrl`, por ejemplo:

```js
twitchUrl: 'https://www.twitch.tv/tu_canal',
```

Mientras esté vacía, el enlace abre la portada de Twitch. Solo se aceptan direcciones HTTPS de Twitch.
`photoUrl` permite sustituir la fotografía por otra imagen del proyecto, del mismo origen.

## Fondo y accesibilidad

El canvas reduce la fotografía a una cuadrícula, calcula luminosidad ponderada RGB y selecciona caracteres de menor a mayor densidad.
Una onda lenta cambia el muestreo y la luminosidad, conservando las formas. Renderizado a 16 FPS y densidad de píxeles limitada para reducir consumo.
La animación se detiene en pestañas ocultas o con prefers-reduced-motion.
El paisaje es decorativo, el contenido usa HTML accesible y los controles tienen foco visible.

## Tailwind

Se usa el [runtime oficial Tailwind CSS v4](https://tailwindcss.com/docs/installation/play-cdn) por CDN. Necesita Internet para cargarse. `styles.css` incluye un respaldo completo para conservar la página sin conexión.
La terminal de este entorno no pudo descargar paquetes (proxy de red inaccesible), por lo que **no se ejecutó la compilación de Tailwind**.
Para sustituir el runtime CDN por CSS estático cuando haya acceso de red:

1. Ejecuta `npm.cmd install -D tailwindcss @tailwindcss/cli`.
2. Ejecuta `npm.cmd run build:css`.
3. En index.html sustituye el script CDN por `<link rel="stylesheet" href="./assets/tailwind.css">`, antes de styles.css.

## Recursos locales

- `assets/nature.jpg`: fotografía de nubes copiada del recurso local `console-launcher/themes/wallpaper-packs/windows-xp/bliss-clouds.jpg`. Es un recurso provisional; su licencia no se verificó. Sustituir por una fotografía propia o con licencia adecuada antes de publicar.
- `assets/JetBrainsMono-Regular.ttf`: JetBrains Mono Nerd Font Regular disponible localmente; variante de JetBrains Mono, SIL Open Font License. Proyecto: https://github.com/ryanoasis/nerd-fonts y https://github.com/JetBrains/JetBrainsMono.

## Verificación

`npm.cmd test`: comprueba los extremos de luminosidad, ponderación de color y condiciones de pausa. Requiere Node.js reciente con `--test-isolation=none`, para funcionar también en este entorno Windows que restringe procesos secundarios.
