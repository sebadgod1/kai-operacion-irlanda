(function () {
  'use strict';

  const VERSION = '4.1.0';
  const MOTIVATION_KEY = 'kai-irlanda-motivation-v1';
  const core = globalThis.KaiV41Core;

  if (!core) {
    console.warn('Kai v4.1: no se pudo cargar el núcleo de mejoras.');
    return;
  }

  const MOTIVATION_PHRASES = [
    { theme: 'Disciplina', text: 'No necesitas ganas para empezar. Necesitas una primera acción.' },
    { theme: 'Disciplina', text: 'Hazlo suficientemente simple como para no tener una excusa.' },
    { theme: 'Disciplina', text: 'La disciplina se ve poco en un día y muchísimo después de un mes.' },
    { theme: 'Disciplina', text: 'Cumplir cuando nadie mira también cuenta.' },
    { theme: 'Disciplina', text: 'No negocies con todo el día. Negocia solo con la siguiente acción.' },
    { theme: 'Disciplina', text: 'La versión de ti que llega a Irlanda se construye en días normales como este.' },
    { theme: 'Constancia', text: 'Un día bueno ayuda. Una semana repetida cambia cosas.' },
    { theme: 'Constancia', text: 'No busques una racha perfecta; busca volver rápido cuando te caigas.' },
    { theme: 'Constancia', text: 'Lo pequeño deja de ser pequeño cuando lo repites.' },
    { theme: 'Constancia', text: 'Tu ventaja no es hacerlo enorme. Es hacerlo otra vez mañana.' },
    { theme: 'Constancia', text: 'Lo que hoy parece rutina, después se siente como confianza.' },
    { theme: 'Constancia', text: 'No necesitas recuperar ayer. Necesitas cuidar hoy.' },
    { theme: 'Irlanda', text: 'Irlanda no empieza el día que subes al avión. Empieza con lo que preparas ahora.' },
    { theme: 'Irlanda', text: 'Cada hábito que cierras hace que el cambio de país llegue un poco menos improvisado.' },
    { theme: 'Irlanda', text: 'Tu viaje tiene una fecha. Tu preparación necesita días.' },
    { theme: 'Irlanda', text: 'Que el nervio por Irlanda se convierta en preparación, no en parálisis.' },
    { theme: 'Irlanda', text: 'No puedes controlar cómo será todo allá. Sí puedes llegar mejor preparado.' },
    { theme: 'Irlanda', text: 'Cada día ordenado acá es una preocupación menos cuando estés allá.' },
    { theme: 'Inglés', text: 'Cada minuto de inglés hace que Irlanda sea un poco menos desconocida.' },
    { theme: 'Inglés', text: 'No estudies para sonar perfecto. Estudia para poder resolver tu vida allá.' },
    { theme: 'Inglés', text: 'Treinta minutos hoy valen más que tres horas prometidas para mañana.' },
    { theme: 'Inglés', text: 'Entender una frase más también es progreso.' },
    { theme: 'Inglés', text: 'El inglés no se aprende de golpe. Se acumula conversación por conversación.' },
    { theme: 'Inglés', text: 'Practica aunque te equivoques. Allá vas a necesitar hablar, no rendir un examen perfecto.' },
    { theme: 'Entrenamiento', text: 'Entrena para tener más energía para tu vida, no para castigar tu cuerpo.' },
    { theme: 'Entrenamiento', text: 'Una sesión hecha le gana a una rutina perfecta que nunca empezó.' },
    { theme: 'Entrenamiento', text: 'Hoy no necesitas romper récords. Necesitas sumar una sesión real.' },
    { theme: 'Entrenamiento', text: 'Fuerte no es ir al máximo siempre. Fuerte también es saber repetir.' },
    { theme: 'Entrenamiento', text: 'Tu cuerpo también se está preparando para el cambio que viene.' },
    { theme: 'Entrenamiento', text: 'Haz el trabajo y después recupera. Las dos cosas son parte del plan.' },
    { theme: 'Día difícil', text: 'Si hoy estás bajo, baja la dificultad; no abandones el día.' },
    { theme: 'Día difícil', text: 'Un día pesado no necesita una actuación heroica. Necesita una cosa bien hecha.' },
    { theme: 'Día difícil', text: 'Cuando todo cuesta, una misión sigue siendo una victoria.' },
    { theme: 'Día difícil', text: 'No conviertas cansancio en una sentencia sobre quién eres.' },
    { theme: 'Día difícil', text: 'Haz una. Después decides si puedes con otra.' },
    { theme: 'Día difícil', text: 'Hoy también cuenta, incluso si avanzas más lento.' },
    { theme: 'Cierre', text: 'Terminar lo que empezaste te deja más liviano que seguir pensándolo.' },
    { theme: 'Cierre', text: 'Si queda una, no la hagas épica. Hazla.' },
    { theme: 'Cierre', text: 'Cerrar el día bien es una forma de respetar al de mañana.' },
    { theme: 'Cierre', text: 'Cinco de seis demuestra avance. La sexta demuestra cierre.' },
    { theme: 'Cierre', text: 'No necesitas más motivación. Necesitas terminar.' },
    { theme: 'Cierre', text: 'Última misión, después sueltas el día.' },
    { theme: 'Confianza', text: 'La confianza llega después de verte cumplirte varias veces.' },
    { theme: 'Confianza', text: 'No necesitas sentirte preparado para avanzar. Avanzar también te prepara.' },
    { theme: 'Confianza', text: 'Cada promesa pequeña que cumples contigo vale más que una gran intención.' },
    { theme: 'Confianza', text: 'No estás esperando convertirte en otra persona. Estás entrenando tus hábitos.' },
    { theme: 'Confianza', text: 'Tu progreso real no siempre se siente espectacular. Igual existe.' },
    { theme: 'Confianza', text: 'Mira menos lo que falta y más lo que ya eres capaz de repetir.' },
    { theme: 'Enfoque', text: 'Una pantalla menos. Una acción más.' },
    { theme: 'Enfoque', text: 'Lo importante rara vez necesita veinte pasos al mismo tiempo.' },
    { theme: 'Enfoque', text: 'Haz primero lo que te acerca a la vida que dijiste que querías.' },
    { theme: 'Enfoque', text: 'Tu atención también es parte del entrenamiento.' },
    { theme: 'Enfoque', text: 'Menos vueltas. Más evidencia.' },
    { theme: 'Enfoque', text: 'La siguiente misión es suficiente por ahora.' },
    { theme: 'Progreso', text: 'No subestimes un 1% que sí ocurrió.' },
    { theme: 'Progreso', text: 'Progreso no es sentirte distinto todos los días. Es tener datos que muestran que seguiste.' },
    { theme: 'Progreso', text: 'Las semanas se construyen con días que parecían comunes.' },
    { theme: 'Progreso', text: 'No necesitas impresionar a nadie. Necesitas llegar mejor que como partiste.' },
    { theme: 'Progreso', text: 'Que tus números sean evidencia, no presión.' },
    { theme: 'Progreso', text: 'Hoy suma aunque no se sienta enorme.' }
  ];

  function loadMotivationState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(MOTIVATION_KEY) || '{}');
      return {
        date: typeof parsed.date === 'string' ? parsed.date : '',
        offset: Number.isInteger(parsed.offset) ? parsed.offset : 0,
        favorites: Array.isArray(parsed.favorites) ? [...new Set(parsed.favorites.filter(Number.isInteger))] : []
      };
    } catch (_) {
      return { date: '', offset: 0, favorites: [] };
    }
  }

  let motivationState = loadMotivationState();

  function saveMotivationState() {
    localStorage.setItem(MOTIVATION_KEY, JSON.stringify(motivationState));
  }

  function currentPhraseIndex() {
    const today = typeof currentDate === 'string' ? currentDate : new Date().toISOString().slice(0, 10);
    if (motivationState.date !== today) {
      motivationState.date = today;
      motivationState.offset = 0;
      saveMotivationState();
    }
    const base = core.stableIndex(`kai-${today}`, MOTIVATION_PHRASES.length);
    return (base + motivationState.offset) % MOTIVATION_PHRASES.length;
  }

  function safe(text) {
    return String(text).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function renderFavoriteList() {
    const list = document.querySelector('#motivation-favorites-list');
    const empty = document.querySelector('#motivation-favorites-empty');
    if (!list || !empty) return;
    const valid = motivationState.favorites.filter(index => MOTIVATION_PHRASES[index]);
    empty.hidden = valid.length > 0;
    list.innerHTML = valid.map(index => {
      const phrase = MOTIVATION_PHRASES[index];
      return `<article class="favorite-quote"><small>${safe(phrase.theme)}</small><p>“${safe(phrase.text)}”</p><button type="button" data-remove-favorite="${index}">Quitar</button></article>`;
    }).join('');
    list.querySelectorAll('[data-remove-favorite]').forEach(button => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.removeFavorite);
        motivationState.favorites = motivationState.favorites.filter(item => item !== index);
        saveMotivationState();
        renderMotivation();
        renderFavoriteList();
      });
    });
  }

  function renderMotivation() {
    const card = document.querySelector('#motivation-card');
    if (!card) return;
    const index = currentPhraseIndex();
    const phrase = MOTIVATION_PHRASES[index];
    const favorite = motivationState.favorites.includes(index);
    const theme = document.querySelector('#motivation-theme');
    const text = document.querySelector('#motivation-text');
    const favoriteButton = document.querySelector('#motivation-favorite');
    const count = document.querySelector('#motivation-favorites-count');
    if (theme) theme.textContent = phrase.theme.toUpperCase();
    if (text) text.textContent = `“${phrase.text}”`;
    if (favoriteButton) {
      favoriteButton.textContent = favorite ? '♥ GUARDADA' : '♡ GUARDAR';
      favoriteButton.classList.toggle('saved', favorite);
      favoriteButton.setAttribute('aria-pressed', String(favorite));
    }
    if (count) count.textContent = String(motivationState.favorites.length);
  }

  function bindMotivation() {
    document.querySelector('#motivation-next')?.addEventListener('click', () => {
      motivationState.offset = (motivationState.offset + 1) % MOTIVATION_PHRASES.length;
      saveMotivationState();
      renderMotivation();
    });

    document.querySelector('#motivation-favorite')?.addEventListener('click', () => {
      const index = currentPhraseIndex();
      if (motivationState.favorites.includes(index)) {
        motivationState.favorites = motivationState.favorites.filter(item => item !== index);
      } else {
        motivationState.favorites.push(index);
      }
      saveMotivationState();
      renderMotivation();
    });

    document.querySelector('#motivation-open-favorites')?.addEventListener('click', () => {
      renderFavoriteList();
      const modal = document.querySelector('#motivation-modal');
      modal?.classList.add('show');
      modal?.setAttribute('aria-hidden', 'false');
    });

    document.querySelectorAll('[data-close-motivation]').forEach(button => {
      button.addEventListener('click', () => {
        const modal = document.querySelector('#motivation-modal');
        modal?.classList.remove('show');
        modal?.setAttribute('aria-hidden', 'true');
      });
    });
  }

  function enhanceMinuteCards() {
    document.querySelectorAll('.minute-card').forEach(card => {
      const preset = card.querySelector('[data-minutes]');
      if (!preset) return;
      const id = preset.dataset.minutes;
      const value = day()?.minutes?.[id] || 0;
      const actions = card.querySelector('.minute-actions');
      if (!actions || actions.querySelector(`[data-clear-minutes="${id}"]`)) return;
      const clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'minute-clear';
      clear.dataset.clearMinutes = id;
      clear.textContent = value > 0 ? 'Quitar registro' : 'Sin registro';
      clear.disabled = value === 0;
      clear.addEventListener('click', () => setMinutes(id, 0));
      actions.appendChild(clear);
    });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-minutes]');
    if (!button || !button.classList.contains('active')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const id = button.dataset.minutes;
    const selected = Number(button.dataset.value);
    const current = day()?.minutes?.[id] || 0;
    setMinutes(id, core.togglePreset(current, selected));
  }, true);

  const originalRenderToday = renderToday;
  renderToday = function renderTodayV41() {
    originalRenderToday();
    enhanceMinuteCards();
    renderMotivation();
  };

  checkAchievements = function checkAchievementsV41() {
    const previous = new Set(state.achievements || []);
    const legacyIds = ACHIEVEMENTS.filter(item => item.legacy).map(item => item.id);
    const activeDerived = ACHIEVEMENTS.filter(item => !item.legacy && item.test(state)).map(item => item.id);
    const nextIds = core.reconcileAchievementIds(state.achievements, legacyIds, activeDerived);
    const newlyUnlocked = activeDerived
      .filter(id => !previous.has(id))
      .map(id => ACHIEVEMENTS.find(item => item.id === id))
      .filter(Boolean);

    const changed = JSON.stringify(nextIds) !== JSON.stringify(state.achievements || []);
    state.achievements = nextIds;
    if (changed) saveState();
    if (newlyUnlocked.length) showAchievement(newlyUnlocked[0]);
    return newlyUnlocked;
  };

  function hardenUpdateBanner() {
    const banner = document.querySelector('#update-banner');
    if (!banner) return;
    const syncAria = () => banner.setAttribute('aria-hidden', banner.classList.contains('show') ? 'false' : 'true');
    syncAria();
    new MutationObserver(syncAria).observe(banner, { attributes: true, attributeFilter: ['class'] });
    navigator.serviceWorker?.addEventListener('controllerchange', () => banner.classList.remove('show'));
  }

  function labelVersion() {
    document.documentElement.dataset.kaiVersion = VERSION;
  }

  bindMotivation();
  hardenUpdateBanner();
  labelVersion();
  checkAchievements();
  renderAll();
})();
