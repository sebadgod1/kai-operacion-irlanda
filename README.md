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
- XP, días y semanas ganadas se derivan del historial. Cambiar minutos o deshacer una acción recalcula el total y evita duplicados.
- JSON y CSV permiten respaldar y revisar el historial. Exportar JSON registra `meta.lastBackupAt`.

## PWA

La shell funciona offline mediante `sw.js`. Una actualización instalada espera confirmación explícita en la interfaz antes de activar el nuevo service worker y recargar.
