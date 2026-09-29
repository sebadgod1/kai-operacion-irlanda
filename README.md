# Kai — Operación Irlanda

PWA móvil, local y offline para sostener hábitos esenciales, entrenamiento y progreso durante la preparación para vivir en Irlanda.

## Ejecutar

Sirve la carpeta con cualquier servidor estático (el service worker requiere HTTP):

```bash
python3 -m http.server 4173
```

Abre `http://localhost:4173`. No hay dependencias, servicios externos ni proceso de build.

## Datos y compatibilidad

- El estado actual vive en `localStorage` bajo `kai-irlanda-v4`.
- Al iniciar, se intenta migrar de forma no destructiva desde `kai-irlanda-v3`, `v2` o `v1`; las claves antiguas se conservan.
- Los logros históricos de v3 se migran semánticamente y permanecen visibles; borrar todo, en cambio, elimina explícitamente las cuatro claves de almacenamiento antes de crear un estado v4 vacío.
- XP, días y semanas ganadas se derivan del historial. Cambiar minutos o deshacer una acción recalcula el total y evita duplicados.
- JSON y CSV permiten respaldar y revisar el historial. Exportar JSON registra `meta.lastBackupAt`.

## PWA

La shell y la ilustración local `assets/ireland-hero.svg` funcionan offline mediante `sw.js`. Una actualización instalada espera confirmación explícita en la interfaz antes de activar el nuevo service worker y recargar.

## Pruebas

```bash
node tests/app.test.js
node --check app.js
node --check sw.js
```
