'use strict';

const assert = require('node:assert/strict');
const { togglePreset, reconcileAchievementIds, stableIndex } = require('../v41-core.js');

assert.equal(togglePreset(60, 60), 0, 'tocar el preset activo debe volver a 0');
assert.equal(togglePreset(30, 60), 60, 'tocar otro preset debe cambiar al nuevo valor');
assert.equal(togglePreset('20', '20'), 0, 'debe normalizar strings numéricos');

assert.deepEqual(
  reconcileAchievementIds(['englishGrind'], [], []),
  [],
  'un logro derivado debe volver a bloquearse si ya no se cumple'
);
assert.deepEqual(
  reconcileAchievementIds(['first', 'englishGrind'], ['first'], []),
  ['first'],
  'los logros legacy deben conservarse'
);
assert.deepEqual(
  reconcileAchievementIds(['first'], ['first'], ['englishGrind']),
  ['first', 'englishGrind'],
  'los logros derivados activos deben aparecer junto a legacy'
);

const one = stableIndex('2026-09-29', 60);
const two = stableIndex('2026-09-29', 60);
assert.equal(one, two, 'la frase diaria debe ser estable para la misma fecha');
assert.ok(one >= 0 && one < 60, 'el índice diario debe quedar dentro del rango');

console.log('v4.1 core tests: OK');
