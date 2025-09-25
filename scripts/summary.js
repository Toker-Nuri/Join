(function () {
  'use strict';

  const SUMMARY_CONFIG = {
    storageKey: 'taskData',
    dateLocale: 'en-US',
    pollIntervalMs: 1000,
    selectors: {

      countContainer: '.js-count-container',
      countLabel: '.counter-text-design',
      countValue: '.value',
      urgentValue: '.js-urgent-container .value',
      deadlineDate: '.js-deadline-date',

      greetingText: '.js-greeting',
      greetingName: '.js-user-name',
      accountInner: '.header-right-side .account div'
    },
    labelTextToCounterKey: {
      'to do': 'todo',
      'done': 'done',
      'tasks in board': 'total',
      'tasks in progress': 'inProgress',
      'awaiting feedback': 'awaitFeedback'
    }
  };

  function parseJSONSafe(text) { try { return JSON.parse(text); } catch { return null; } }

  function getInitials(fullName) {
    if (!fullName) return '';
    const parts = String(fullName).trim().split(/\s+/);
    const a = (parts[0] || '')[0] || '';
    const b = (parts.length > 1 ? parts[parts.length - 1][0] : '') || '';
    return (a + b).toUpperCase();
  }

  function fetchTasksFromStorage() {
    const rawJSON = localStorage.getItem(SUMMARY_CONFIG.storageKey);
    if (!rawJSON) return [];
    const stored = parseJSONSafe(rawJSON) || {};
    return Object.entries(stored).map(([id, data]) => ({ id, ...data }));
  }

  function derivePriority(v) {
    if (!v) return 'medium';
    const s = String(v).toLowerCase();
    if (s.includes('urgent')) return 'urgent';
    if (s.includes('low')) return 'low';
    return 'medium';
  }

  function computeStatusCounts(tasks) {
    const c = { total: 0, todo: 0, inProgress: 0, awaitFeedback: 0, done: 0, urgent: 0 };
    for (const t of tasks) {
      c.total++;
      const col = String(t.column || '');
      if (col === 'toDoColumn') c.todo++;
      else if (col === 'inProgress') c.inProgress++;
      else if (col === 'awaitFeedback') c.awaitFeedback++;
      else if (col === 'done') c.done++;
      if (derivePriority(t.priority) === 'urgent') c.urgent++;
    }
    return c;
  }

  function parseDueDate(v) {
    if (!v) return null;
    const s = String(v).trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }

  function findNextUpcomingDueDate(tasks) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return tasks.map(t => parseDueDate(t.dueDate))
      .filter(d => d && d >= today)
      .sort((a, b) => a - b)[0] || null;
  }

  function formatDateLong(d) {
    return d ? d.toLocaleDateString(SUMMARY_CONFIG.dateLocale, { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  }

  function normalizeSummaryLabel(text) {
    return String(text).toLowerCase().replace(/[-_]+/g, ' ')
      .replace(/[^\w ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function renderStatusCounters(statusCounts) {
    document.querySelectorAll(SUMMARY_CONFIG.selectors.countContainer).forEach(container => {
      const labelEl = container.querySelector(SUMMARY_CONFIG.selectors.countLabel);
      const valueEl = container.querySelector(SUMMARY_CONFIG.selectors.countValue);
      if (!labelEl || !valueEl) return;
      const key = SUMMARY_CONFIG.labelTextToCounterKey[normalizeSummaryLabel(labelEl.textContent)];
      if (key) valueEl.textContent = statusCounts[key];
    });
  }

  function renderUrgentCount(statusCounts) {
    const el = document.querySelector(SUMMARY_CONFIG.selectors.urgentValue);
    if (el) el.textContent = statusCounts.urgent;
  }

  function renderUpcomingDeadline(tasks) {
    const el = document.querySelector(SUMMARY_CONFIG.selectors.deadlineDate);
    if (el) el.textContent = formatDateLong(findNextUpcomingDueDate(tasks));
  }

  function renderGreetingAndBadge() {
    const greetingEl = document.querySelector(SUMMARY_CONFIG.selectors.greetingText);
    const nameEl = document.querySelector(SUMMARY_CONFIG.selectors.greetingName);
    const accountEl = document.querySelector(SUMMARY_CONFIG.selectors.accountInner);

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

    if (accountEl) {
      accountEl.textContent = !isGuest && name ? getInitials(name) : 'G';
    }
  }

  function renderSummary(tasks) {
    const statusCounts = computeStatusCounts(tasks);
    renderStatusCounters(statusCounts);
    renderUrgentCount(statusCounts);
    renderUpcomingDeadline(tasks);
    renderGreetingAndBadge();
  }

  function updateSummaryFromStorage() {
    renderSummary(fetchTasksFromStorage());
  }

  window.addEventListener('storage', e => {
    if (
      e.key === SUMMARY_CONFIG.storageKey ||
      e.key === 'name' ||
      e.key === 'isGuest'
    ) {
      updateSummaryFromStorage();
    }
  });

  setInterval(updateSummaryFromStorage, SUMMARY_CONFIG.pollIntervalMs);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateSummaryFromStorage);
  } else {
    updateSummaryFromStorage();
  }
})();


(function () {
  const MAX_WIDTH = 925;

  const VISIBLE_MS = 600;
  const FADE_MS = 400;

  function getNameAndGuest() {
    const name = (localStorage.getItem('name') || '').trim();
    const isGuestStored = (localStorage.getItem('isGuest') || 'false') === 'true';
    const isGuest = name ? false : isGuestStored;
    return { name, isGuest };
  }

  function cameFromLogin() {
    try {
      const ref = document.referrer || '';
      if (!ref) return false;
      const url = new URL(ref, window.location.origin);
      const p = url.pathname.toLowerCase();

      return p.endsWith('/html/log.html') || p.endsWith('/log.html') || p.endsWith('/html/log') || p.endsWith('/log');
    } catch {
      return false;
    }
  }

  function isPageReload() {
    try {
      const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      const type = nav ? nav.type : (performance.navigation && performance.navigation.type === 1 ? 'reload' : 'navigate');
      return type === 'reload';
    } catch {
      return false;
    }
  }

  function createSplash({ name, isGuest }) {
    const el = document.createElement('div');
    el.className = 'greet-splash';
    el.setAttribute('aria-live', 'polite');

    const box = document.createElement('div');
    box.className = 'greet-box';

    const p = document.createElement('p');
    p.className = 'greet-line';
    p.textContent = 'Good morning!';

    const h2 = document.createElement('h2');
    h2.className = 'greet-name';
    h2.textContent = (!isGuest && name) ? name : '';

    box.appendChild(p);
    box.appendChild(h2);
    el.appendChild(box);
    return el;
  }

  function maybeShowSplash() {
    if (window.innerWidth > MAX_WIDTH) return;

    if (!cameFromLogin()) return;

    if (isPageReload()) return;

    const { name, isGuest } = getNameAndGuest();
    const splash = createSplash({ name, isGuest });
    document.body.appendChild(splash);

    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), FADE_MS);
    }, VISIBLE_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybeShowSplash);
  } else {
    maybeShowSplash();
  }
})();
