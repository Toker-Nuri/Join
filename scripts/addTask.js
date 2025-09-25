/* addTask.js — eigenständige Version, keine anderen Dateien nötig
   - Assigned-to Dropdown wie im Screenshot
   - Speichert Tasks in Firebase und leitet danach zum Board weiter
   - Lässt Summary/Board-Logik deines Teams unberührt
*/

(() => {
  // ====== Einstellungen / Helpers ======
  const FIREBASE_URL = 'https://join-360-fb6db-default-rtdb.europe-west1.firebasedatabase.app'; // wie teamweit genutzt
  const TASKS_PATH = `${FIREBASE_URL}/tasks.json`;
  const CONTACTS_PATH = `${FIREBASE_URL}/contacts.json`;

  // Initialen & Avatarfarbe (lokale Helfer; keine Abhängigkeit zu utils.js nötig)
  function getInitials(name) {
    const words = String(name || '').trim().split(/\s+/);
    if (!words[0]) return '??';
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    return words[0].substring(0, 2).toUpperCase();
  }
  function avatarColor(name) {
    const colors = ['#F57C00', '#0FA3B1', '#4CAF50', '#5C6BC0', '#E74C3C', '#8E44AD', '#EE00FF']; // orange, teal, green, blue, red, purple, pink
    const idx = (String(name || '').length || 0) % colors.length;
    return colors[idx];
  }

  // Mini-CSS nur für das neue Dropdown/Badges
  function injectStyles() {
    if (document.getElementById('addtask-assigned-styles')) return;
    const css = `
      .assign-field { position: relative; }
      .assign-input {
        width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 10px;
        outline: none;
      }
      .assign-input:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(59,130,246,.15); }
      .assign-dd {
        position: absolute; left: 0; right: 0; top: calc(100% + 6px);
        background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; max-height: 280px; overflow: auto;
        box-shadow: 0 10px 25px rgba(0,0,0,.08); z-index: 20; display: none;
      }
      .assign-item { display:flex; align-items:center; gap:14px; padding:12px 14px; cursor:pointer; }
      .assign-item + .assign-item { border-top: 1px solid #f3f4f6; }
      .assign-item:hover { background:#f9fafb; }
      .assign-avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center;
                       justify-content:center; font-weight:700; color:#fff; flex:0 0 36px; }
      .assign-name { flex:1; }
      .assign-check { width:18px; height:18px; border:2px solid #9ca3af; border-radius:4px; display:inline-block; }
      .assign-check.checked { background:#111827; border-color:#111827; }
      #assigned-preview { margin-top:8px; display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
      .assign-badge {
        width:32px; height:32px; border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        font-weight:700; font-size:12px; color:#fff; cursor:pointer; user-select:none;
        box-shadow: 0 0 0 2px #fff;
      }
      .assign-hint{ font-size:12px; color:#6b7280; }
      .priority-btn button{ display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:8px;
        border:1px solid #D1D5DB; background:#FFF; color:#2A3647; cursor:pointer; transition:.15s; }
      .priority-btn button[aria-pressed="true"]{ transform:scale(1.02); color:#FFF; border-color:transparent; }
      .priority-btn .btn-urgent[aria-pressed="true"]{ background:#FF3D00; }
      .priority-btn .btn-medium[aria-pressed="true"]{ background:#FFA800; }
      .priority-btn .btn-low[aria-pressed="true"]{ background:#7AE229; }
      .priority-btn button[aria-pressed="true"] img{ filter:brightness(0) invert(1); }
    `;
    const style = document.createElement('style');
    style.id = 'addtask-assigned-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ====== Assigned-to Dropdown (Screenshot-Style) ======
  function buildAssignedUI(root) {
    const select = root.querySelector('#task-assigned');
    if (!select) return null;

    // ursprüngliches <select> ausblenden
    select.style.display = 'none';

    // Feld + Liste einhängen
    const wrap = document.createElement('div');
    wrap.className = 'assign-field';
    const input = document.createElement('input');
    input.className = 'assign-input';
    input.type = 'text';
    input.placeholder = 'Select to assign';
    input.readOnly = true;

    const dd = document.createElement('div');
    dd.className = 'assign-dd';

    const preview = document.createElement('div');
    preview.id = 'assigned-preview';

    select.insertAdjacentElement('afterend', preview);
    select.insertAdjacentElement('afterend', dd);
    select.insertAdjacentElement('afterend', input);
    input.insertAdjacentElement('beforebegin', wrap);
    wrap.appendChild(input);
    wrap.appendChild(dd);

    // State
    const selected = new Map(); // key -> {name,color}

    function renderPreview() {
      preview.innerHTML = '';
      if (selected.size === 0) return;
      const strip = document.createElement('div');
      strip.style.display = 'flex';
      strip.style.alignItems = 'center';
      strip.style.gap = '8px';
      Array.from(selected.values()).forEach(c => {
        const b = document.createElement('div');
        b.className = 'assign-badge';
        b.textContent = getInitials(c.name);
        b.style.background = c.color || avatarColor(c.name);
        b.title = `${c.name} – entfernen`;
        b.addEventListener('click', () => {
          selected.delete(c.name);
          // uncheck im Dropdown
          dd.querySelectorAll('.assign-item').forEach(it => {
            if (it.dataset.name === c.name) it.querySelector('.assign-check').classList.remove('checked');
          });
          renderPreview();
        });
        strip.appendChild(b);
      });
      const hint = document.createElement('span');
      hint.className = 'assign-hint';
      hint.textContent = 'Klicken zum Entfernen';
      preview.appendChild(strip);
      preview.appendChild(hint);
    }

    function addContactRow(name) {
      const row = document.createElement('div');
      row.className = 'assign-item';
      row.dataset.name = name;

      const av = document.createElement('div');
      av.className = 'assign-avatar';
      av.style.background = avatarColor(name);
      av.textContent = getInitials(name);

      const nm = document.createElement('div');
      nm.className = 'assign-name';
      nm.textContent = name;

      const ck = document.createElement('span');
      ck.className = 'assign-check';

      row.appendChild(av);
      row.appendChild(nm);
      row.appendChild(ck);

      row.addEventListener('click', () => {
        if (selected.has(name)) {
          selected.delete(name);
          ck.classList.remove('checked');
        } else {
          selected.set(name, { name, color: av.style.background });
          ck.classList.add('checked');
        }
        renderPreview();
      });
      dd.appendChild(row);
    }

    async function loadContacts() {
      dd.innerHTML = '';
      try {
        const res = await fetch(CONTACTS_PATH);
        const contacts = await res.json(); // {id: {name}}
        if (contacts && typeof contacts === 'object') {
          Object.values(contacts).forEach(c => c?.name && addContactRow(c.name));
        } else {
          // Fallback (falls keine Remote-Kontakte)
          ['Max Mustermann', 'Erika Musterfrau', 'John Doe'].forEach(addContactRow);
        }
      } catch {
        ['Max Mustermann', 'Erika Musterfrau', 'John Doe'].forEach(addContactRow);
      }
    }

    input.addEventListener('click', async () => {
      if (dd.style.display !== 'block') await loadContacts();
      dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) dd.style.display = 'none';
    });

    return {
      users: () => Array.from(selected.values()).map(u => ({ name: u.name })), // Team-Code ergänzt Initialen/Farben später automatisch
      clear: () => { selected.clear(); renderPreview(); }
    };
  }

  // ====== Formular-Logik (Add Task) ======
  function setupAddTaskForm(containerId = 'addtask-container') {
    const root = document.getElementById(containerId);
    if (!root) return;
    injectStyles();

    const elTitle = root.querySelector('#task-title');
    const elDesc = root.querySelector('#task-desc');
    const elDue = root.querySelector('#task-due');
    const elCategory = root.querySelector('#task-category');
    const elSubtaskInput = root.querySelector('#subtask-input');
    const elAddSubtaskBtn = root.querySelector('#add-subtask-btn');
    const elSubtaskList = root.querySelector('#subtask-list');
    const btnCreate = root.querySelector('#create-task-btn');
    const btnClear = root.querySelector('#clear-task-btn');

    const btnUrgent = root.querySelector('.btn-urgent');
    const btnMedium = root.querySelector('.btn-medium');
    const btnLow = root.querySelector('.btn-low');

    // Assigned-To UI (Screenshot-Stil)
    const assignee = buildAssignedUI(root);

    // Priority
    let selectedPriority = 'medium';
    function selectPriority(p) {
      selectedPriority = p;
      [btnUrgent, btnMedium, btnLow].forEach(b => b && b.setAttribute('aria-pressed', 'false'));
      const map = { urgent: btnUrgent, medium: btnMedium, low: btnLow };
      map[p] && map[p].setAttribute('aria-pressed', 'true');
    }
    btnUrgent?.addEventListener('click', () => selectPriority('urgent'));
    btnMedium?.addEventListener('click', () => selectPriority('medium'));
    btnLow?.addEventListener('click', () => selectPriority('low'));
    selectPriority('medium');

    // Subtasks
    function addSubtask(text) {
      if (!text) return;
      const li = document.createElement('li');
      li.textContent = text;
      li.dataset.text = text;
      li.title = 'Klicken zum Entfernen';
      li.addEventListener('click', () => li.remove());
      elSubtaskList.appendChild(li);
    }
    elAddSubtaskBtn?.addEventListener('click', () => {
      const t = elSubtaskInput.value.trim();
      if (t) { addSubtask(t); elSubtaskInput.value = ''; }
    });
    elSubtaskInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const t = elSubtaskInput.value.trim();
        if (t) { addSubtask(t); elSubtaskInput.value = ''; }
      }
    });

    // Kategorien (falls leer)
    if (elCategory && elCategory.options.length <= 1) {
      elCategory.add(new Option('Technical Task', 'Technical task'));
      elCategory.add(new Option('User Story', 'User Story'));
    }

    // Mapping Helfer
    function mapCategory(val) {
      const v = String(val || '').toLowerCase();
      if (v.includes('technical')) return 'Technical task';
      if (v.includes('user')) return 'User Story';
      return val || 'Technical task';
    }
    function priorityPath(p) { return `../img/priority-img/${p}.png`; } // Board schaut auf 'urgent/medium/low' im Pfad. :contentReference[oaicite:1]{index=1}

    // Task bauen
    function buildTask() {
      const subtasks = Array.from(root.querySelectorAll('#subtask-list li'))
        .map(li => ({ text: li.dataset.text || li.textContent.trim(), completed: false }));
      return {
        column: 'toDoColumn',
        description: (elDesc?.value.trim() || 'No description provided'),
        dueDate: (elDue?.value || '').trim(),
        id: null,                                    // wird nach dem POST gesetzt (wie im Team-Code) :contentReference[oaicite:2]{index=2}
        priority: priorityPath(selectedPriority),
        progress: 0,
        title: (elTitle?.value.trim() || ''),
        users: assignee ? assignee.users() : [],
        subtasks,
        category: mapCategory(elCategory?.value)
      };
    }

    // In Firebase speichern (POST) und id nachtragen (PUT)
    async function saveToFirebase(task) {
      const resp = await fetch(TASKS_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      const data = await resp.json(); // { name: "<firebaseKey>" }
      const firebaseId = data && data.name;
      if (!firebaseId) return null;

      // id-Feld in Task schreiben
      await fetch(`${FIREBASE_URL}/tasks/${firebaseId}/id.json`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(firebaseId)
      });
      return firebaseId;
    }

    // Create
    btnCreate?.addEventListener('click', async () => {
      const t = buildTask();
      if (!t.title || !t.dueDate) {
        // Mini-Validierung wie im Team: Titel & Datum Pflicht
        const err = document.getElementById('form-error-message');
        err && (err.style.display = 'block');
        return;
      }
      try {
        const key = await saveToFirebase(t);
        if (key) window.location.href = './board.html'; // nach erfolgreichem Speichern zum Board
      } catch (e) {
        console.error('Error saving task', e);
      }
    });

    // Clear
    btnClear?.addEventListener('click', () => {
      if (elTitle) elTitle.value = '';
      if (elDesc) elDesc.value = '';
      if (elDue) elDue.value = '';
      if (elCategory) elCategory.value = '';
      if (elSubtaskList) elSubtaskList.innerHTML = '';
      assignee?.clear();
      selectPriority('medium');
    });
  }

  // ====== Bootstrapping ======
  document.addEventListener('DOMContentLoaded', () => {
    // Seite besitzt die Add-Task-Fläche
    const container = document.getElementById('addtask-container');
    if (!container) return;
    setupAddTaskForm('addtask-container');
  });
})();
