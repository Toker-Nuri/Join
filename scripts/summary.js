/* ===== Summary <-> Firebase Sync (nur summary.js) ===== */
(() => {
  'use strict';

  /*** Konfiguration ***/
  const FIREBASE_URL =
    (window.FIREBASE_URL && String(window.FIREBASE_URL)) ||
    'https://join-360-fb6db-default-rtdb.europe-west1.firebasedatabase.app/'; // aus firebase.js bzw. Fallback
  const TASKS_PATH = 'tasks';
  const POLL_MS = 1500; // sanftes Live-Update
  const DATE_LOCALE = 'en-US';

  // Mapping sichtbarer Labeltexte -> Counter-Key
  const LABEL_MAP = {
    'to do': 'todo',
    'to-do': 'todo',
    'done': 'done',
    'tasks in board': 'total',
    'tasks in progress': 'inProgress',
    'awaiting feedback': 'awaitFeedback'
  };

  /*** Utils ***/
  const tryJSON = s => { try { return JSON.parse(s); } catch { return null; } };
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

  // Labeltext normalisieren (entfernt <br>, Bindestriche, Sonderzeichen etc.)
  const normLabel = htmlOrText =>
    String(htmlOrText || '')
      .replace(/<br\s*\/?>/gi, ' ')
      .toLowerCase()
      .replace(/[^\w ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const getInitials = name => {
    const n = String(name || '').trim().split(/\s+/);
    const a = (n[0] || '')[0] || ''; const b = (n[n.length - 1] || '')[0] || '';
    return (a + b).toUpperCase();
  };

  /*** Firebase lesen (robust: Helper oder fetch) ***/
  async function firebaseGet(path) {
    // wenn firebase.js geladen ist, nutze dessen Helper
    if (typeof window.firebaseGet === 'function') {
      return await window.firebaseGet(path);
    }
    // sonst direkter fetch
    const res = await fetch(`${FIREBASE_URL}${path}.json`);
    return await res.json();
  }

  /*** Tasks holen & normalisieren ***/
  async function loadTasks() {
    const data = await firebaseGet(TASKS_PATH);
    if (!data) return [];
    // Firebase liefert Map { id: task, ... } -> Werte extrahieren
    const raw = isObj(data) ? Object.values(data) : (Array.isArray(data) ? data : []);
    return normalizeTasks(raw);
  }

  function normalizeTasks(raw) {
    return raw
      .filter(isObj)
      .map((t, i) => {
        // Spalte
        const colRaw = t.column ?? t.status ?? t.state ?? t.list ?? '';
        const column = normalizeColumn(colRaw);

        // Prio (in euren Dateien: Bildpfad enthält 'urgent'/'medium'/'low')
        const prRaw = t.priority ?? t.prio ?? '';
        const priority = normalizePriority(prRaw);

        // Fälligkeitsdatum (dd/mm/yyyy, yyyy-mm-dd, dd.mm.yyyy, ISO…)
        const ddRaw = t.dueDate ?? t.deadline ?? t.date ?? '';
        const dueDate = parseDueDate(ddRaw);

        return {
          id: t.firebaseKey || t.id || String(i),
          column,
          priority,
          dueDate
        };
      });
  }

  function normalizeColumn(v) {
    // Exakte IDs aus board.html zuerst (toDoColumn / inProgress / awaitFeedback / done)
    if (v === 'toDoColumn' || v === 'inProgress' || v === 'awaitFeedback' || v === 'done') return v;
    const s = String(v || '').toLowerCase().replace(/\s|_/g, '');
    if (s.includes('todo')) return 'toDoColumn';
    if (s.includes('inprogress') || s === 'progress') return 'inProgress';
    if (s.includes('await') || s.includes('feedback') || s.includes('review')) return 'awaitFeedback';
    if (s.includes('done') || s.includes('complete') || s.includes('finished')) return 'done';
    return ''; // unbekannt -> zählt nur in total
  }

  function normalizePriority(v) {
    const s = String(v || '').toLowerCase();
    if (s.includes('urgent') || s === 'high') return 'urgent';
    if (s.includes('low')) return 'low';
    return (s.includes('medium') || s === 'mid' || s === 'normal') ? 'medium' : 'medium';
  }

  function parseDueDate(v) {
    if (!v) return null;
    const s = String(v).trim();
    // yyyy-mm-dd
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    // dd/mm/yyyy
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    // dd.mm.yyyy
    m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    // ISO / sonstiges
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }

  /*** Zählen & Rendering ***/
  function computeCounts(tasks) {
    const c = { total: 0, todo: 0, inProgress: 0, awaitFeedback: 0, done: 0, urgent: 0 };
    for (const t of tasks) {
      c.total++;
      if (t.column === 'toDoColumn') c.todo++;
      else if (t.column === 'inProgress') c.inProgress++;
      else if (t.column === 'awaitFeedback') c.awaitFeedback++;
      else if (t.column === 'done') c.done++;
      if (t.priority === 'urgent') c.urgent++;
    }
    return c;
  }

  function nextUpcoming(tasks) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return tasks.map(t => t.dueDate).filter(d => d && d >= today).sort((a, b) => a - b)[0] || null;
  }

  function formatLong(d) {
    return d ? d.toLocaleDateString(DATE_LOCALE, { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  }

  function renderCounts(counters, tasks) {
    // Karten mit .js-count-container
    document.querySelectorAll('.js-count-container').forEach(box => {
      const labelEl = box.querySelector('.counter-text-design');
      const valueEl = box.querySelector('.value');
      if (!labelEl || !valueEl) return;
      const key = LABEL_MAP[normLabel(labelEl.innerHTML || labelEl.textContent)];
      if (key) valueEl.textContent = counters[key];
    });

    // Urgent
    const urgentEl = document.querySelector('.js-urgent-container .value');
    if (urgentEl) urgentEl.textContent = counters.urgent;

    // Nächste Deadline
    const dEl = document.querySelector('.js-deadline-date');
    if (dEl) dEl.textContent = formatLong(nextUpcoming(tasks));
  }

  function renderGreetingAndBadge() {
    const greetingEl = document.querySelector('.js-greeting');
    const nameEl = document.querySelector('.js-user-name');
    const accEl = document.querySelector('.header-right-side .account div');
    const name = (localStorage.getItem('name') || '').trim();
    const isGuestStored = (localStorage.getItem('isGuest') || 'false') === 'true';
    const isGuest = name ? false : isGuestStored;

    if (greetingEl) greetingEl.textContent = 'Good morning!';
    if (nameEl) {
      if (!isGuest && name) {
        nameEl.textContent = name;
        nameEl.style.display = '';
      } else {
        nameEl.textContent = '';
        nameEl.style.display = 'none';
      }
    }
    if (accEl) accEl.textContent = (!isGuest && name) ? getInitials(name) : 'G';
  }

  async function update() {
    try {
      const tasks = await loadTasks();
      const counters = computeCounts(tasks);
      renderCounts(counters, tasks);
      renderGreetingAndBadge();
    } catch (e) {
      // leise fehlschlagen, UI nicht blockieren
    }
  }

  // Events & sanftes Polling
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { update(); setInterval(update, POLL_MS); });
  } else {
    update(); setInterval(update, POLL_MS);
  }
})();
