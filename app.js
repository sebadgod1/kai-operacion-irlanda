'use strict';

const STORAGE_KEY = 'kai-irlanda-v2';
const LEGACY_KEY = 'kai-irlanda-v1';
const TARGET_DATE = new Date(2026, 10, 2);
const HABITS = [
  { id: 'bed', icon: '🛏️', name: 'Hacer la cama', detail: '1 min', xp: 5 },
  { id: 'room', icon: '🧹', name: 'Ordenar la pieza', detail: '5 min', xp: 10 },
  { id: 'english', icon: '🇬🇧', name: 'Inglés', detail: '30 min', xp: 20 },
  { id: 'reading', icon: '📖', name: 'Leer', detail: '20 min', xp: 15 },
  { id: 'water', icon: '💧', name: 'Agua', detail: '2 litros', xp: 10 },
  { id: 'sleep', icon: '😴', name: 'Dormir bien', detail: '7–8 horas', xp: 15 }
];
const TRAININGS = [
  { id: 'bike', icon: '🚲', name: 'Bicicleta', goal: 4, xp: 35 },
  { id: 'strength', icon: '💪', name: 'Fuerza en casa', goal: 4, xp: 30 },
  { id: 'rope', icon: '🪢', name: 'Saltar cuerda', goal: 3, xp: 20 }
];
const ACHIEVEMENTS = [
  { id: 'first', icon: '⚡', name: 'Primer paso', description: 'Completa tu primera misión.', test: s => totalCompleted(s) >= 1 },
  { id: 'perfect', icon: '✨', name: 'Día perfecto', description: 'Completa las 6 misiones en un día.', test: s => perfectDays(s) >= 1 },
  { id: 'english5', icon: '🇬🇧', name: 'No more excuses', description: 'Completa 5 sesiones de inglés.', test: s => habitCount(s, 'english') >= 5 },
  { id: 'athlete', icon: '🏅', name: 'Modo atleta', description: 'Completa 10 entrenamientos.', test: s => trainingCount(s) >= 10 },
  { id: 'streak7', icon: '🔥', name: 'Una semana firme', description: 'Logra una racha de 7 días.', test: s => streaks(s).best >= 7 },
  { id: 'xp1000', icon: '💎', name: 'Imparable', description: 'Alcanza 1.000 XP.', test: s => calculateXP(s) >= 1000 }
];

let state = loadState();
let currentDate = dateKey();
let calendarDate = new Date();
let selectedCalendarDate = null;
let saveTimer;

function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function parseDate(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); }
function emptyState() { return { version: 2, days: {}, achievements: [] }; }
function emptyDay() { return { habits: {}, trainings: [], reflection: '' }; }
function normalizeState(raw) {
  const clean = emptyState();
  if (!raw || typeof raw !== 'object') return clean;
  const sourceDays = raw.days || raw.history || raw.dailyData || {};
  Object.entries(sourceDays).forEach(([key, value]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !value || typeof value !== 'object') return;
    const habitsSource = value.habits || value.tasks || {};
    const habits = {};
    HABITS.forEach(h => { habits[h.id] = Boolean(habitsSource[h.id] ?? value[h.id]); });
    let trainings = value.trainings || value.workouts || [];
    if (!Array.isArray(trainings)) trainings = Object.keys(trainings).filter(id => trainings[id]);
    clean.days[key] = { habits, trainings: [...new Set(trainings.filter(id => TRAININGS.some(t => t.id === id)))], reflection: String(value.reflection || value.note || '') };
  });
  clean.achievements = Array.isArray(raw.achievements) ? raw.achievements.filter(id => ACHIEVEMENTS.some(a => a.id === id)) : [];
  return clean;
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : emptyState();
  } catch (error) { console.warn('No se pudo leer el progreso:', error); return emptyState(); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function day(key = currentDate, create = true) {
  if (!state.days[key] && create) state.days[key] = emptyDay();
  return state.days[key];
}
function completedFor(record) { return record ? HABITS.filter(h => record.habits?.[h.id]).length : 0; }
function totalCompleted(s) { return Object.values(s.days).reduce((n, d) => n + completedFor(d), 0); }
function habitCount(s, id) { return Object.values(s.days).filter(d => d.habits?.[id]).length; }
function trainingCount(s) { return Object.values(s.days).reduce((n, d) => n + (d.trainings?.length || 0), 0); }
function perfectDays(s) { return Object.values(s.days).filter(d => completedFor(d) === HABITS.length).length; }
function calculateXP(s = state) {
  return Object.values(s.days).reduce((sum, record) => sum + HABITS.reduce((n, h) => n + (record.habits?.[h.id] ? h.xp : 0), 0) + TRAININGS.reduce((n, t) => n + (record.trainings?.includes(t.id) ? t.xp : 0), 0), 0);
}
function levelData(xp = calculateXP()) {
  const level = Math.floor(Math.sqrt(xp / 75)) + 1;
  const floor = 75 * (level - 1) ** 2;
  const ceiling = 75 * level ** 2;
  const ranks = ['Novato', 'En marcha', 'Constante', 'Disciplinado', 'Imparable', 'Leyenda'];
  return { level, floor, ceiling, progress: ((xp - floor) / (ceiling - floor)) * 100, rank: ranks[Math.min(Math.floor((level - 1) / 2), ranks.length - 1)] };
}
function startOfWeek(date = new Date()) { const result = new Date(date); const offset = (result.getDay() + 6) % 7; result.setDate(result.getDate() - offset); result.setHours(0, 0, 0, 0); return result; }
function weeklyCount(id, reference = new Date()) {
  const start = startOfWeek(reference); const end = new Date(start); end.setDate(end.getDate() + 7);
  return Object.entries(state.days).filter(([key, record]) => { const d = parseDate(key); return d >= start && d < end && record.trainings?.includes(id); }).length;
}
function streaks(s = state) {
  const activeDates = Object.entries(s.days).filter(([, d]) => completedFor(d) >= 4).map(([k]) => k).sort();
  let best = 0, run = 0, previous = null;
  activeDates.forEach(key => { const date = parseDate(key); run = previous && Math.round((date - previous) / 86400000) === 1 ? run + 1 : 1; best = Math.max(best, run); previous = date; });
  let current = 0; const cursor = new Date();
  if (completedFor(s.days[dateKey(cursor)]) < 4) cursor.setDate(cursor.getDate() - 1);
  while (completedFor(s.days[dateKey(cursor)]) >= 4) { current++; cursor.setDate(cursor.getDate() - 1); }
  return { current, best };
}
function percentage(daysBack) {
  let done = 0;
  for (let i = 0; i < daysBack; i++) { const d = new Date(); d.setDate(d.getDate() - i); done += completedFor(state.days[dateKey(d)]); }
  return Math.round(done / (daysBack * HABITS.length) * 100);
}
function escapeHTML(value) { const el = document.createElement('div'); el.textContent = value; return el.innerHTML; }

function renderToday() {
  const record = day(); const done = completedFor(record); const percent = Math.round(done / HABITS.length * 100); const xp = calculateXP(); const level = levelData(xp); const streak = streaks();
  const remaining = Math.max(0, Math.ceil((TARGET_DATE - new Date().setHours(0, 0, 0, 0)) / 86400000));
  document.querySelector('#days-left').textContent = remaining;
  document.querySelector('#daily-bar').style.width = `${percent}%`;
  document.querySelector('#daily-percent').textContent = `${percent}%`;
  document.querySelector('#daily-count').textContent = `${done} de 6 misiones`;
  document.querySelector('#total-xp').textContent = xp.toLocaleString('es-CL');
  document.querySelector('#streak').textContent = streak.current;
  document.querySelector('#header-level').textContent = level.level;
  document.querySelector('#level-name').textContent = level.rank;
  document.querySelector('#mission-xp').textContent = `+${HABITS.reduce((n, h) => n + (record.habits[h.id] ? h.xp : 0), 0)} XP`;
  const messages = done === 6 ? 'Perfect day. 6/6. Así se llega preparado.' : done >= 4 ? 'Vas filete. Cierra las que faltan y deja el día ganado.' : done >= 1 ? 'Buena, ya rompiste la inercia. Ahora una misión más.' : 'Wn, partamos por una misión. La inercia se rompe haciendo.';
  document.querySelector('#kai-message').textContent = messages;
  document.querySelector('#habit-list').innerHTML = HABITS.map(h => `<button class="habit-card ${record.habits[h.id] ? 'completed' : ''}" data-habit="${h.id}" aria-pressed="${Boolean(record.habits[h.id])}"><span class="habit-icon">${h.icon}</span><span class="habit-info"><strong>${h.name}</strong><small>${h.detail} · +${h.xp} XP</small></span><span class="habit-xp">+${h.xp}</span><span class="checkmark" aria-hidden="true"></span></button>`).join('');
  document.querySelectorAll('[data-habit]').forEach(button => button.addEventListener('click', () => toggleHabit(button.dataset.habit)));
  renderTrainings('#training-list', true);
  document.querySelector('#reflection').value = record.reflection || '';
  const start = startOfWeek(); const end = new Date(start); end.setDate(end.getDate() + 6);
  document.querySelector('#week-label').textContent = `${start.getDate()}–${end.getDate()} ${end.toLocaleDateString('es-CL', { month: 'short' })}`;
}
function renderTrainings(selector, interactive) {
  const todayTrainings = day(currentDate, false)?.trainings || [];
  document.querySelector(selector).innerHTML = TRAININGS.map(t => { const count = weeklyCount(t.id); const todayDone = todayTrainings.includes(t.id); return `<article class="training-card"><div class="training-top"><span>${t.icon}</span><div><strong>${t.name}</strong><small>Meta: ${t.goal} veces por semana · +${t.xp} XP</small></div><strong class="training-count">${count}/${t.goal}</strong>${interactive ? `<button class="training-button ${todayDone ? 'done' : ''}" data-training="${t.id}">${todayDone ? 'Hecho ✓' : '+ Registrar'}</button>` : ''}</div><div class="progress-track"><span style="width:${Math.min(100, count / t.goal * 100)}%"></span></div></article>`; }).join('');
  if (interactive) document.querySelectorAll('[data-training]').forEach(button => button.addEventListener('click', () => toggleTraining(button.dataset.training)));
}
function toggleHabit(id) {
  const record = day(); record.habits[id] = !record.habits[id]; saveState(); checkAchievements(); renderAll();
  if (record.habits[id]) toast(`${HABITS.find(h => h.id === id).icon} Misión completada`);
}
function toggleTraining(id) {
  const record = day(); record.trainings ||= []; const index = record.trainings.indexOf(id);
  if (index >= 0) record.trainings.splice(index, 1); else record.trainings.push(id);
  saveState(); checkAchievements(); renderAll();
  if (index < 0) toast('Entrenamiento registrado 💪');
}
function renderProgress() {
  const xp = calculateXP(); const level = levelData(xp); const streak = streaks();
  document.querySelector('#progress-level').textContent = level.level; document.querySelector('#progress-rank').textContent = level.rank;
  document.querySelector('#progress-xp').textContent = xp.toLocaleString('es-CL'); document.querySelector('#level-bar').style.width = `${level.progress}%`;
  document.querySelector('#next-level').textContent = `${level.ceiling - xp} XP para el próximo nivel`;
  document.querySelector('#metric-7').textContent = `${percentage(7)}%`; document.querySelector('#metric-30').textContent = `${percentage(30)}%`;
  document.querySelector('#metric-english').textContent = `${habitCount(state, 'english') * 30}m`; document.querySelector('#metric-reading').textContent = `${habitCount(state, 'reading') * 20}m`;
  document.querySelector('#metric-perfect').textContent = perfectDays(state); document.querySelector('#metric-best').textContent = streak.best;
  const skills = [
    ['🇬🇧 English', habitCount(state, 'english') * 20], ['💪 Strength', habitCount(state, 'room') * 5 + trainingOccurrences('strength') * 30],
    ['🚲 Endurance', trainingOccurrences('bike') * 35 + trainingOccurrences('rope') * 15], ['🧠 Discipline', totalCompleted(state) * 5]
  ];
  document.querySelector('#skills-list').innerHTML = skills.map(([name, value]) => `<article class="skill"><div class="skill-top"><strong>${name}</strong><span>${value} XP</span></div><div class="progress-track"><span style="width:${Math.min(100, value / 5)}%"></span></div></article>`).join('');
  renderTrainings('#progress-trainings', false);
  document.querySelector('#achievements-list').innerHTML = ACHIEVEMENTS.map(a => `<article class="achievement ${state.achievements.includes(a.id) ? 'unlocked' : ''}"><span>${state.achievements.includes(a.id) ? a.icon : '🔒'}</span><strong>${a.name}</strong><small>${a.description}</small></article>`).join('');
}
function trainingOccurrences(id) { return Object.values(state.days).filter(d => d.trainings?.includes(id)).length; }
function checkAchievements() {
  const unlocked = ACHIEVEMENTS.filter(a => !state.achievements.includes(a.id) && a.test(state));
  if (!unlocked.length) return;
  state.achievements.push(...unlocked.map(a => a.id)); saveState(); showAchievement(unlocked[0]);
}
function showAchievement(a) {
  document.querySelector('#achievement-title').textContent = `${a.icon} ${a.name}`; document.querySelector('#achievement-description').textContent = a.description;
  const modal = document.querySelector('#achievement-modal'); modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false');
}
function renderCalendar() {
  const year = calendarDate.getFullYear(), month = calendarDate.getMonth();
  document.querySelector('#calendar-month').textContent = new Date(year, month, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  const firstOffset = (new Date(year, month, 1).getDay() + 6) % 7; const days = new Date(year, month + 1, 0).getDate(); let html = '<span></span>'.repeat(firstOffset);
  for (let number = 1; number <= days; number++) { const key = dateKey(new Date(year, month, number)); const record = state.days[key]; const done = completedFor(record); const status = record ? (done >= 5 ? 'great' : done >= 3 ? 'partial' : 'low') : ''; html += `<button class="calendar-day ${status} ${key === currentDate ? 'today' : ''} ${key === selectedCalendarDate ? 'selected' : ''}" data-date="${key}">${number}</button>`; }
  document.querySelector('#calendar-grid').innerHTML = html;
  document.querySelectorAll('.calendar-day').forEach(button => button.addEventListener('click', () => { selectedCalendarDate = button.dataset.date; renderCalendar(); renderDayDetail(selectedCalendarDate); }));
}
function renderDayDetail(key) {
  const box = document.querySelector('#day-detail'), record = state.days[key];
  if (!record) { box.className = 'day-detail empty'; box.innerHTML = '<p>No hay información guardada para este día.</p>'; return; }
  box.className = 'day-detail';
  box.innerHTML = `<h3>${parseDate(key).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} · ${completedFor(record)}/6</h3><div class="detail-habits">${HABITS.map(h => `<span class="${record.habits?.[h.id] ? 'done' : ''}">${record.habits?.[h.id] ? '✓' : '○'} ${h.icon} ${h.name}</span>`).join('')}</div>${record.trainings?.length ? `<p class="label" style="margin-top:14px">ENTRENAMIENTO · ${record.trainings.map(id => TRAININGS.find(t => t.id === id)?.name).join(', ')}</p>` : ''}${record.reflection ? `<blockquote>${escapeHTML(record.reflection)}</blockquote>` : ''}`;
}
function renderAll() { renderToday(); renderProgress(); renderCalendar(); }
function toast(message) { const node = document.querySelector('#toast'); node.textContent = message; node.classList.add('show'); clearTimeout(node.timer); node.timer = setTimeout(() => node.classList.remove('show'), 2200); }

function download(name, content, type) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500); }
function exportJSON() { download(`kai-irlanda-backup-${currentDate}.json`, JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2), 'application/json'); toast('Backup exportado ✓'); }
function exportCSV() {
  const header = ['fecha', ...HABITS.map(h => h.id), ...TRAININGS.map(t => t.id), 'cumplimiento_porcentaje', 'reflexion'];
  const quote = value => `"${String(value).replaceAll('"', '""')}"`;
  const rows = Object.keys(state.days).sort().map(key => { const d = state.days[key]; return [key, ...HABITS.map(h => d.habits?.[h.id] ? 1 : 0), ...TRAININGS.map(t => d.trainings?.includes(t.id) ? 1 : 0), Math.round(completedFor(d) / 6 * 100), d.reflection || ''].map(quote).join(','); });
  download(`kai-irlanda-historial-${currentDate}.csv`, '\ufeff' + header.join(',') + '\n' + rows.join('\n'), 'text/csv;charset=utf-8'); toast('Historial CSV exportado ✓');
}
async function importJSON(event) {
  const file = event.target.files[0]; if (!file) return;
  try { const parsed = JSON.parse(await file.text()); const candidate = parsed.data || parsed; const normalized = normalizeState(candidate); if (!Object.keys(normalized.days).length && !confirm('El archivo no contiene días guardados. ¿Importarlo igualmente?')) return; state = normalized; saveState(); renderAll(); toast('Backup importado correctamente ✓'); }
  catch (error) { alert('No pudimos importar ese archivo. Revisa que sea un backup JSON válido.'); }
  finally { event.target.value = ''; }
}
function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === name));
  document.querySelector('#page-title').textContent = document.querySelector(`#view-${name}`).dataset.title; window.scrollTo(0, 0);
}
function bindEvents() {
  document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
  document.querySelector('#reflection').addEventListener('input', event => { day().reflection = event.target.value; document.querySelector('#save-status').textContent = 'Guardando…'; clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveState(); document.querySelector('#save-status').textContent = 'Guardado en este dispositivo ✓'; }, 350); });
  document.querySelector('#prev-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); });
  document.querySelector('#next-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });
  document.querySelector('#close-achievement').addEventListener('click', () => { const m = document.querySelector('#achievement-modal'); m.classList.remove('show'); m.setAttribute('aria-hidden', 'true'); });
  document.querySelector('#export-json').addEventListener('click', exportJSON); document.querySelector('#export-csv').addEventListener('click', exportCSV); document.querySelector('#import-json').addEventListener('change', importJSON);
  document.querySelector('#reset-today').addEventListener('click', () => { if (confirm('¿Reiniciar las misiones, entrenamientos y reflexión de hoy?')) { delete state.days[currentDate]; saveState(); renderAll(); toast('Día actual reiniciado'); } });
  document.querySelector('#reset-all').addEventListener('click', () => { if (confirm('¿Borrar TODO tu progreso? Esta acción no se puede deshacer.')) { state = emptyState(); localStorage.removeItem(LEGACY_KEY); saveState(); renderAll(); toast('Todos los datos fueron reiniciados'); } });
}
function detectDateChange() { const now = dateKey(); if (now !== currentDate) { currentDate = now; calendarDate = new Date(); renderAll(); toast('Nuevo día, nuevas misiones ☀️'); } }

bindEvents(); renderAll();
setInterval(detectDateChange, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) detectDateChange(); });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Service worker:', error)));
