// addTask.js — classList-only (keine Style-Injection)

// ===================== Assign-To Modul =====================
const AT = (() => {
  let contacts = {};
  const selected = new Set();
  let selectEl = null;
  let previewEl = null;

  // ---------- Utils ----------
  function toObject(maybeArray) {
    if (Array.isArray(maybeArray)) {
      const obj = {};
      maybeArray.forEach((c, i) => (obj['c' + (i + 1)] = c));
      return obj;
    }
    return maybeArray || {};
  }

  function initials(name) {
    if (!name) return '';
    const parts = String(name).trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() || '').join('');
  }

  // mappe beliebige Tokens (aus contacts.color) auf Klassenamen
  function colorClassFromToken(token) {
    const t = String(token || '').toLowerCase();
    if (t.includes('red')) return 'color-red';
    if (t.includes('green')) return 'color-green';
    if (t.includes('blue')) return 'color-blue';
    if (t.includes('orange')) return 'color-orange';
    if (t.includes('purple')) return 'color-purple';
    if (t.includes('teal')) return 'color-teal';
    return 'color-default';
  }

  // ---------- Daten ----------
  function loadContacts() {
    const raw = localStorage.getItem('contacts');
    if (!raw) {
      // Fallback-Demo-Kontakte
      return {
        c1: { name: 'Max Mustermann', color: 'green' },
        c2: { name: 'Erika Musterfrau', color: 'blue' },
        c3: { name: 'John Doe', color: 'orange' }
      };
    }
    return toObject(JSON.parse(raw));
  }

  function fillSelect() {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    const ph = new Option('Assign to…', '');
    ph.selected = true;
    selectEl.add(ph);
    Object.entries(contacts).forEach(([id, c]) => {
      selectEl.add(new Option(c.name || id, id));
    });
  }

  function renderPreview() {
    if (!previewEl) return;
    previewEl.innerHTML = '';

    const ids = Array.from(selected);
    if (ids.length === 0) return;

    const strip = document.createElement('div');
    strip.className = 'assign-badges'; // <-- in CSS gestalten (Layout/Overlap)

    ids.forEach((id) => {
      const c = contacts[id];
      if (!c) return;

      const el = document.createElement('div');
      el.className = 'assign-badge';   // <-- runder Kreis in CSS
      el.title = `${c.name} – entfernen`;
      el.textContent = initials(c.name);

      // Farblogik: Klasse statt Inline-Style
      const colorClass = colorClassFromToken(c.color);
      el.classList.add(colorClass);
      el.dataset.color = colorClass.replace(/^color-/, ''); // optional für CSS-Attribute-Selektor
      el.dataset.id = id;

      el.addEventListener('click', (e) => {
        e.preventDefault();
        selected.delete(id);
        renderPreview();
      });

      strip.appendChild(el);
    });

    const hint = document.createElement('span');
    hint.className = 'assign-hint'; // <-- dezenter Hinweis in CSS
    hint.textContent = 'Klicken zum Entfernen';

    previewEl.appendChild(strip);
    previewEl.appendChild(hint);
  }

  function onSelectChange() {
    const id = selectEl.value;
    if (id) {
      selected.add(id);
      renderPreview();
      selectEl.value = '';
    }
  }

  function mount(root) {
    if (!root) return;
    selectEl = root.querySelector('#task-assigned');
    if (!selectEl) return;
    previewEl = root.querySelector('#assigned-preview');
    if (!previewEl) {
      previewEl = document.createElement('div');
      previewEl.id = 'assigned-preview'; // direkt unter dem Select
      selectEl.insertAdjacentElement('afterend', previewEl);
    }
    contacts = loadContacts();
    fillSelect();
    selectEl.removeEventListener('change', onSelectChange);
    selectEl.addEventListener('change', onSelectChange);
    renderPreview();
  }

  function users() {
    return Array.from(selected)
      .map((id) => {
        const c = contacts[id];
        return c && c.name ? { name: c.name, color: c.color || 'default' } : null;
      })
      .filter(Boolean);
  }

  function clear() {
    selected.clear();
    renderPreview();
    if (selectEl) selectEl.value = '';
  }

  return { mount, users, clear };
})();

// ===================== Formular-Setup =====================
function setupAddTaskForm(containerId = 'addtask-container') {
  const root = document.getElementById(containerId);
  if (!root) return;
  if (!root.querySelector('#task-title')) return; // Guard, falls Template noch nicht geladen

  // --- Elemente ---
  const elTitle = root.querySelector('#task-title');
  const elDesc = root.querySelector('#task-desc');
  const elDue = root.querySelector('#task-due');
  const elAssigned = root.querySelector('#task-assigned');
  const elCategory = root.querySelector('#task-category');
  const elSubtaskInput = root.querySelector('#subtask-input');
  const elAddSubtaskBtn = root.querySelector('#add-subtask-btn');
  const elSubtaskList = root.querySelector('#subtask-list');
  const btnCreate = root.querySelector('#create-task-btn');
  const btnClear = root.querySelector('#clear-task-btn');

  const btnUrgent = root.querySelector('.btn-urgent');
  const btnMedium = root.querySelector('.btn-medium');
  const btnLow = root.querySelector('.btn-low');

  let selectedPriority = 'medium';

  // --- Subtasks ---
  function addSubtask(text) {
    if (!elSubtaskList) return;
    const li = document.createElement('li');
    li.textContent = text;
    li.dataset.text = text;
    li.addEventListener('click', () => li.remove());
    elSubtaskList.appendChild(li);
  }

  if (elAddSubtaskBtn && elSubtaskInput) {
    elAddSubtaskBtn.addEventListener('click', () => {
      const t = elSubtaskInput.value.trim();
      if (t) { addSubtask(t); elSubtaskInput.value = ''; }
    });
    elSubtaskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const t = elSubtaskInput.value.trim();
        if (t) { addSubtask(t); elSubtaskInput.value = ''; }
      }
    });
  }

  // --- Priority Handling (nur classList + ARIA) ---
  function selectPriority(p) {
    selectedPriority = p;

    // reset
    [btnUrgent, btnMedium, btnLow].forEach(b => {
      if (!b) return;
      b.setAttribute('aria-pressed', 'false');
      b.classList.remove('is-active', 'urgent-active-urgent');
    });

    const map = { urgent: btnUrgent, medium: btnMedium, low: btnLow };
    const activeBtn = map[p];
    if (activeBtn) {
      activeBtn.setAttribute('aria-pressed', 'true');
      activeBtn.classList.add('is-active');             // allgemeine Aktiv-Klasse
      if (p === 'urgent') activeBtn.classList.add('urgent-active-urgent'); // deine Testklasse
    }
  }

  btnUrgent && btnUrgent.addEventListener('click', () => selectPriority('urgent'));
  btnMedium && btnMedium.addEventListener('click', () => selectPriority('medium'));
  btnLow && btnLow.addEventListener('click', () => selectPriority('low'));

  // --- Assign-To mounten (Badges) ---
  if (elAssigned) AT.mount(root);

  // --- Task bauen & speichern ---
  function priorityPath(p) { return `./img/priority-img/${p}.png`; }
  function formatDateDE(v) {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d) ? v : d.toLocaleDateString('de-DE');
  }
  function mapCategory(val) {
    if (!val) return '';
    const v = String(val).toLowerCase();
    if (v.includes('technical')) return 'Technical task';
    if (v.includes('user')) return 'User Story';
    return val;
  }

  function buildTask() {
    const id = 'task-' + Date.now();
    const users = AT.users();
    const subtasks = Array.from(root.querySelectorAll('#subtask-list li') || [])
      .map(li => ({ text: li.dataset.text || li.textContent.trim(), completed: false }));
    return {
      column: 'toDoColumn',
      id,
      firebaseKey: id,
      title: elTitle?.value.trim() || '',
      description: elDesc?.value.trim() || 'No description provided',
      dueDate: formatDateDE(elDue?.value.trim() || ''),
      priority: priorityPath(selectedPriority),
      progress: 0,
      users,
      subtasks,
      category: mapCategory(elCategory?.value.trim() || '')
    };
  }

  function saveToLocal(task) {
    const raw = localStorage.getItem('taskData');
    const obj = raw ? JSON.parse(raw) : {};
    obj[task.id] = task;
    localStorage.setItem('taskData', JSON.stringify(obj));
  }

  btnCreate && btnCreate.addEventListener('click', () => {
    const task = buildTask();
    saveToLocal(task);
    window.location.href = './board.html';
  });

  btnClear && btnClear.addEventListener('click', () => {
    elTitle && (elTitle.value = '');
    elDesc && (elDesc.value = '');
    elDue && (elDue.value = '');
    elAssigned && (elAssigned.value = '');
    elCategory && (elCategory.value = '');
    elSubtaskList && (elSubtaskList.innerHTML = '');
    AT.clear();
    selectPriority('medium');
  });

  // Kategorien auffüllen, falls leer
  if (elCategory && elCategory.options.length <= 1) {
    elCategory.add(new Option('Technical Task', 'Technical task'));
    elCategory.add(new Option('User Story', 'User Story'));
  }

  // Standard-Prio
  selectPriority('medium');
}

// ===================== Template/Bootstrapping =====================
function renderTemplate(templateId, containerId) {
  const template = document.getElementById(templateId);
  const container = document.getElementById(containerId);
  if (!container) return;
  if (template) {
    container.innerHTML = '';
    container.appendChild(template.content.cloneNode(true));
  }
  setupAddTaskForm(containerId);
  const closeBtn = container.querySelector('#close-addtask-btn');
  if (closeBtn) closeBtn.addEventListener('click', () => { container.innerHTML = ''; });
}

function onAddTaskMenuClick(ev) {
  ev.preventDefault();
  renderTemplate('addtask-template', 'addtask-container');
}

function loadingAddTask() {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('addtask-container');
    if (!container) return;
    const menuItems = document.querySelectorAll('#task-menu');
    menuItems.forEach((menuItem) => {
      menuItem.addEventListener('click', onAddTaskMenuClick);
    });
    setupAddTaskForm('addtask-container');
  });
}
loadingAddTask();
