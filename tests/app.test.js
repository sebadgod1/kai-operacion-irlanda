'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync('app.js', 'utf8').split('\nbindEvents();')[0];
function element() { return { hidden: false, value: '', textContent: '', dataset: {}, style: {}, classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, querySelector: () => element(), scrollIntoView() {} }; }
function boot(seed = {}) {
  const store = { ...seed }; const nodes = new Map(); let scheduled = 0;
  const document = { createElement: () => element(), querySelector: key => { if (!nodes.has(key)) nodes.set(key, element()); return nodes.get(key); }, querySelectorAll: () => [] };
  const context = { console, Date, Math, JSON, document, window: { scrollTo() {}, confirm: () => true, alert() {}, location: { reload() {} } }, navigator: {}, Blob, URL, setInterval: () => 0, clearTimeout() {}, setTimeout: fn => { scheduled += 1; return scheduled; }, localStorage: { getItem: key => store[key] ?? null, setItem: (key, value) => { store[key] = value; }, removeItem: key => { delete store[key]; } } };
  vm.createContext(context); vm.runInContext(source, context); return { context, store, nodes, scheduled: () => scheduled };
}
function run(context, code) { return vm.runInContext(code, context); }
function legacy(version, achievements = []) { return { version, days: { '2026-09-20': { habits: { bed: true, room: true, water: true, sleep: true }, minutes: { english: 61, reading: 42 }, trainings: ['bike', 'strength'], reflection: 'nota conservada' } }, achievements }; }
for (const version of [1, 2, 3]) {
  const achievements = version === 3 ? ['perfect', 'athlete', 'english5', 'streak7', 'xp1000'] : [];
  const { store } = boot({ [`kai-irlanda-v${version}`]: JSON.stringify(legacy(version, achievements)) });
  const migrated = JSON.parse(store['kai-irlanda-v4']);
  assert.equal(migrated.days['2026-09-20'].minutes.english, 61);
  assert.equal(migrated.days['2026-09-20'].reflection, 'nota conservada');
  assert.deepEqual(migrated.days['2026-09-20'].trainings, ['bike', 'strength']);
  assert.ok(store[`kai-irlanda-v${version}`]);
  if (version === 3) assert.deepEqual(migrated.achievements.sort(), ['athlete', 'english5', 'firstVictory', 'streak7', 'training10', 'xp1000'].filter(id => id !== 'athlete').sort());
}
{
  const { context } = boot();
  run(context, "state.days={}; const start=startOfWeek(); for(let i=0;i<4;i++){const d=new Date(start);d.setDate(d.getDate()+i);state.days[dateKey(d)]={...emptyDay(),trainings:['bike']}};");
  const before = run(context, 'calculateXP()');
  run(context, "(()=>{const d=new Date(startOfWeek());d.setDate(d.getDate()+4);state.days[dateKey(d)]={...emptyDay(),trainings:['bike']}})()");
  assert.equal(run(context, 'calculateXP()-' + before), 18);
  const fifth = run(context, 'calculateXP()');
  run(context, "(()=>{const d=new Date(startOfWeek());d.setDate(d.getDate()+5);state.days[dateKey(d)]={...emptyDay(),trainings:['bike']}})()");
  assert.equal(run(context, 'calculateXP()-' + fifth), 0, 'sixth session adds no XP');
  assert.equal(run(context, 'calculateXP()'), fifth);
}
{
  const { context } = boot();
  run(context, "renderAll=()=>{}; celebrate=()=>{}; showAchievement=()=>{}; let capturedUndo; showToast=(m,u)=>{capturedUndo=u};");
  run(context, "day().trainings=[]; toggleTraining('bike')"); assert.deepEqual(run(context, "day().trainings"), ['bike']);
  run(context, "toggleTraining('bike')"); assert.deepEqual(run(context, "day().trainings"), []); run(context, 'capturedUndo()'); assert.deepEqual(run(context, "day().trainings"), ['bike']);
  run(context, "day().trainings=[]; toggleTraining('bike'); toggleTraining('strength')"); assert.deepEqual(run(context, "day().trainings.sort()"), ['bike', 'strength']);
  run(context, "(()=>{const initial=cloneState(); toggleHabit('bed'); capturedUndo(); globalThis.undoHabitOk=JSON.stringify(state)===JSON.stringify(initial)})()"); assert.equal(run(context, 'undoHabitOk'), true);
  run(context, "(()=>{const initial=cloneState(); setMinutes('english',60); capturedUndo(); globalThis.undoMinutesOk=JSON.stringify(state)===JSON.stringify(initial)})()"); assert.equal(run(context, 'undoMinutesOk'), true);
  run(context, "(()=>{state=emptyState(); const r=day(); Object.assign(r.habits,{bed:true,room:true,water:true,sleep:true}); r.minutes={english:30,reading:0}; const initial=cloneState(); setMinutes('reading',20); globalThis.gotPerfect=state.achievements.includes('firstVictory'); capturedUndo(); globalThis.undoPerfectOk=JSON.stringify(state)===JSON.stringify(initial)})()"); assert.equal(run(context, 'gotPerfect'), true); assert.equal(run(context, 'undoPerfectOk'), true);
  run(context, "(()=>{state=emptyState(); const start=startOfWeek(); for(let i=0;i<4;i++){const d=new Date(start);d.setDate(d.getDate()+i);state.days[dateKey(d)]={...emptyDay(),trainings:['bike']}} for(const i of [0,2,3]){const d=new Date(start);d.setDate(d.getDate()+i);state.days[dateKey(d)].trainings.push('strength')} for(let i=0;i<3;i++){const d=new Date(start);d.setDate(d.getDate()+i);state.days[dateKey(d)].trainings.push('rope')} state.days[currentDate] ||= emptyDay(); state.days[currentDate].trainings=normalizeTrainings(state.days[currentDate].trainings).filter(x=>x!=='strength'); const initial=cloneState(); toggleTraining('strength'); globalThis.gotWeek=wonWeeks().includes(weekKey()); capturedUndo(); globalThis.undoWeekOk=JSON.stringify(state)===JSON.stringify(initial)})()"); assert.equal(run(context, 'gotWeek'), true); assert.equal(run(context, 'undoWeekOk'), true);
}
{
  const { context, scheduled } = boot();
  run(context, "let renders=0; renderToday=()=>{renders++}; prepareCheckIn=()=>{}; day().checkIn={}; answerSleep(true)"); assert.equal(run(context, 'day().habits.sleep'), true); assert.equal(run(context, 'day().checkIn.sleep'), true);
  run(context, "finishCheckIn('high')"); assert.equal(run(context, 'day().checkIn.energy'), 'high'); assert.ok(run(context, 'day().checkIn.completedAt'));
  run(context, "day().checkIn={sleep:false}; dismissCheckIn()"); assert.equal(run(context, 'day().checkIn.sleep'), false); assert.ok(run(context, 'day().checkIn.dismissedAt'));
  const before = scheduled(); run(context, 'maybeShowCheckIn()'); assert.equal(scheduled(), before);
}
{
  const { context, store } = boot({ 'kai-irlanda-v1': '{}', 'kai-irlanda-v2': '{}', 'kai-irlanda-v3': '{}' });
  run(context, 'deleteAllData()');
  assert.deepEqual(Object.keys(store), ['kai-irlanda-v4']);
}
{
  const { context } = boot();
  run(context, "absenceDays=0; let r=day(); globalThis.start=baseKaiContext(r); globalThis.first=kaiMessage(r); globalThis.second=kaiMessage(r); r.habits={bed:true,room:true,water:true}; globalThis.middle=baseKaiContext(r); r.habits.sleep=true;r.minutes={english:30,reading:0};globalThis.almost=baseKaiContext(r);r.minutes.reading=20;globalThis.complete=baseKaiContext(r);absenceDays=2;globalThis.returning=baseKaiContext(r)");
  assert.equal(run(context, 'start'), 'start'); assert.equal(run(context, 'first'), run(context, 'second')); assert.equal(run(context, 'middle'), 'middle'); assert.equal(run(context, 'almost'), 'almost'); assert.equal(run(context, 'complete'), 'complete'); assert.equal(run(context, 'returning'), 'return');
  run(context, "absenceDays=0; state.days[currentDate]=emptyDay(); setKaiEvent('englishExtra'); globalThis.englishEvent=kaiMessage(day()); day().kai={}; setKaiEvent('readingExtra'); globalThis.readingEvent=kaiMessage(day()); day().kai={}; setKaiEvent('trainingExtra'); globalThis.trainingEvent=kaiMessage(day())");
  assert.ok(run(context, "KAI_MESSAGES.englishExtra.includes(englishEvent)")); assert.ok(run(context, "KAI_MESSAGES.readingExtra.includes(readingEvent)")); assert.ok(run(context, "KAI_MESSAGES.trainingExtra.includes(trainingEvent)"));
}
console.log('Kai v4.0.1 domain tests: ok');
