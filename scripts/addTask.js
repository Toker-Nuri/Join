const AT = (() => { 
  let contacts = {};
  const selected = new Set();
  let selectEl = null;
  let previewEl = null;

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

  function colorFromToken(token) {
    const t = String(token || '').toLowerCase();
    if (t.includes('red')) return '#FF5733';
    if (t.includes('green')) return '#33FF57';
    if (t.includes('blue')) return '#3357FF';
    if (t.includes('orange')) return '#FF8C00';
    if (t.includes('purple')) return '#8E44AD';
    if (t.includes('teal')) return '#1ABC9C';
    return '#2A3647';
  }

  function ensureAssignStyles() {
    if (document.getElementById('assign-style')) return;
    const style = document.createElement('style');
    style.id = 'assign-style';
    style.textContent = `
      #assigned-preview{
        display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:8px;
      }
      .assign-badges { display:flex; align-items:center; }
      .assign-badge{
        width:32px; height:32px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        font-weight:700; font-size:12px; color:#fff; cursor:pointer;
        box-shadow: 0 0 0 2px #fff;
      }
      .assign-badge + .assign-badge { margin-left:-8px; } /* overlap */
      .assign-hint{ font-size:12px; color:#6b7280; margin-left:8px; }
    `;
    document.head.appendChild(style);
  }

  // ---------- Data ----------
  function loadContacts() {
    const raw = localStorage.getItem('contacts');
    if (!raw) {
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
    strip.className = 'assign-badges';

    ids.forEach((id) => {
      const c = contacts[id];
      if (!c) return;
      const el = document.createElement('div');
      el.className = 'assign-badge';
      el.title = `${c.name} – entfernen`;
      el.textContent = initials(c.name);
      el.style.background = colorFromToken(c.color);
      el.dataset.id = id;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        selected.delete(id);
        renderPreview();
      });
      strip.appendChild(el);
    });

    const hint = document.createElement('span');
    hint.className = 'assign-hint';
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
    ensureAssignStyles();
    selectEl = root.querySelector('#task-assigned');
    if (!selectEl) return;
    previewEl = root.querySelector('#assigned-preview');
    if (!previewEl) {
      previewEl = document.createElement('div');
      previewEl.id = 'assigned-preview';
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

function setupAddTaskForm(containerId = 'addtask-container') {
  const root = document.getElementById(containerId);
  if (!root) return;
  if (!root.querySelector('#task-title')) return;

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

  function ensurePriorityStyles() {
    if (document.getElementById('priority-style')) return;
    const style = document.createElement('style');
    style.id = 'priority-style';
    style.textContent = `
      .priority-btn button{
        display:inline-flex;align-items:center;gap:8px;
        padding:10px 16px;border-radius:8px;border:1px solid #D1D5DB;
        background:#FFF;color:#2A3647;cursor:pointer;
        transition:background-color .15s ease,color .15s ease,transform .1s ease;
      }
      .priority-btn button img{ height:18px; width:18px; }
      .priority-btn button[aria-pressed="true"]{ transform:scale(1.02); color:#FFF; border-color:transparent; }
      .priority-btn .btn-urgent[aria-pressed="true"]{ background:#FF3D00; }
      .priority-btn .btn-medium[aria-pressed="true"]{ background:#FFA800; }
      .priority-btn .btn-low[aria-pressed="true"]{ background:#7AE229; }
      .priority-btn button[aria-pressed="true"] img{ filter:brightness(0) invert(1); }
    `;
    document.head.appendChild(style);
  }
  ensurePriorityStyles();

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

  function selectPriority(p) {
    selectedPriority = p;
    [btnUrgent, btnMedium, btnLow].forEach(b => b && b.setAttribute('aria-pressed', 'false'));
    const map = { urgent: btnUrgent, medium: btnMedium, low: btnLow };
    map[p] && map[p].setAttribute('aria-pressed', 'true');
  }
  btnUrgent && btnUrgent.addEventListener('click', () => selectPriority('urgent'));
  btnMedium && btnMedium.addEventListener('click', () => selectPriority('medium'));
  btnLow && btnLow.addEventListener('click', () => selectPriority('low'));

  if (elAssigned) AT.mount(root);


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

  if (elCategory && elCategory.options.length <= 1) {
    elCategory.add(new Option('Technical Task', 'Technical task'));
    elCategory.add(new Option('User Story', 'User Story'));
  }
}

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
