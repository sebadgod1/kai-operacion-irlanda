'use strict';

const STORAGE_KEY = 'kai-irlanda-v3';
const PREVIOUS_KEYS = ['kai-irlanda-v2', 'kai-irlanda-v1'];
const TARGET_DATE = new Date(2026, 10, 2);
const HABITS = [
  { id: 'bed', icon: '🛏️', name: 'Hacer la cama', detail: '1 min', xp: 5 },
  { id: 'room', icon: '🧹', name: 'Ordenar la pieza', detail: '5 min', xp: 10 },
  { id: 'english', icon: '🇬🇧', name: 'Inglés', detail: 'Meta diaria: 30 min', xp: 20, goal: 30, steps: [30, 60, 90] },
  { id: 'reading', icon: '📖', name: 'Lectura', detail: 'Meta diaria: 20 min', xp: 15, goal: 20, steps: [20, 40, 60] },
  { id: 'water', icon: '💧', name: 'Agua', detail: '2 litros', xp: 10 },
  { id: 'sleep', icon: '😴', name: 'Dormir bien', detail: '7–8 horas', xp: 15, help: 'Márcalo al despertar si dormiste 7–8 horas.' }
];
const TRAININGS = [
  { id: 'bike', icon: '🚲', name: 'Bicicleta', goal: 4, xp: 35, extra: 18 },
  { id: 'strength', icon: '💪', name: 'Fuerza en casa', goal: 4, xp: 30, extra: 15 },
  { id: 'rope', icon: '🪢', name: 'Cuerda', goal: 3, xp: 20, extra: 10 }
];
const ACHIEVEMENTS = [
  { id: 'first', icon: '⚡', name: 'Primer paso', description: 'Completa tu primera misión.', test: s => totalCompleted(s) >= 1 },
  { id: 'perfect', icon: '✨', name: 'Perfect Day', description: 'Completa los 6 hábitos esenciales.', test: s => perfectDays(s) >= 1 },
  { id: 'perfectWeek', icon: '🏆', name: 'Perfect Week', description: 'Completa todas las metas semanales.', test: s => wonWeeks(s).length >= 1 },
  { id: 'bookworm', icon: '📚', name: 'Bookworm', description: 'Lee 40+ minutos en un día.', test: s => hasMinutes(s, 'reading', 40) },
  { id: 'englishGrind', icon: '🇬🇧', name: 'English Grind', description: 'Haz 60+ minutos de inglés en un día.', test: s => hasMinutes(s, 'english', 60) },
  { id: 'extraBike', icon: '🚲', name: 'Extra Mile', description: 'Realiza la 5.ª bicicleta semanal.', test: s => hasWeeklyTraining(s, 'bike', 5) },
  { id: 'extraStrength', icon: '💪', name: 'Beast Mode', description: 'Realiza la 5.ª sesión de fuerza.', test: s => hasWeeklyTraining(s, 'strength', 5) },
  { id: 'extraRope', icon: '🪢', name: 'Más allá de la meta', description: 'Realiza la 4.ª sesión de cuerda.', test: s => hasWeeklyTraining(s, 'rope', 4) },
  { id: 'english5', icon: '🇬🇧', name: 'No more excuses', description: 'Completa 5 sesiones de inglés.', test: s => habitCount(s, 'english') >= 5 },
  { id: 'athlete', icon: '🏅', name: 'Modo atleta', description: 'Completa 10 entrenamientos.', test: s => trainingCount(s) >= 10 },
  { id: 'streak7', icon: '🔥', name: 'Una semana firme', description: 'Logra una racha de 7 días ganados.', test: s => streaks(s).best >= 7 },
  { id: 'xp1000', icon: '💎', name: 'Imparable', description: 'Alcanza 1.000 XP.', test: s => calculateXP(s) >= 1000 }
];

let state = loadState();
let currentDate = dateKey();
let calendarDate = new Date();
let selectedCalendarDate = null;
let saveTimer;

function dateKey(date = new Date()) { const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; }
function parseDate(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); }
function emptyState() { return { version: 3, days: {}, achievements: [], theme: 'classic' }; }
function emptyDay() { return { habits: {}, minutes: { english: 0, reading: 0 }, trainings: [], reflection: '' }; }
function normalizeState(raw) {
  const clean = emptyState();
  if (!raw || typeof raw !== 'object') return clean;
  const sourceDays = raw.days || raw.history || raw.dailyData || {};
  Object.entries(sourceDays).forEach(([key, value]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !value || typeof value !== 'object') return;
    const source = value.habits || value.tasks || {}, minutes = value.minutes || {};
    const habits = {};
    HABITS.filter(h => !h.goal).forEach(h => { habits[h.id] = Boolean(source[h.id] ?? value[h.id]); });
    ['english', 'reading'].forEach(id => { const goal = HABITS.find(h => h.id === id).goal; minutes[id] = Math.max(0, Math.round(Number(minutes[id] ?? value[`${id}Minutes`] ?? ((source[id] ?? value[id]) ? goal : 0)) || 0)); });
    let trainings = value.trainings || value.workouts || [];
    if (!Array.isArray(trainings)) trainings = Object.keys(trainings).filter(id => trainings[id]);
    clean.days[key] = { habits, minutes: { english: minutes.english, reading: minutes.reading }, trainings: [...new Set(trainings.filter(id => TRAININGS.some(t => t.id === id)))], reflection: String(value.reflection || value.note || '') };
  });
  clean.achievements = Array.isArray(raw.achievements) ? [...new Set(raw.achievements.filter(id => ACHIEVEMENTS.some(a => a.id === id)))] : [];
  clean.theme = raw.theme === 'voyage' ? 'voyage' : 'classic';
  return clean;
}
function loadState() {
  try {
    const key = [STORAGE_KEY, ...PREVIOUS_KEYS].find(k => localStorage.getItem(k));
    const loaded = key ? normalizeState(JSON.parse(localStorage.getItem(key))) : emptyState();
    if (key !== STORAGE_KEY) localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
    return loaded;
  } catch (error) { console.warn('No se pudo leer el progreso:', error); return emptyState(); }
}
function saveState() { state.version = 3; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function day(key = currentDate, create = true) { if (!state.days[key] && create) state.days[key] = emptyDay(); return state.days[key]; }
function habitDone(record, id) { const habit = HABITS.find(h => h.id === id); return habit.goal ? (record?.minutes?.[id] || 0) >= habit.goal : Boolean(record?.habits?.[id]); }
function completedFor(record) { return record ? HABITS.filter(h => habitDone(record, h.id)).length : 0; }
function totalCompleted(s) { return Object.values(s.days).reduce((n, d) => n + completedFor(d), 0); }
function habitCount(s, id) { return Object.values(s.days).filter(d => habitDone(d, id)).length; }
function trainingCount(s) { return Object.values(s.days).reduce((n, d) => n + (d.trainings?.length || 0), 0); }
function perfectDays(s) { return Object.values(s.days).filter(d => completedFor(d) === 6).length; }
function minutesXP(id, minutes) { if (id === 'english') return minutes >= 90 ? 40 : minutes >= 60 ? 30 : minutes >= 30 ? 20 : 0; return minutes >= 60 ? 30 : minutes >= 40 ? 23 : minutes >= 20 ? 15 : 0; }
function weekKey(date) { return dateKey(startOfWeek(date)); }
function groupedTraining(s) { const weeks = {}; Object.entries(s.days).forEach(([key, d]) => { const week = weekKey(parseDate(key)); weeks[week] ||= { bike: 0, strength: 0, rope: 0 }; (d.trainings || []).forEach(id => { if (id in weeks[week]) weeks[week][id]++; }); }); return weeks; }
function calculateXP(s = state) {
  let xp = Object.values(s.days).reduce((sum, record) => sum + HABITS.filter(h => !h.goal).reduce((n, h) => n + (habitDone(record, h.id) ? h.xp : 0), 0) + minutesXP('english', record.minutes?.english || 0) + minutesXP('reading', record.minutes?.reading || 0) + (completedFor(record) === 6 ? 20 : 0), 0);
  Object.values(groupedTraining(s)).forEach(counts => TRAININGS.forEach(t => { xp += Math.min(counts[t.id], t.goal) * t.xp + (counts[t.id] > t.goal ? t.extra : 0); }));
  return xp + wonWeeks(s).length * 50;
}
function levelData(xp = calculateXP()) { const level = Math.floor(Math.sqrt(xp / 75)) + 1, floor = 75 * (level - 1) ** 2, ceiling = 75 * level ** 2; const ranks = ['Novato', 'En marcha', 'Constante', 'Disciplinado', 'Imparable', 'Leyenda']; return { level, floor, ceiling, progress: (xp - floor) / (ceiling - floor) * 100, rank: ranks[Math.min(Math.floor((level - 1) / 2), ranks.length - 1)] }; }
function startOfWeek(date = new Date()) { const result = new Date(date); result.setHours(0, 0, 0, 0); result.setDate(result.getDate() - (result.getDay() + 6) % 7); return result; }
function weeklyCount(id, reference = new Date()) { return groupedTraining(state)[weekKey(reference)]?.[id] || 0; }
function wonWeeks(s = state) { return Object.entries(groupedTraining(s)).filter(([, c]) => TRAININGS.every(t => c[t.id] >= t.goal)).map(([key]) => key).sort(); }
function consecutive(keys, unitDays, includeCurrent) { let best = 0, run = 0, previous; keys.forEach(key => { const d = parseDate(key); run = previous && Math.round((d - previous) / 86400000) === unitDays ? run + 1 : 1; best = Math.max(best, run); previous = d; }); let cursor = includeCurrent(); if (!keys.includes(dateKey(cursor))) cursor.setDate(cursor.getDate() - unitDays); let current = 0; while (keys.includes(dateKey(cursor))) { current++; cursor.setDate(cursor.getDate() - unitDays); } return { current, best }; }
function streaks(s = state) { const keys = Object.entries(s.days).filter(([, d]) => completedFor(d) === 6).map(([k]) => k).sort(); return consecutive(keys, 1, () => new Date()); }
function weeklyStreaks(s = state) { return consecutive(wonWeeks(s), 7, () => startOfWeek()); }
function percentage(daysBack) { let done = 0; for (let i = 0; i < daysBack; i++) { const d = new Date(); d.setDate(d.getDate() - i); done += completedFor(state.days[dateKey(d)]); } return Math.round(done / (daysBack * 6) * 100); }
function totalMinutes(id) { return Object.values(state.days).reduce((n, d) => n + (d.minutes?.[id] || 0), 0); }
function averageMinutes(id) { let total = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); total += state.days[dateKey(d)]?.minutes?.[id] || 0; } return Math.round(total / 7); }
function hasMinutes(s, id, min) { return Object.values(s.days).some(d => (d.minutes?.[id] || 0) >= min); }
function hasWeeklyTraining(s, id, min) { return Object.values(groupedTraining(s)).some(c => c[id] >= min); }
function escapeHTML(value) { const el = document.createElement('div'); el.textContent = value; return el.innerHTML; }

function renderToday() {
  const record = day(), done = completedFor(record), percent = Math.round(done / 6 * 100), xp = calculateXP(), level = levelData(xp), streak = streaks();
  document.querySelector('#days-left').textContent = Math.max(0, Math.ceil((TARGET_DATE - new Date().setHours(0, 0, 0, 0)) / 86400000));
  document.querySelector('#daily-bar').style.width = `${percent}%`; document.querySelector('#daily-percent').textContent = `${percent}%`; document.querySelector('#daily-count').textContent = `${done} de 6 misiones`;
  document.querySelector('#total-xp').textContent = xp.toLocaleString('es-CL'); document.querySelector('#streak').textContent = streak.current; document.querySelector('#header-level').textContent = level.level; document.querySelector('#level-name').textContent = level.rank;
  const dailyXP = HABITS.filter(h => !h.goal).reduce((n, h) => n + (habitDone(record, h.id) ? h.xp : 0), 0) + minutesXP('english', record.minutes.english) + minutesXP('reading', record.minutes.reading) + (done === 6 ? 20 : 0);
  document.querySelector('#mission-xp').textContent = `+${dailyXP} XP`; document.querySelector('#perfect-day').classList.toggle('show', done === 6);
  document.querySelector('#kai-message').textContent = done === 6 ? 'PERFECT DAY ✨ Día ganado. Tremenda jornada, capitán.' : done >= 4 ? 'Vas filete. Cierra las que faltan y deja el día ganado.' : done ? 'Buena, ya rompiste la inercia. Ahora una misión más.' : 'Wn, partamos por una misión. La inercia se rompe haciendo.';
  document.querySelector('#habit-list').innerHTML = HABITS.map(h => {
    const complete = habitDone(record, h.id), value = record.minutes?.[h.id] || 0;
    if (h.goal) return `<article class="habit-card minute-card ${complete ? 'completed' : ''}"><span class="habit-icon">${h.icon}</span><span class="habit-info"><strong>${h.name}</strong><small>${value} min registrados · ${minutesXP(h.id, value)} XP</small></span><div class="minute-actions">${h.steps.map((v, i) => `<button data-minutes="${h.id}" data-value="${v}">${v}${i === 2 ? '+' : ''} min</button>`).join('')}<label><span class="sr-only">Minutos de ${h.name}</span><input data-manual="${h.id}" type="number" min="0" max="1440" inputmode="numeric" value="${value}" aria-label="Minutos de ${h.name}"><b>min</b></label></div></article>`;
    return `<button class="habit-card ${complete ? 'completed' : ''}" data-habit="${h.id}" aria-pressed="${complete}"><span class="habit-icon">${h.icon}</span><span class="habit-info"><strong>${h.name}</strong><small>${h.detail} · +${h.xp} XP${h.help ? `<em>${h.help}</em>` : ''}</small></span><span class="habit-xp">+${h.xp}</span><span class="checkmark"></span></button>`;
  }).join('');
  document.querySelectorAll('[data-habit]').forEach(b => b.addEventListener('click', () => toggleHabit(b.dataset.habit)));
  document.querySelectorAll('[data-minutes]').forEach(b => b.addEventListener('click', () => setMinutes(b.dataset.minutes, b.dataset.value)));
  document.querySelectorAll('[data-manual]').forEach(input => input.addEventListener('change', () => setMinutes(input.dataset.manual, input.value)));
  renderTrainings('#training-list', true); document.querySelector('#reflection').value = record.reflection || '';
  const start = startOfWeek(), end = new Date(start); end.setDate(end.getDate() + 6); document.querySelector('#week-label').textContent = `${start.getDate()}–${end.getDate()} ${end.toLocaleDateString('es-CL', { month: 'short' })}`;
  document.querySelector('#perfect-week').classList.toggle('show', wonWeeks().includes(weekKey(new Date())));
}
function renderTrainings(selector, interactive) { const today = day(currentDate, false)?.trainings || []; document.querySelector(selector).innerHTML = TRAININGS.map(t => { const count = weeklyCount(t.id), todayDone = today.includes(t.id), extra = count > t.goal; return `<article class="training-card"><div class="training-top"><span>${t.icon}</span><div><strong>${t.name}</strong><small>Meta ${t.goal}/semana · +${t.xp} XP${extra ? ` · extra +${t.extra} XP` : ''}</small></div><strong class="training-count">${count}/${t.goal}${extra ? '+1' : ''}</strong>${interactive ? `<button class="training-button ${todayDone ? 'done' : ''}" data-training="${t.id}">${todayDone ? 'Hecho ✓' : '+ Registrar'}</button>` : ''}</div><div class="progress-track"><span style="width:${Math.min(100, count / t.goal * 100)}%"></span></div></article>`; }).join(''); if (interactive) document.querySelectorAll('[data-training]').forEach(b => b.addEventListener('click', () => toggleTraining(b.dataset.training))); }
function toggleHabit(id) { const record = day(), wasPerfect = completedFor(record) === 6; record.habits[id] = !record.habits[id]; saveState(); checkAchievements(); renderAll(); if (!wasPerfect && completedFor(record) === 6) celebrate('PERFECT DAY ✨'); else if (record.habits[id]) toast('✅ Misión completada'); }
function setMinutes(id, raw) { const record = day(), wasPerfect = completedFor(record) === 6; record.minutes[id] = Math.min(1440, Math.max(0, Math.round(Number(raw) || 0))); saveState(); checkAchievements(); renderAll(); if (!wasPerfect && completedFor(record) === 6) celebrate('PERFECT DAY ✨'); else toast(`${record.minutes[id]} min guardados ✓`); }
function toggleTraining(id) { const record = day(), weekWasWon = wonWeeks().includes(weekKey(new Date())), index = record.trainings.indexOf(id); if (index >= 0) record.trainings.splice(index, 1); else record.trainings.push(id); saveState(); checkAchievements(); renderAll(); if (!weekWasWon && wonWeeks().includes(weekKey(new Date()))) celebrate('PERFECT WEEK 🏆'); else if (index < 0) toast('Entrenamiento registrado 💪'); }
function renderProgress() {
  const xp = calculateXP(), level = levelData(xp), daily = streaks(), weekly = weeklyStreaks();
  document.querySelector('#progress-level').textContent = level.level; document.querySelector('#progress-rank').textContent = level.rank; document.querySelector('#progress-xp').textContent = xp.toLocaleString('es-CL'); document.querySelector('#level-bar').style.width = `${level.progress}%`; document.querySelector('#next-level').textContent = `${level.ceiling - xp} XP para el próximo nivel`;
  const metrics = { 'metric-7': `${percentage(7)}%`, 'metric-30': `${percentage(30)}%`, 'metric-english': `${totalMinutes('english')}m`, 'metric-reading': `${totalMinutes('reading')}m`, 'metric-english-avg': `${averageMinutes('english')}m`, 'metric-reading-avg': `${averageMinutes('reading')}m`, 'metric-perfect': perfectDays(state), 'metric-weeks': wonWeeks().length, 'metric-daily-streak': daily.current, 'metric-best': daily.best, 'metric-weekly-streak': weekly.current, 'metric-weekly-best': weekly.best }; Object.entries(metrics).forEach(([id, value]) => { document.querySelector(`#${id}`).textContent = value; });
  const skills = [['🇬🇧 English', totalMinutes('english')], ['💪 Strength', trainingOccurrences('strength') * 30], ['🚲 Endurance', trainingOccurrences('bike') * 35 + trainingOccurrences('rope') * 20], ['🧠 Discipline', totalCompleted(state) * 5]]; document.querySelector('#skills-list').innerHTML = skills.map(([name, value]) => `<article class="skill"><div class="skill-top"><strong>${name}</strong><span>${value} pts</span></div><div class="progress-track"><span style="width:${Math.min(100, value / 5)}%"></span></div></article>`).join('');
  renderTrainings('#progress-trainings', false); document.querySelector('#achievements-list').innerHTML = ACHIEVEMENTS.map(a => { const unlocked = a.test(state) || state.achievements.includes(a.id); return `<article class="achievement ${unlocked ? 'unlocked' : ''}"><span>${unlocked ? a.icon : '🔒'}</span><strong>${a.name}</strong><small>${a.description}</small></article>`; }).join('');
}
function trainingOccurrences(id) { return Object.values(state.days).filter(d => d.trainings?.includes(id)).length; }
function checkAchievements() { const unlocked = ACHIEVEMENTS.filter(a => !state.achievements.includes(a.id) && a.test(state)); if (!unlocked.length) return; state.achievements.push(...unlocked.map(a => a.id)); saveState(); showAchievement(unlocked[0]); }
function showAchievement(a) { document.querySelector('#achievement-title').textContent = `${a.icon} ${a.name}`; document.querySelector('#achievement-description').textContent = a.description; const modal = document.querySelector('#achievement-modal'); modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); }
function renderCalendar() { const year = calendarDate.getFullYear(), month = calendarDate.getMonth(); document.querySelector('#calendar-month').textContent = new Date(year, month, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }); let html = '<span></span>'.repeat((new Date(year, month, 1).getDay() + 6) % 7); for (let n = 1; n <= new Date(year, month + 1, 0).getDate(); n++) { const key = dateKey(new Date(year, month, n)), record = state.days[key], done = completedFor(record), status = record ? (done === 6 ? 'great' : done >= 3 ? 'partial' : 'low') : ''; html += `<button class="calendar-day ${status} ${key === currentDate ? 'today' : ''} ${key === selectedCalendarDate ? 'selected' : ''}" data-date="${key}">${n}</button>`; } document.querySelector('#calendar-grid').innerHTML = html; document.querySelectorAll('.calendar-day').forEach(b => b.addEventListener('click', () => { selectedCalendarDate = b.dataset.date; renderCalendar(); renderDayDetail(selectedCalendarDate); })); }
function renderDayDetail(key) { const box = document.querySelector('#day-detail'), record = state.days[key]; if (!record) { box.className = 'day-detail empty'; box.innerHTML = '<p>No hay información guardada para este día.</p>'; return; } box.className = 'day-detail'; box.innerHTML = `<h3>${parseDate(key).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} · ${completedFor(record)}/6</h3><div class="detail-habits">${HABITS.map(h => `<span class="${habitDone(record, h.id) ? 'done' : ''}">${habitDone(record, h.id) ? '✓' : '○'} ${h.icon} ${h.name}${h.goal ? ` (${record.minutes?.[h.id] || 0} min)` : ''}</span>`).join('')}</div>${record.trainings?.length ? `<p class="label detail-training">ENTRENAMIENTO · ${record.trainings.map(id => TRAININGS.find(t => t.id === id)?.name).join(', ')}</p>` : ''}${record.reflection ? `<blockquote>${escapeHTML(record.reflection)}</blockquote>` : ''}`; }
function renderTheme() { document.body.dataset.theme = state.theme; document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('selected', b.dataset.theme === state.theme)); const voyage = state.theme === 'voyage', labels = voyage ? ['Bitácora', 'Recompensa', 'Ruta'] : ['Hoy', 'Progreso', 'Calendario']; document.querySelectorAll('.nav-item small').forEach((el, i) => { if (i < 3) el.textContent = labels[i]; }); document.querySelector('#view-today').dataset.title = labels[0]; document.querySelector('#view-progress').dataset.title = labels[1]; document.querySelector('#view-calendar').dataset.title = labels[2]; const active = document.querySelector('.nav-item.active'); if (active) document.querySelector('#page-title').textContent = document.querySelector(`#view-${active.dataset.view}`).dataset.title; document.querySelector('meta[name="theme-color"]').content = voyage ? '#071827' : '#07111f'; }
function renderAll() { renderTheme(); renderToday(); renderProgress(); renderCalendar(); }
function toast(message) { const node = document.querySelector('#toast'); node.textContent = message; node.classList.add('show'); clearTimeout(node.timer); node.timer = setTimeout(() => node.classList.remove('show'), 2200); }
function celebrate(message) { const el = document.querySelector('#celebration'); el.querySelector('strong').textContent = message; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); }
function download(name, content, type) { const blob = new Blob([content], { type }), url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500); }
function exportJSON() { download(`kai-irlanda-backup-${currentDate}.json`, JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2), 'application/json'); toast('Backup exportado ✓'); }
function exportCSV() { const header = ['fecha', ...HABITS.map(h => h.id), 'english_minutes', 'reading_minutes', ...TRAININGS.map(t => t.id), 'cumplimiento_porcentaje', 'reflexion'], quote = v => `"${String(v).replaceAll('"', '""')}"`; const rows = Object.keys(state.days).sort().map(key => { const d = state.days[key]; return [key, ...HABITS.map(h => habitDone(d, h.id) ? 1 : 0), d.minutes?.english || 0, d.minutes?.reading || 0, ...TRAININGS.map(t => d.trainings?.includes(t.id) ? 1 : 0), Math.round(completedFor(d) / 6 * 100), d.reflection || ''].map(quote).join(','); }); download(`kai-irlanda-historial-${currentDate}.csv`, '\ufeff' + header.join(',') + '\n' + rows.join('\n'), 'text/csv;charset=utf-8'); toast('Historial CSV exportado ✓'); }
async function importJSON(event) { const file = event.target.files[0]; if (!file) return; try { const parsed = JSON.parse(await file.text()), normalized = normalizeState(parsed.data || parsed); if (!Object.keys(normalized.days).length && !confirm('El archivo no contiene días guardados. ¿Importarlo igualmente?')) return; state = normalized; saveState(); renderAll(); toast('Backup importado correctamente ✓'); } catch { alert('No pudimos importar ese archivo. Revisa que sea un backup JSON válido.'); } finally { event.target.value = ''; } }
function switchView(name) { document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${name}`)); document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === name)); document.querySelector('#page-title').textContent = document.querySelector(`#view-${name}`).dataset.title; window.scrollTo(0, 0); }
function bindEvents() { document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view))); document.querySelector('#reflection').addEventListener('input', e => { day().reflection = e.target.value; document.querySelector('#save-status').textContent = 'Guardando…'; clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveState(); document.querySelector('#save-status').textContent = 'Guardado en este dispositivo ✓'; }, 350); }); document.querySelector('#prev-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); }); document.querySelector('#next-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); }); document.querySelector('#close-achievement').addEventListener('click', () => { const m = document.querySelector('#achievement-modal'); m.classList.remove('show'); m.setAttribute('aria-hidden', 'true'); }); document.querySelector('#export-json').addEventListener('click', exportJSON); document.querySelector('#export-csv').addEventListener('click', exportCSV); document.querySelector('#import-json').addEventListener('change', importJSON); document.querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => { state.theme = b.dataset.theme; saveState(); renderTheme(); toast('Apariencia guardada ✓'); })); document.querySelector('#reset-today').addEventListener('click', () => { if (confirm('¿Reiniciar las misiones, entrenamientos y reflexión de hoy?')) { delete state.days[currentDate]; saveState(); renderAll(); toast('Día actual reiniciado'); } }); document.querySelector('#reset-all').addEventListener('click', () => { if (confirm('¿Borrar TODO tu progreso? Esta acción no se puede deshacer.')) { state = emptyState(); saveState(); renderAll(); toast('Todos los datos fueron reiniciados'); } }); }
function detectDateChange() { const now = dateKey(); if (now !== currentDate) { currentDate = now; calendarDate = new Date(); renderAll(); toast('Nuevo día, nuevas misiones ☀️'); } }

bindEvents(); renderAll(); checkAchievements();
setInterval(detectDateChange, 30000); document.addEventListener('visibilitychange', () => { if (!document.hidden) detectDateChange(); });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Service worker:', error)));
