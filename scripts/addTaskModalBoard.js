document.addEventListener("DOMContentLoaded", initTaskForm);

function initTaskForm() {
  bindCreateButton();
  bindInputValidation();
  observeAssignedProfiles();
  bindPrioritySelection();
  bindCategorySelection();
  bindSubtaskManagement();
  validateForm();
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

function bindSubtaskManagement() {
  const subtaskInput = document.querySelector(".subtask");
  const addSubtaskBtn = document.getElementById("addSubtask");
  const subtasksContainer = document.querySelector(".subtasks-scroll-container");
  if (!addSubtaskBtn || !subtaskInput || !subtasksContainer) return;
  addSubtaskBtn.addEventListener("click", () => handleAddSubtask(subtaskInput, subtasksContainer));
  subtasksContainer.addEventListener("click", handleSubtaskDeletion);
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

async function addTaskToFirebase() {
  const firebaseURL = "##";// hier link einfügen!!
  const taskData = getTaskData();
  try {
    const response = await fetch(firebaseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData)
    });
    const resData = await response.json();
    const firebaseId = resData.name;
    if (!firebaseId) return;
    await updateFirebaseTaskId(firebaseURL, firebaseId);
    clearForm();
    closeModal();
    location.reload();
  } catch (error) {
    console.error("Error while saving task to Firebase", error);
  }
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
  return document.querySelector(".priority-container .active")?.dataset.priority || "low";
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
  const activeItem = document.querySelector(".category-item.selected");
  return activeItem ? activeItem.dataset.value : "Technical task";
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
  const category = document.querySelector(".category-item.selected")?.dataset.value;
  const assignedUsers = document.querySelectorAll(".assigned-to-profiles-container div").length > 0;
  const prioritySelected = !!document.querySelector(".priority-container .active");
  const hasSubtask = document.querySelectorAll(".added-subtasks").length > 0;
  return title && dueDate && category && assignedUsers && prioritySelected && hasSubtask;
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