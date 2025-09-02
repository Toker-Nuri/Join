document.addEventListener("DOMContentLoaded", initTaskForm);

function initTaskForm() {
  bindCreateButton();
  const createBtn = document.querySelector('.create-btn');
  if (createBtn) {
    createBtn.classList.remove('disabled');
    createBtn.style.pointerEvents = 'auto';
    createBtn.style.opacity = '1';
  }
  bindInputValidation();
  observeAssignedProfiles();
  bindPrioritySelection();
  bindCategorySelection();
  initCategoryDropdownToggle();
  initAssignedToToggle();
  window.initAssignDropdownCreate = initAssignDropdownCreate;
  bindSubtaskManagement();
  validateForm();
}

async function initAssignDropdownCreate() {
  await loadContactsForCreate();
}

async function loadContactsForCreate() {
  const list = document.querySelector('.custom-dropdown .dropdown-list');
  if (!list) return;
  list.innerHTML = '';
  const contacts = await fetchContactsLocalFirst();
  Object.entries(contacts).forEach(([id, contact]) => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    const initials = getInitials(contact.name || '');
    const colorValue = contact.color || 'default';
    item.innerHTML = `
      <div class="contact-info">
        <span class="initials-circle" style="background-color: ${colorValue};">${initials}</span>
        <span class="contact-name">${contact.name || ''}</span>
      </div>
    `;
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAssignCreateBadge(contact.name || '');
      hideAssignedDropdown();
    });
    list.appendChild(item);
  });
}

function toggleAssignCreateBadge(name) {
  const container = document.querySelector('.assigned-to-profiles-container');
  if (!container || !name) return;
  const existing = Array.from(container.querySelectorAll('div')).find(d => d.textContent.trim() === name);
  if (existing) {
    existing.remove();
  } else {
    const badge = document.createElement('div');
    badge.textContent = name;
    container.appendChild(badge);
  }
  validateForm();
}

function initAssignedToToggle() {
  const container = document.querySelector('.custom-dropdown');
  function toggleDropdownAssignedTo() {
    const dropdownList = document.querySelector('.custom-dropdown .dropdown-list');
    if (!dropdownList) return;
    dropdownList.style.display = dropdownList.style.display === 'block' ? 'none' : 'block';
  }
  function outsideClick(e) {
    const dropdownList = document.querySelector('.custom-dropdown .dropdown-list');
    if (!dropdownList || !container) return;
    if (!container.contains(e.target)) {
      dropdownList.style.display = 'none';
    }
  }
  window.toggleDropdown = toggleDropdownAssignedTo;
  document.addEventListener('click', outsideClick);
}

function hideAssignedDropdown() {
  const dropdownList = document.querySelector('.custom-dropdown .dropdown-list');
  if (dropdownList) dropdownList.style.display = 'none';
}

async function fetchContactsLocalFirst() {
  try {
    const raw = localStorage.getItem('contacts');
    if (raw) return JSON.parse(raw);
  } catch(_) {}
  return { c1:{name:'Max Mustermann', color:'green'}, c2:{name:'Erika Musterfrau', color:'blue'}, c3:{name:'John Doe', color:'orange'} };
}

function bindCreateButton() {
  const btn = getUniqueCreateButton();
  if (!btn) return;
  btn.addEventListener("click", createTaskHandler);
}

function getUniqueCreateButton() {
  const oldBtn = document.querySelector(".create-btn");
  if (!oldBtn) return null;
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  return newBtn;
}

async function createTaskHandler(e) {
  const btn = e.currentTarget;
  if (!validateForm()) return;
  btn.disabled = true;
  try {
    await addTaskToFirebase();
  } catch (error) {
    console.error("Task creation failed", error);
  } finally {
    btn.disabled = false;
  }
}

function bindInputValidation() {
  const selectors = [
    ".input",
    ".date-input",
    ".select-task",
    ".priority-container",
    ".description",
    ".subtask"
  ];
  selectors.forEach(addValidationListener);
}

function addValidationListener(selector) {
  const element = document.querySelector(selector);
  if (element) {
    const eventType = selector === ".select-task" ? "change" : "input";
    element.addEventListener(eventType, validateForm);
  }
}

function observeAssignedProfiles() {
  const container = document.querySelector(".assigned-to-profiles-container");
  if (container) {
    const observer = new MutationObserver(validateForm);
    observer.observe(container, { childList: true });
  }
}

function bindPrioritySelection() {
  const options = document.querySelectorAll(".priority-container div");
  options.forEach(option => {
    option.addEventListener("click", () => {
      removeActiveClass(options);
      option.classList.add("active");
      validateForm();
    });
  });
}

function removeActiveClass(options) {
  options.forEach(o => o.classList.remove("active"));
}

function bindCategorySelection() {
  const categoryItems = document.querySelectorAll('.category-item');
  categoryItems.forEach(item => {
    item.addEventListener('click', () => handleCategorySelection(categoryItems, item));
  });
}

function handleCategorySelection(items, item) {
  items.forEach(i => i.classList.remove('selected'));
  item.classList.add('selected');
  updateCategoryText(item);
  updateCategorySelect(item);
  hideCategoryOptions();
  validateForm();
}

function updateCategoryText(item) {
  const categoryDisplay = document.querySelector('.category-selected');
  if (categoryDisplay) categoryDisplay.textContent = item.textContent;
}

function updateCategorySelect(item) {
  const select = document.querySelector(".select-task");
  if (select) select.value = item.getAttribute("data-value");
}

function initCategoryDropdownToggle() {
  const dropdown = document.querySelector('.category-dropdown');
  const options = dropdown?.querySelector('.category-options');
  if (!dropdown || !options) return;
  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', () => {
    options.style.display = 'none';
  });
}

function hideCategoryOptions() {
  const options = document.querySelector('.category-dropdown .category-options');
  if (options) options.style.display = 'none';
}

function bindSubtaskManagement() {
  const subtaskInput = document.querySelector(".subtask");
  const addSubtaskBtn = document.getElementById("addSubtask");
  const subtasksContainer = document.querySelector(".subtasks-scroll-container");
  if (!addSubtaskBtn || !subtaskInput || !subtasksContainer) return;
  addSubtaskBtn.addEventListener("click", () => { handleAddSubtask(subtaskInput, subtasksContainer); validateForm(); });
  subtasksContainer.addEventListener("click", (e) => { handleSubtaskDeletion(e); validateForm(); });
}

function handleAddSubtask(subtaskInput, container) {
  const text = subtaskInput.value.trim();
  if (text !== "") {
    const newItem = createSubtaskItem(text);
    container.appendChild(newItem);
    subtaskInput.value = "";
    validateForm();
  }
}

function createSubtaskItem(text) {
  const newItem = document.createElement("div");
  newItem.classList.add("subtask-item", "added-subtasks");
  newItem.innerHTML = `
    <span>${text}</span>
    <img src="../img/subtask-delete.png" alt="Delete Subtask" class="subtask-icon delete-icon" />
  `;
  return newItem;
}

function handleSubtaskDeletion(e) {
  if (e.target.classList.contains("delete-icon")) {
    e.target.parentElement.remove();
    validateForm();
  }
}

function insertTaskToBoard(task) {
  try {
    const el = createTaskElement(task);
    const col = document.getElementById(task.column || 'toDoColumn');
    if (col) col.appendChild(el);
    if (typeof attachTaskListeners === 'function') attachTaskListeners(task, el);
    if (typeof attachMoveDropdownListener === 'function') attachMoveDropdownListener(el);
    if (typeof checkColumns === 'function') checkColumns();
  } catch (_) {}
}

async function addTaskToFirebase() {
  const firebaseURL = "####";// hier link einfügen!!
  const taskData = getTaskData();
  const noBackend = !firebaseURL || firebaseURL.includes('#');
  if (noBackend) {
    saveTaskToLocal(taskData);
    insertTaskToBoard(taskData);
    clearForm();
    closeModal();
    return;
  }
  try {
    const response = await fetch(firebaseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData)
    });
    const resData = await response.json();
    const firebaseId = resData.name;
    if (!firebaseId) throw new Error('No Firebase id');
    await updateFirebaseTaskId(firebaseURL, firebaseId);
    taskData.id = firebaseId;
    taskData.firebaseKey = firebaseId;
    saveTaskToLocal(taskData);
    insertTaskToBoard(taskData);
    clearForm();
    closeModal();
  } catch (error) {
    saveTaskToLocal(taskData);
    insertTaskToBoard(taskData);
    clearForm();
    closeModal();
  }
}

function saveTaskToLocal(taskData) {
  const id = `local-${Date.now()}`;
  taskData.id = id;
  taskData.firebaseKey = id;
  try {
    const raw = localStorage.getItem('taskData');
    const obj = raw ? JSON.parse(raw) : {};
    obj[id] = taskData;
    localStorage.setItem('taskData', JSON.stringify(obj));
  } catch (_) {}
}

function getTaskData() {
  return {
    column: "toDoColumn",
    description: getInputValue(".description", "No description provided"),
    dueDate: getInputValue(".date-input"),
    id: null,
    priority: `../img/priority-img/${getSelectedPriority()}.png`,
    progress: 0,
    title: getInputValue(".input"),
    users: getSelectedUsers(),
    subtasks: getSubtasks(),
    category: getSelectedCategory()
  };
}

async function updateFirebaseTaskId(url, firebaseId) {
  const updateURL = url.replace(".json", `/${firebaseId}/id.json`);
  await fetch(updateURL, {
    method: "PUT",
    body: JSON.stringify(firebaseId)
  });
}

function getInputValue(selector, fallback = "") {
  return document.querySelector(selector)?.value.trim() || fallback;
}

function getSelectedPriority() {
  const el = document.querySelector(".priority-container .active");
  if (!el) return "low";
  if (el.classList.contains("priority-button-urgent")) return "urgent";
  if (el.classList.contains("priority-button-medium")) return "medium";
  if (el.classList.contains("priority-button-low")) return "low";
  return "low";
}

function getSelectedUsers() {
  return [...document.querySelectorAll(".assigned-to-profiles-container div")]
    .map(user => ({ name: user.innerText.trim() })) || [{ name: "Unassigned" }];
}

function getSubtasks() {
  return [...document.querySelectorAll(".subtasks-scroll-container .subtask-item span")].map(span => ({
    completed: false,
    text: span.innerText.trim()
  }));
}

function getSelectedCategory() {
  const selectedItem = document.querySelector(".category-item.selected");
  if (selectedItem) return selectedItem.dataset.value || "";
  const display = document.querySelector('.category-selected')?.textContent?.trim() || "";
  if (display.toLowerCase() === 'technical task') return 'Technical task';
  if (display.toLowerCase() === 'user story') return 'User Story';
  return "";
}

function clearForm() {
  [".input", ".description", ".date-input", ".select-task", ".subtask"].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.value = "";
  });
  document.querySelectorAll(".assigned-to-profiles-container div").forEach(div => div.remove());
  const subtasksContainer = document.querySelector(".subtasks-scroll-container");
  if (subtasksContainer) subtasksContainer.innerHTML = "";
}

function closeModal() {
  const modal = document.getElementById("taskModal");
  if (modal) modal.style.display = "none";
}

function isTaskFormValid() {
  const title = getInputValue(".input");
  const dueDate = getInputValue(".date-input");
  const category = getSelectedCategory();
  return !!(title && dueDate && category);
}

function updateCreateButtonState(isValid) {
  const createBtn = document.querySelector(".create-btn");
  if (!createBtn) return;
  if (isValid) {
    createBtn.classList.remove("disabled");
    createBtn.style.pointerEvents = "auto";
    createBtn.style.opacity = "1";
  } else {
    createBtn.classList.add("disabled");
    createBtn.style.pointerEvents = "none";
    createBtn.style.opacity = "0.5";
  }
}

function validateForm() {
  const isValid = isTaskFormValid();
  updateCreateButtonState(isValid);
  return isValid;
}