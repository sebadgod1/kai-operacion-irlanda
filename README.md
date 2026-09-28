# Kai — Operación Irlanda

PWA móvil, offline y sin backend para construir hábitos antes de viajar a Irlanda el 2 de noviembre de 2026.

## Uso local

La aplicación es HTML, CSS y JavaScript vanilla. Para probar el service worker hace falta servirla por HTTP:

```bash
python3 -m http.server 8080
```

Después abre `http://localhost:8080`.

## Publicación

En GitHub, abre **Settings → Pages**, elige **Deploy from a branch**, selecciona `main` y la carpeta `/ (root)`. Todas las rutas son relativas y funcionan bajo `/kai-operacion-irlanda/`.

Los datos viven exclusivamente en `localStorage`. Desde Ajustes se pueden exportar e importar respaldos JSON y exportar el historial como CSV.
