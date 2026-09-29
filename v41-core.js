(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.KaiV41Core = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function togglePreset(current, selected) {
    const currentValue = Math.max(0, Math.round(Number(current) || 0));
    const selectedValue = Math.max(0, Math.round(Number(selected) || 0));
    return currentValue === selectedValue ? 0 : selectedValue;
  }

  function reconcileAchievementIds(currentIds, legacyIds, activeDerivedIds) {
    const current = Array.isArray(currentIds) ? currentIds : [];
    const legacy = new Set(Array.isArray(legacyIds) ? legacyIds : []);
    const active = new Set(Array.isArray(activeDerivedIds) ? activeDerivedIds : []);
    return [...new Set(current.filter(id => legacy.has(id)).concat([...active]))];
  }

  function stableIndex(seed, total) {
    if (!total || total < 1) return 0;
    const text = String(seed || '');
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) % total;
  }

  return { togglePreset, reconcileAchievementIds, stableIndex };
});
