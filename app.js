'use strict';

const STORAGE_KEY = 'kai-irlanda-v4';
const PREVIOUS_KEYS = ['kai-irlanda-v3', 'kai-irlanda-v2', 'kai-irlanda-v1'];
const TARGET_DATE = new Date(2026, 10, 2);
const HABITS = [
  { id: 'bed', icon: '🛏️', name: 'Hacer la cama', detail: 'Empieza en un minuto', xp: 5 },
  { id: 'room', icon: '🧹', name: 'Ordenar la pieza', detail: 'Deja el espacio listo', xp: 10 },
  { id: 'english', icon: '🇬🇧', name: 'Inglés', detail: 'Meta: 30 minutos', goal: 30, steps: [30, 60, 90] },
  { id: 'reading', icon: '📖', name: 'Leer', detail: 'Meta: 20 minutos', goal: 20, steps: [20, 40, 60] },
  { id: 'water', icon: '💧', name: 'Agua', detail: '2 litros', xp: 10 },
  { id: 'sleep', icon: '😴', name: 'Dormir bien', detail: '7–8 horas', help: 'Márcalo al despertar si dormiste 7–8 horas.', xp: 15 }
];
const TRAININGS = [
  { id: 'bike', icon: '🚲', name: 'Bicicleta', goal: 4, xp: 35, extra: 18 },
  { id: 'strength', icon: '💪', name: 'Fuerza', goal: 4, xp: 30, extra: 15 },
  { id: 'rope', icon: '🪢', name: 'Cuerda', goal: 3, xp: 20, extra: 10 }
];
const KAI_MESSAGES = {
  start: ['Partamos por una. No pensemos en todo.', 'No necesito que hoy sea perfecto. Necesito que partas.', 'Haz la primera y después vemos la segunda.', 'La pega de hoy empieza con algo chico.', 'Primero movimiento, después motivación.', 'Una misión. Eso es todo lo que importa ahora.', 'Abre el día con una acción concreta, mano.', 'No negociemos con la primera misión.', 'El plan está listo. Falta empezar.', 'Vamos con calma, pero vamos ahora.'],
  early: ['Buena. Ya rompiste la inercia.', 'Partimos. Ahora mantengamos el movimiento.', 'Una lista. La siguiente sin darle tantas vueltas.', 'Ya comenzaste; cuidemos ese impulso.', 'No fue mucho, pero fue real. Sigue.', 'Bien. Ahora encadena una misión más.', 'La primera costaba más. Aprovecha el envión.', 'Día abierto. Todavía hay harto por construir.', 'Buen inicio. No lo dejemos solo en eso.', 'Ya hay avance. Ahora hazlo consistente.'],
  middle: ['Ya hiciste la mitad. Ahora viene la parte donde normalmente uno afloja.', 'Vas bien. No dejemos el trabajo a medias.', 'Vas firme. Cierra una más antes de descansar.', 'Mitad lista. El día todavía se puede ganar.', 'Esto ya tomó forma. Mantén el ritmo.', 'Buen bloque. Ahora elige bien la siguiente.', 'No aceleres por ansiedad; termina con orden.', 'Ya avanzaste suficiente para no soltarlo ahora.', 'Tres hechas cambian el día. Cuatro lo encaminan.', 'Vas mejor de lo que parece. Sigue concreto.'],
  almost: ['Una más, wn. No me dejís el día en 83%.', 'Una misión y cerramos.', 'Queda una. Sin épica, termínala.', 'El día está a una decisión de quedar cerrado.', 'Cinco listas. Dale cierre y descansa tranquilo.', 'No inventemos excusas en la última.', 'Una pendiente, rey. Ya sabes qué hacer.', 'Cierra la sexta y suelta el día.', 'Estás al borde. Haz la que falta.', 'Una acción separa avance de día ganado.'],
  complete: ['6/6. Día cerrado. Hoy cumpliste lo que dijiste que ibas a hacer.', 'Día ganado. Mañana repetimos.', 'Listo. No hay nada que demostrar ahora; descansa.', 'Seis de seis. Trabajo cerrado con calma.', 'Hoy hiciste el plan completo. Eso cuenta.', 'Día resuelto. Recupera energía para mañana.', 'Cumpliste sin adornos. Buen trabajo.', 'Todo esencial está listo. Suelta la pantalla.', 'Perfect Day. Consistencia, no espectáculo.', 'Se cerró bien. Mañana partimos de cero.'],
  return: ['Te desapareciste. Ya fue. No recuperemos tres días hoy; ganemos este.', 'No importa la semana anterior. Importa la siguiente acción.', 'Volviste. Sin culpa y sin querer compensar todo de golpe.', 'No hay deuda con los días pasados. Solo está hoy.', 'Retomemos simple, mano: una misión primero.', 'La ausencia ya pasó. Construyamos desde esta apertura.'],
  englishExtra: ['Eso ya no fue cumplir por cumplir. Buen bloque.', 'Sesenta minutos de inglés. Trabajo serio, sin vender humo.', 'Meta superada. Ahora deja que ese bloque decante.'],
  readingExtra: ['Meta cumplida y todavía seguiste. Bien.', 'Buen bloque de lectura. Más profundidad, no solo minutos.', 'Seguiste después de la meta. Eso sí suma.'],
  trainingExtra: ['Meta lista y todavía metiste una más. Bien, pero no entrenemos por farmear XP.', 'Extra registrado. Ahora recuperación; el número no manda.', 'La meta semanal ya estaba. Este extra no es una obligación.'],
  streak: ['Cuatro días es buena señal. Todavía no es una costumbre. Repite mañana.', 'La racha sirve si te ordena, no si te mete presión.', 'Varios días firmes. Mantén los pies en la tierra.']
};
const ACHIEVEMENTS = [
  { id: 'bookworm', icon: '📚', name: 'Bookworm', description: '40+ minutos de lectura en un día.', test: s => hasMinutes(s, 'reading', 40) },
  { id: 'englishGrind', icon: '🇬🇧', name: 'English Grind', description: '60+ minutos de inglés en un día.', test: s => hasMinutes(s, 'english', 60) },
  { id: 'firstVictory', icon: '✨', name: 'Primera victoria', description: 'Tu primer Día ganado.', test: s => perfectDays(s) >= 1 },
  { id: 'perfectWeek', icon: '🏆', name: 'Perfect Week', description: 'Todas las metas de una semana.', test: s => wonWeeks(s).length >= 1 },
  { id: 'extraBike', icon: '🚲', name: 'Extra Mile', description: 'Quinta sesión de bicicleta semanal.', test: s => hasWeeklyTraining(s, 'bike', 5) },
  { id: 'extraStrength', icon: '💪', name: 'Beast Mode', description: 'Quinta sesión de fuerza semanal.', test: s => hasWeeklyTraining(s, 'strength', 5) },
  { id: 'extraRope', icon: '🪢', name: 'Más allá de la meta', description: 'Cuarta sesión de cuerda semanal.', test: s => hasWeeklyTraining(s, 'rope', 4) },
  { id: 'wins7', icon: '🔥', name: '7 días ganados', description: 'Siete días perfectos acumulados.', test: s => perfectDays(s) >= 7 },
  { id: 'wins10', icon: '💠', name: '10 días ganados', description: 'Diez días perfectos acumulados.', test: s => perfectDays(s) >= 10 },
  { id: 'english300', icon: '🇬🇧', name: '300 minutos', description: '300 minutos reales de inglés.', test: s => totalMinutes('english', s) >= 300 },
  { id: 'english1000', icon: '🗣️', name: 'English 1000', description: '1.000 minutos reales de inglés.', test: s => totalMinutes('english', s) >= 1000 },
  { id: 'reading300', icon: '📖', name: 'Lectura 300', description: '300 minutos reales de lectura.', test: s => totalMinutes('reading', s) >= 300 },
  { id: 'training10', icon: '🏅', name: '10 entrenamientos', description: 'Diez sesiones registradas.', test: s => trainingCount(s) >= 10 },
  { id: 'training30', icon: '🏋️', name: '30 entrenamientos', description: 'Treinta sesiones registradas.', test: s => trainingCount(s) >= 30 },
  { id: 'english5', icon: '🇬🇧', name: 'No more excuses', description: 'Logro histórico: cinco sesiones de inglés.', legacy: true, test: () => false },
  { id: 'streak7', icon: '🔥', name: 'Una semana firme', description: 'Logro histórico: siete días ganados consecutivos.', legacy: true, test: () => false },
  { id: 'xp1000', icon: '💎', name: 'Imparable', description: 'Logro histórico: 1.000 XP alcanzados.', legacy: true, test: () => false }
];
const SKILLS = [
  { name: '🇬🇧 English', unit: 'min', milestones: [150, 300, 600, 1200, 2400], value: s => totalMinutes('english', s) },
  { name: '💪 Strength', unit: 'sesiones', milestones: [5, 12, 25, 50, 100], value: s => trainingOccurrences('strength', s) },
  { name: '🚲 Endurance', unit: 'sesiones', milestones: [8, 20, 40, 80, 150], value: s => trainingOccurrences('bike', s) + trainingOccurrences('rope', s) },
  { name: '🧠 Discipline', unit: 'días ganados', milestones: [3, 7, 15, 30, 60], value: s => perfectDays(s) }
];

let state = loadState();
let currentDate = dateKey();
let calendarDate = new Date();
let selectedCalendarDate = null;
let saveTimer;
let toastTimer;
let undoCallback = null;
let pendingWorker = null;
let absenceDays = daysBetween(state.meta.lastOpenedDate, currentDate);

function dateKey(date = new Date()) { const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0'); return `${y}-${m}-${d}`; }
function parseDate(key) { const [y, m, d] = String(key).split('-').map(Number); return new Date(y, m - 1, d); }
function daysBetween(from, to) { if (!from || !to) return 0; return Math.max(0, Math.round((parseDate(to) - parseDate(from)) / 86400000)); }
function emptyState() { return { version: 4, days: {}, achievements: [], meta: { lastOpenedDate: null, lastBackupAt: null, recentKaiMessages: [] } }; }
function emptyDay() { return { habits: {}, minutes: { english: 0, reading: 0 }, trainings: [], reflection: '', checkIn: {}, kai: {} }; }
function clampMinutes(value) { return Math.min(1440, Math.max(0, Math.round(Number(value) || 0))); }
function normalizeTrainings(value) {
  if (Array.isArray(value)) return [...new Set(value.filter(id => TRAININGS.some(t => t.id === id)))];
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).filter(([id, count]) => TRAININGS.some(t => t.id === id) && Boolean(count)).map(([id]) => id);
}
function normalizeState(raw) {
  const clean = emptyState();
  if (!raw || typeof raw !== 'object') return clean;
  const sourceDays = raw.days || raw.history || raw.dailyData || {};
  Object.entries(sourceDays).forEach(([key, value]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !value || typeof value !== 'object') return;
    const source = value.habits || value.tasks || {};
    const sourceMinutes = value.minutes && typeof value.minutes === 'object' ? value.minutes : {};
    const habits = {};
    HABITS.filter(h => !h.goal).forEach(h => { habits[h.id] = Boolean(source[h.id] ?? value[h.id]); });
    const minutes = {};
    HABITS.filter(h => h.goal).forEach(h => { minutes[h.id] = clampMinutes(sourceMinutes[h.id] ?? value[`${h.id}Minutes`] ?? ((source[h.id] ?? value[h.id]) ? h.goal : 0)); });
    const checkIn = value.checkIn && typeof value.checkIn === 'object' ? { sleep: typeof value.checkIn.sleep === 'boolean' ? value.checkIn.sleep : undefined, energy: ['low', 'normal', 'high'].includes(value.checkIn.energy) ? value.checkIn.energy : undefined, completedAt: value.checkIn.completedAt || undefined, dismissedAt: value.checkIn.dismissedAt || undefined } : {};
    const kai = value.kai && typeof value.kai === 'object' ? { context: String(value.kai.context || ''), message: String(value.kai.message || ''), event: value.kai.event && typeof value.kai.event === 'object' ? value.kai.event : undefined } : {};
    clean.days[key] = { habits, minutes, trainings: normalizeTrainings(value.trainings || value.workouts), reflection: String(value.reflection || value.note || ''), checkIn, kai };
  });
  const achievementAliases = { perfect: 'firstVictory', athlete: 'training10' };
  clean.achievements = Array.isArray(raw.achievements) ? [...new Set(raw.achievements.map(id => achievementAliases[id] || id).filter(id => ACHIEVEMENTS.some(a => a.id === id)))] : [];
  const meta = raw.meta && typeof raw.meta === 'object' ? raw.meta : {};
  clean.meta = { lastOpenedDate: /^\d{4}-\d{2}-\d{2}$/.test(meta.lastOpenedDate) ? meta.lastOpenedDate : null, lastBackupAt: meta.lastBackupAt || raw.lastBackupAt || null, recentKaiMessages: Array.isArray(meta.recentKaiMessages) ? meta.recentKaiMessages.slice(-8).map(String) : [] };
  return clean;
}
function loadState() {
  for (const key of [STORAGE_KEY, ...PREVIOUS_KEYS]) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) continue;
      const loaded = normalizeState(JSON.parse(stored));
      if (key !== STORAGE_KEY) localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
      return loaded;
    } catch (error) { console.warn(`No se pudo migrar ${key}:`, error); }
  }
  return emptyState();
}
function saveState() { state.version = 4; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function day(key = currentDate, create = true) { if (!state.days[key] && create) state.days[key] = emptyDay(); return state.days[key]; }
function habitDone(record, id) { const habit = HABITS.find(h => h.id === id); return habit?.goal ? (record?.minutes?.[id] || 0) >= habit.goal : Boolean(record?.habits?.[id]); }
function completedFor(record) { return record ? HABITS.filter(h => habitDone(record, h.id)).length : 0; }
function perfectDays(s = state) { return Object.values(s.days).filter(record => completedFor(record) === HABITS.length).length; }
function minutesXP(id, minutes) { if (id === 'english') return minutes >= 90 ? 40 : minutes >= 60 ? 30 : minutes >= 30 ? 20 : 0; return minutes >= 60 ? 30 : minutes >= 40 ? 23 : minutes >= 20 ? 15 : 0; }
function startOfWeek(date = new Date()) { const result = new Date(date); result.setHours(0, 0, 0, 0); result.setDate(result.getDate() - ((result.getDay() + 6) % 7)); return result; }
function weekKey(date = new Date()) { return dateKey(startOfWeek(date)); }
function groupedTraining(s = state) { const weeks = {}; Object.entries(s.days).forEach(([key, record]) => { const week = weekKey(parseDate(key)); weeks[week] ||= { bike: 0, strength: 0, rope: 0 }; normalizeTrainings(record.trainings).forEach(id => { weeks[week][id] += 1; }); }); return weeks; }
function weeklyCount(id, reference = new Date(), s = state) { return groupedTraining(s)[weekKey(reference)]?.[id] || 0; }
function wonWeeks(s = state) { return Object.entries(groupedTraining(s)).filter(([, counts]) => TRAININGS.every(t => counts[t.id] >= t.goal)).map(([key]) => key).sort(); }
function calculateXP(s = state) {
  let xp = Object.values(s.days).reduce((sum, record) => sum + HABITS.filter(h => !h.goal).reduce((n, h) => n + (habitDone(record, h.id) ? h.xp : 0), 0) + minutesXP('english', record.minutes?.english || 0) + minutesXP('reading', record.minutes?.reading || 0) + (completedFor(record) === 6 ? 20 : 0), 0);
  Object.values(groupedTraining(s)).forEach(counts => TRAININGS.forEach(t => { xp += Math.min(counts[t.id], t.goal) * t.xp + (counts[t.id] > t.goal ? t.extra : 0); }));
  return xp + wonWeeks(s).length * 50;
}
function levelData(xp = calculateXP()) { const level = Math.floor(Math.sqrt(xp / 75)) + 1; const floor = 75 * (level - 1) ** 2; const ceiling = 75 * level ** 2; return { level, ceiling, progress: (xp - floor) / (ceiling - floor) * 100 }; }
function consecutive(keys, unitDays, origin) { let best = 0; let run = 0; let previous; keys.forEach(key => { const date = parseDate(key); run = previous && Math.round((date - previous) / 86400000) === unitDays ? run + 1 : 1; best = Math.max(best, run); previous = date; }); let cursor = origin(); if (!keys.includes(dateKey(cursor))) cursor.setDate(cursor.getDate() - unitDays); let current = 0; while (keys.includes(dateKey(cursor))) { current += 1; cursor.setDate(cursor.getDate() - unitDays); } return { current, best }; }
function streaks(s = state) { return consecutive(Object.entries(s.days).filter(([, record]) => completedFor(record) === 6).map(([key]) => key).sort(), 1, () => new Date()); }
function weeklyStreaks(s = state) { return consecutive(wonWeeks(s), 7, () => startOfWeek()); }
function consistency7(s = state) { let done = 0; for (let i = 0; i < 7; i += 1) { const date = new Date(); date.setDate(date.getDate() - i); done += completedFor(s.days[dateKey(date)]); } return Math.round(done / 42 * 100); }
function totalMinutes(id, s = state) { return Object.values(s.days).reduce((sum, record) => sum + (record.minutes?.[id] || 0), 0); }
function averageMinutes(id, s = state) { let total = 0; for (let i = 0; i < 7; i += 1) { const date = new Date(); date.setDate(date.getDate() - i); total += s.days[dateKey(date)]?.minutes?.[id] || 0; } return Math.round(total / 7); }
function trainingCount(s = state) { return Object.values(s.days).reduce((sum, record) => sum + normalizeTrainings(record.trainings).length, 0); }
function trainingOccurrences(id, s = state) { return Object.values(s.days).reduce((sum, record) => sum + normalizeTrainings(record.trainings).filter(item => item === id).length, 0); }
function hasMinutes(s, id, minimum) { return Object.values(s.days).some(record => (record.minutes?.[id] || 0) >= minimum); }
function hasWeeklyTraining(s, id, minimum) { return Object.values(groupedTraining(s)).some(counts => counts[id] >= minimum); }
function escapeHTML(value) { const element = document.createElement('div'); element.textContent = value; return element.innerHTML; }

function pickKaiMessage(group) {
  const pool = KAI_MESSAGES[group] || KAI_MESSAGES.start;
  const recent = state.meta.recentKaiMessages || [];
  const available = pool.filter(message => !recent.slice(-3).includes(message));
  const message = (available.length ? available : pool)[Math.floor(Math.random() * (available.length || pool.length))];
  state.meta.recentKaiMessages = [...recent, message].slice(-8);
  return message;
}
function baseKaiContext(record) {
  const done = completedFor(record);
  if (absenceDays >= 2) return 'return';
  if (done === 6) return 'complete';
  if (done === 5) return 'almost';
  if (done >= 3) return 'middle';
  if (done >= 1) return 'early';
  return 'start';
}
function setKaiEvent(context, delay = 0) {
  const record = day();
  record.kai ||= {};
  const protectedDelay = ['almost', 'complete'].includes(baseKaiContext(record)) ? 2100 : 0;
  const showDelay = Math.max(delay, protectedDelay);
  record.kai.event = { context, message: pickKaiMessage(context), createdAt: Date.now(), showAfter: Date.now() + showDelay, expiresAt: Date.now() + showDelay + 120000 };
  if (showDelay) setTimeout(() => { renderToday(); saveState(); }, showDelay + 20);
}
function kaiMessage(record) {
  record.kai ||= {};
  const base = baseKaiContext(record);
  const event = record.kai.event;
  const eventVisible = event && Date.now() >= Number(event.showAfter || 0) && Date.now() < Number(event.expiresAt || 0);
  const context = eventVisible ? event.context : base;
  if (eventVisible) return event.message;
  if (record.kai.context !== context || !record.kai.message) {
    record.kai.context = context;
    record.kai.message = pickKaiMessage(context);
  }
  return record.kai.message;
}
function recommendedMission(record) {
  const pending = HABITS.filter(h => !habitDone(record, h.id));
  if (pending.length === 1) return { type: 'habit', id: pending[0].id, label: pending[0].goal ? `${pending[0].name} ${pending[0].goal} min` : pending[0].name };
  if (pending.length) {
    const priorities = { low: ['bed', 'room', 'water', 'reading', 'english', 'sleep'], normal: ['bed', 'room', 'english', 'water', 'reading', 'sleep'], high: ['english', 'reading', 'bed', 'room', 'water', 'sleep'] };
    const energy = record.checkIn?.energy || 'normal';
    const habit = priorities[energy].map(id => pending.find(item => item.id === id)).find(Boolean) || pending[0];
    return { type: 'habit', id: habit.id, label: habit.goal ? `${habit.name} ${habit.goal} min` : habit.name };
  }
  const trainedToday = normalizeTrainings(record.trainings).length > 0;
  const behind = TRAININGS.filter(t => weeklyCount(t.id) < t.goal).sort((a, b) => (weeklyCount(a.id) / a.goal) - (weeklyCount(b.id) / b.goal));
  if (!trainedToday && behind.length) return { type: 'training', id: behind[0].id, label: `${behind[0].name} · sesión semanal` };
  return { type: 'rest', label: 'Día cerrado. Descansa.' };
}

function minuteFeedback(id, value) { const goal = id === 'english' ? 30 : 20; if (value < goal) return `${value} min · hábito pendiente`; const extra = value - goal; return extra ? `Meta cumplida ✓ · +${extra} min extra 🔥` : 'Meta cumplida ✓'; }
function renderToday() {
  const record = day(); const done = completedFor(record); const percent = Math.round(done / 6 * 100); const xp = calculateXP(); const level = levelData(xp); const streak = streaks();
  document.querySelector('#days-left').textContent = Math.max(0, Math.ceil((TARGET_DATE - new Date().setHours(0, 0, 0, 0)) / 86400000));
  document.querySelector('#daily-percent').textContent = `${percent}%`; document.querySelector('#daily-bar').style.width = `${percent}%`; document.querySelector('#daily-count').textContent = `${done} / 6`;
  document.querySelector('#hero-xp').textContent = `${xp.toLocaleString('es-CL')} XP`; document.querySelector('#hero-level').textContent = `NIVEL ${level.level}`; document.querySelector('#hero-streak').textContent = streak.current;
  document.querySelector('#perfect-day').classList.toggle('show', done === 6); document.querySelector('#perfect-week').classList.toggle('show', wonWeeks().includes(weekKey()));
  document.querySelector('#kai-message').textContent = kaiMessage(record);
  const mission = recommendedMission(record); const missionButton = document.querySelector('#next-mission'); missionButton.dataset.type = mission.type; missionButton.dataset.id = mission.id || ''; document.querySelector('#next-mission-label').textContent = mission.label;
  document.querySelector('#habit-list').innerHTML = HABITS.map(habit => {
    const complete = habitDone(record, habit.id); const value = record.minutes?.[habit.id] || 0;
    if (habit.goal) return `<article class="habit-card minute-card ${complete ? 'completed' : ''}" id="habit-${habit.id}"><span class="habit-icon">${habit.icon}</span><span class="habit-info"><strong>${habit.name}</strong><small>${value} min · ${minutesXP(habit.id, value)} XP</small></span><span class="checkmark"></span><div class="minute-actions">${habit.steps.map((step, index) => `<button class="${value === step ? 'active' : ''}" data-minutes="${habit.id}" data-value="${step}">${step}${index === 2 ? '+' : ''} min</button>`).join('')}<button data-show-manual="${habit.id}">Otro</button><label class="manual-wrap" data-manual-wrap="${habit.id}" hidden><input data-manual="${habit.id}" type="number" min="0" max="1440" inputmode="numeric" value="${value}" aria-label="Minutos manuales de ${habit.name}"><b>min · guardar al salir</b></label></div><div class="minute-feedback">${minuteFeedback(habit.id, value)}</div></article>`;
    return `<button class="habit-card ${complete ? 'completed' : ''}" id="habit-${habit.id}" data-habit="${habit.id}" aria-pressed="${complete}"><span class="habit-icon">${habit.icon}</span><span class="habit-info"><strong>${habit.name}</strong><small>${habit.detail}${habit.help ? `<em>${habit.help}</em>` : ''}</small></span><span class="checkmark"></span></button>`;
  }).join('');
  document.querySelectorAll('[data-habit]').forEach(button => button.addEventListener('click', () => toggleHabit(button.dataset.habit)));
  document.querySelectorAll('[data-minutes]').forEach(button => button.addEventListener('click', () => setMinutes(button.dataset.minutes, button.dataset.value)));
  document.querySelectorAll('[data-show-manual]').forEach(button => button.addEventListener('click', () => { const label = document.querySelector(`[data-manual-wrap="${button.dataset.showManual}"]`); label.hidden = !label.hidden; if (!label.hidden) label.querySelector('input').focus(); }));
  document.querySelectorAll('[data-manual]').forEach(input => input.addEventListener('change', () => setMinutes(input.dataset.manual, input.value)));
  renderTrainings(); renderTrainingWeek(); document.querySelector('#reflection').value = record.reflection || '';
  const start = startOfWeek(); const end = new Date(start); end.setDate(end.getDate() + 6); document.querySelector('#week-label').textContent = `${start.getDate()}–${end.getDate()} ${end.toLocaleDateString('es-CL', { month: 'short' })}`;
  saveState();
}
function trainingStatus(training, count) {
  if (count < training.goal) return { label: 'META', xp: `+${training.xp} XP` };
  if (count === training.goal) return { label: 'META COMPLETA · EXTRA DISPONIBLE', xp: `próxima +${training.extra} XP` };
  if (count === training.goal + 1) return { label: 'EXTRA COMPLETADO', xp: `+${training.extra} XP` };
  return { label: 'EXTRA COMPLETADO', xp: 'sesiones posteriores · 0 XP adicional' };
}
function renderTrainings() {
  const today = normalizeTrainings(day().trainings);
  document.querySelector('#training-list').innerHTML = TRAININGS.map(training => { const count = weeklyCount(training.id); const status = trainingStatus(training, count); const doneToday = today.includes(training.id); return `<article class="training-card" id="training-${training.id}"><div class="training-main"><span>${training.icon}</span><div class="training-copy"><strong>${training.name}</strong><small>${status.label} · ${status.xp}</small></div><strong class="training-count">${count} / ${training.goal}</strong><button class="training-add ${doneToday ? 'done' : ''}" data-training="${training.id}" aria-pressed="${doneToday}" aria-label="${doneToday ? 'Eliminar' : 'Registrar'} ${training.name}">${doneToday ? 'Hecho ✓' : '+ Registrar'}</button></div><div class="progress-track"><span style="width:${Math.min(100, count / training.goal * 100)}%"></span></div></article>`; }).join('');
  document.querySelectorAll('[data-training]').forEach(button => button.addEventListener('click', () => toggleTraining(button.dataset.training)));
}
function renderTrainingWeek() { const start = startOfWeek(); document.querySelector('#training-week').innerHTML = Array.from({ length: 7 }, (_, index) => { const date = new Date(start); date.setDate(date.getDate() + index); const sessions = normalizeTrainings(state.days[dateKey(date)]?.trainings); const icons = sessions.map(id => TRAININGS.find(t => t.id === id)?.icon).join(''); return `<div class="training-day"><strong>${['L', 'M', 'X', 'J', 'V', 'S', 'D'][index]}</strong><span>${icons || '·'}</span></div>`; }).join(''); }

function cloneState(value = state) { return JSON.parse(JSON.stringify(value)); }
function clearTransientFeedback() { closeModal('#achievement-modal'); const celebration = document.querySelector('#celebration'); celebration.classList.remove('show'); }
function withTransaction(message, mutate, after) {
  const snapshot = cloneState();
  mutate();
  saveState();
  const unlocked = checkAchievements();
  renderAll();
  if (after) after(unlocked);
  showToast(message, () => { state = snapshot; saveState(); clearTransientFeedback(); renderAll(); });
}
function maybeSetStreakEvent(previousBest) {
  const streak = streaks();
  if ([4, 7].includes(streak.current) || streak.best > previousBest) setKaiEvent('streak', 2100);
}
function toggleHabit(id) {
  const previous = Boolean(day().habits[id]); const wasPerfect = completedFor(day()) === 6; const previousBest = streaks().best;
  withTransaction(previous ? 'Misión desmarcada' : 'Misión completada ✓', () => { day().habits[id] = !previous; if (!wasPerfect && completedFor(day()) === 6) maybeSetStreakEvent(previousBest); }, () => { if (!wasPerfect && completedFor(day()) === 6) celebrate('PERFECT DAY ✨', 'DÍA GANADO · +20 XP'); });
}
function setMinutes(id, raw) {
  const previous = day().minutes[id] || 0; const next = clampMinutes(raw); const wasPerfect = completedFor(day()) === 6; const previousBest = streaks().best;
  withTransaction(`${next} min guardados ✓`, () => { day().minutes[id] = next; if (id === 'english' && previous < 60 && next >= 60) setKaiEvent('englishExtra'); if (id === 'reading' && previous < 40 && next >= 40) setKaiEvent('readingExtra'); if (!wasPerfect && completedFor(day()) === 6) maybeSetStreakEvent(previousBest); }, () => { if (!wasPerfect && completedFor(day()) === 6) celebrate('PERFECT DAY ✨', 'DÍA GANADO · +20 XP'); });
}
function toggleTraining(id) {
  const sessions = normalizeTrainings(day().trainings); const exists = sessions.includes(id); const weekWasWon = wonWeeks().includes(weekKey()); const countBefore = weeklyCount(id); const training = TRAININGS.find(t => t.id === id);
  withTransaction(exists ? 'Entrenamiento eliminado' : 'Entrenamiento registrado ✓', () => { day().trainings = exists ? sessions.filter(session => session !== id) : [...sessions, id]; if (!exists && countBefore === training.goal) setKaiEvent('trainingExtra'); }, () => { if (!weekWasWon && wonWeeks().includes(weekKey())) celebrate('PERFECT WEEK 🏆', 'SEMANA GANADA · +50 XP'); });
}

function renderProgress() {
  const xp = calculateXP(); const level = levelData(xp); const daily = streaks(); const weekly = weeklyStreaks();
  const values = { 'metric-daily-streak': daily.current, 'metric-perfect': perfectDays(), 'progress-level': level.level, 'progress-xp': xp.toLocaleString('es-CL'), 'metric-7': `${consistency7()}%`, 'metric-english': `${totalMinutes('english').toLocaleString('es-CL')} min`, 'metric-reading': `${totalMinutes('reading').toLocaleString('es-CL')} min`, 'metric-english-avg': averageMinutes('english'), 'metric-reading-avg': averageMinutes('reading'), 'metric-weeks': wonWeeks().length, 'metric-weekly-streak': weekly.current, 'metric-best': daily.best, 'metric-weekly-best': weekly.best };
  Object.entries(values).forEach(([id, value]) => { document.querySelector(`#${id}`).textContent = value; });
  document.querySelector('#level-bar').style.width = `${level.progress}%`; document.querySelector('#next-level').textContent = `${level.ceiling - xp} XP para el siguiente nivel`;
  document.querySelector('#skills-list').innerHTML = SKILLS.map(skill => { const value = skill.value(state); const nextIndex = skill.milestones.findIndex(m => value < m); const levelNumber = nextIndex === -1 ? skill.milestones.length : nextIndex; const previous = levelNumber === 0 ? 0 : skill.milestones[levelNumber - 1]; const next = nextIndex === -1 ? skill.milestones.at(-1) : skill.milestones[nextIndex]; const progress = nextIndex === -1 ? 100 : Math.max(0, (value - previous) / (next - previous) * 100); return `<article class="skill"><div class="skill-head"><strong>${skill.name}</strong><span>Nivel ${levelNumber}${nextIndex === -1 ? ' · máximo' : ''}</span></div><div class="skill-data">${value.toLocaleString('es-CL')} ${skill.unit}${nextIndex === -1 ? '' : ` · próximo hito: ${next}`}</div><div class="progress-track"><span style="width:${progress}%"></span></div></article>`; }).join('');
  document.querySelector('#achievements-list').innerHTML = ACHIEVEMENTS.map(achievement => { const unlocked = state.achievements.includes(achievement.id) || achievement.test(state); return `<article class="achievement ${unlocked ? 'unlocked' : ''}"><span>${unlocked ? achievement.icon : '◌'}</span><strong>${achievement.name}</strong><small>${achievement.description}</small></article>`; }).join('');
}
function checkAchievements() { const unlocked = ACHIEVEMENTS.filter(a => !a.legacy && !state.achievements.includes(a.id) && a.test(state)); if (!unlocked.length) return []; state.achievements.push(...unlocked.map(a => a.id)); saveState(); showAchievement(unlocked[0]); return unlocked; }
function showAchievement(achievement) { document.querySelector('#achievement-icon').textContent = achievement.icon; document.querySelector('#achievement-title').textContent = achievement.name; document.querySelector('#achievement-description').textContent = achievement.description; openModal('#achievement-modal'); }
function renderCalendar() { const year = calendarDate.getFullYear(); const month = calendarDate.getMonth(); document.querySelector('#calendar-month').textContent = new Date(year, month, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }); let html = '<span></span>'.repeat((new Date(year, month, 1).getDay() + 6) % 7); for (let number = 1; number <= new Date(year, month + 1, 0).getDate(); number += 1) { const key = dateKey(new Date(year, month, number)); const record = state.days[key]; const done = completedFor(record); const status = record ? (done === 6 ? 'great' : done >= 3 ? 'partial' : 'low') : ''; html += `<button class="calendar-day ${status} ${key === currentDate ? 'today' : ''} ${key === selectedCalendarDate ? 'selected' : ''}" data-date="${key}">${number}</button>`; } document.querySelector('#calendar-grid').innerHTML = html; document.querySelectorAll('.calendar-day').forEach(button => button.addEventListener('click', () => { selectedCalendarDate = button.dataset.date; renderCalendar(); renderDayDetail(selectedCalendarDate); })); }
function renderDayDetail(key) { const box = document.querySelector('#day-detail'); const record = state.days[key]; if (!record) { box.className = 'day-detail empty'; box.innerHTML = '<p>Sin registro. No creamos días vacíos por ausencia.</p>'; return; } const trainings = normalizeTrainings(record.trainings); box.className = 'day-detail'; box.innerHTML = `<h3>${parseDate(key).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} · ${completedFor(record) === 6 ? 'Día ganado ✨' : `${completedFor(record)}/6`}</h3><div class="detail-habits">${HABITS.map(h => `<span class="${habitDone(record, h.id) ? 'done' : ''}">${habitDone(record, h.id) ? '✓' : '○'} ${h.icon} ${h.name}</span>`).join('')}</div><p class="detail-meta">🇬🇧 Inglés: ${record.minutes?.english || 0} min<br>📖 Lectura: ${record.minutes?.reading || 0} min<br>Entrenamiento: ${trainings.length ? trainings.map(id => TRAININGS.find(t => t.id === id)?.name).join(', ') : 'Sin sesiones'}</p>${record.reflection ? `<blockquote>${escapeHTML(record.reflection)}</blockquote>` : ''}`; }
function renderSettings() { const backup = state.meta.lastBackupAt ? new Date(state.meta.lastBackupAt) : null; const age = backup && !Number.isNaN(backup.getTime()) ? Math.floor((Date.now() - backup.getTime()) / 86400000) : null; document.querySelector('#last-backup').textContent = age === null ? 'Nunca' : age === 0 ? 'Hoy' : `hace ${age} día${age === 1 ? '' : 's'}`; document.querySelector('#backup-warning').textContent = age === null || age >= 14 ? 'Hace tiempo que no haces un respaldo.' : ''; }
function renderAll() { renderToday(); renderProgress(); renderCalendar(); renderSettings(); }

function showToast(message, undo) { const toast = document.querySelector('#toast'); const button = document.querySelector('#undo-action'); document.querySelector('#toast-message').textContent = message; undoCallback = undo || null; button.hidden = !undoCallback; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(hideToast, undoCallback ? 6000 : 2600); }
function hideToast() { document.querySelector('#toast').classList.remove('show'); undoCallback = null; }
function celebrate(title, subtitle) { const element = document.querySelector('#celebration'); element.querySelector('strong').textContent = title; element.querySelector('b').textContent = subtitle; element.classList.remove('show'); void element.offsetWidth; element.classList.add('show'); setTimeout(() => element.classList.remove('show'), 2000); }
function openModal(selector) { const modal = document.querySelector(selector); modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); }
function closeModal(selector) { const modal = document.querySelector(selector); modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }
function download(name, content, type) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500); }
function exportJSON() { state.meta.lastBackupAt = new Date().toISOString(); saveState(); download(`kai-irlanda-backup-${currentDate}.json`, JSON.stringify({ ...state, exportedAt: state.meta.lastBackupAt }, null, 2), 'application/json'); renderSettings(); showToast('Backup exportado ✓'); }
function exportCSV() { const header = ['fecha', ...HABITS.map(h => h.id), 'english_minutes', 'reading_minutes', ...TRAININGS.map(t => t.id), 'dia_ganado', 'reflexion']; const quote = value => `"${String(value).replaceAll('"', '""')}"`; const rows = Object.keys(state.days).sort().map(key => { const record = state.days[key]; const sessions = normalizeTrainings(record.trainings); return [key, ...HABITS.map(h => habitDone(record, h.id) ? 1 : 0), record.minutes?.english || 0, record.minutes?.reading || 0, ...TRAININGS.map(t => sessions.filter(id => id === t.id).length), completedFor(record) === 6 ? 1 : 0, record.reflection || ''].map(quote).join(','); }); download(`kai-irlanda-historial-${currentDate}.csv`, `\ufeff${header.join(',')}\n${rows.join('\n')}`, 'text/csv;charset=utf-8'); showToast('Historial CSV exportado ✓'); }
async function importJSON(event) { const file = event.target.files[0]; if (!file) return; try { const parsed = JSON.parse(await file.text()); const normalized = normalizeState(parsed.data || parsed); if (!Object.keys(normalized.days).length && !window.confirm('El archivo no contiene días guardados. ¿Importarlo igualmente?')) return; state = normalized; saveState(); renderAll(); showToast('Backup importado correctamente ✓'); } catch (error) { window.alert('No pudimos importar ese archivo. Revisa que sea un backup JSON válido.'); } finally { event.target.value = ''; } }
function deleteAllData() { PREVIOUS_KEYS.forEach(key => localStorage.removeItem(key)); localStorage.removeItem(STORAGE_KEY); state = emptyState(); state.meta.lastOpenedDate = currentDate; saveState(); }
function switchView(name) { document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `view-${name}`)); document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === name)); window.scrollTo(0, 0); }
function answerSleep(slept) { const record = day(); record.checkIn.sleep = Boolean(slept); record.habits.sleep = Boolean(slept); saveState(); renderToday(); prepareCheckIn(); }
function finishCheckIn(energy) { const record = day(); record.checkIn.energy = energy; record.checkIn.completedAt = new Date().toISOString(); saveState(); closeModal('#checkin-modal'); renderAll(); showToast('Check-in guardado ✓'); }
function prepareCheckIn() { const answeredSleep = typeof day().checkIn?.sleep === 'boolean'; document.querySelector('#checkin-sleep').hidden = answeredSleep; document.querySelector('#checkin-energy').hidden = !answeredSleep; }
function dismissCheckIn() { day().checkIn.dismissedAt = new Date().toISOString(); saveState(); closeModal('#checkin-modal'); }
function maybeShowCheckIn() { const checkIn = day().checkIn || {}; if (!checkIn.completedAt && !checkIn.dismissedAt) setTimeout(() => { prepareCheckIn(); openModal('#checkin-modal'); }, 450); }
function detectDateChange() { const now = dateKey(); if (now !== currentDate) { currentDate = now; calendarDate = new Date(); absenceDays = daysBetween(state.meta.lastOpenedDate, currentDate); state.meta.lastOpenedDate = currentDate; saveState(); renderAll(); maybeShowCheckIn(); showToast('Nuevo día. Partamos simple.'); } }

function bindEvents() {
  document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
  document.querySelector('#next-mission').addEventListener('click', event => { const button = event.currentTarget; const target = button.dataset.type === 'habit' ? document.querySelector(`#habit-${button.dataset.id}`) : button.dataset.type === 'training' ? document.querySelector(`#training-${button.dataset.id}`) : null; if (!target) return; target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.classList.remove('mission-highlight'); void target.offsetWidth; target.classList.add('mission-highlight'); setTimeout(() => target.classList.remove('mission-highlight'), 750); });
  document.querySelector('#reflection').addEventListener('input', event => { day().reflection = event.target.value; document.querySelector('#save-status').textContent = 'Guardando…'; clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveState(); document.querySelector('#save-status').textContent = 'Guardado en este dispositivo ✓'; }, 350); });
  document.querySelector('#prev-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); }); document.querySelector('#next-month').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });
  document.querySelector('#undo-action').addEventListener('click', () => { if (undoCallback) undoCallback(); hideToast(); showToast('Cambio deshecho'); });
  document.querySelectorAll('[data-close-checkin]').forEach(button => button.addEventListener('click', dismissCheckIn));
  document.querySelectorAll('[data-sleep]').forEach(button => button.addEventListener('click', () => answerSleep(button.dataset.sleep === 'true')));
  document.querySelectorAll('[data-energy]').forEach(button => button.addEventListener('click', () => finishCheckIn(button.dataset.energy)));
  document.querySelector('#close-achievement').addEventListener('click', () => closeModal('#achievement-modal'));
  document.querySelector('#export-json').addEventListener('click', exportJSON); document.querySelector('#export-csv').addEventListener('click', exportCSV); document.querySelector('#import-json').addEventListener('change', importJSON);
  document.querySelector('#reset-today').addEventListener('click', () => { if (window.confirm('¿Reiniciar hábitos, minutos, entrenamientos, reflexión y check-in de hoy?')) { delete state.days[currentDate]; saveState(); renderAll(); maybeShowCheckIn(); showToast('Día reiniciado'); } });
  document.querySelector('#reset-all').addEventListener('click', () => { document.querySelector('#delete-confirmation').value = ''; document.querySelector('#confirm-delete').disabled = true; openModal('#delete-modal'); });
  document.querySelector('#delete-confirmation').addEventListener('input', event => { document.querySelector('#confirm-delete').disabled = event.target.value !== 'BORRAR'; });
  document.querySelector('#cancel-delete').addEventListener('click', () => closeModal('#delete-modal'));
  document.querySelector('#confirm-delete').addEventListener('click', () => { if (document.querySelector('#delete-confirmation').value !== 'BORRAR') return; deleteAllData(); closeModal('#delete-modal'); renderAll(); maybeShowCheckIn(); showToast('Datos eliminados'); });
  document.querySelector('#apply-update').addEventListener('click', () => { pendingWorker?.postMessage({ type: 'SKIP_WAITING' }); });
}
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => { try { const registration = await navigator.serviceWorker.register('./sw.js'); const showUpdate = worker => { pendingWorker = worker; document.querySelector('#update-banner').classList.add('show'); }; if (registration.waiting) showUpdate(registration.waiting); registration.addEventListener('updatefound', () => { const worker = registration.installing; worker.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(worker); }); }); let refreshing = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; window.location.reload(); }); } catch (error) { console.warn('Service worker:', error); } });
}

bindEvents();
state.meta.lastOpenedDate = currentDate;
saveState();
renderAll();
checkAchievements();
maybeShowCheckIn();
registerServiceWorker();
setInterval(detectDateChange, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) detectDateChange(); });
