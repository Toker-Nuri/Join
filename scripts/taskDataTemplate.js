/**
 * @global
 * @type {Object|null}
 */
window.currentTask = null;

/**
 * @global
 * @type {string|null}
 */
window.currentTaskId = null;

/**
 * Returns an object containing the real users and the total count,
 * even if the last entry is a placeholder such as { name: "+3" }.
 * @param {Array<Object>} users - Array of user objects.
 * @returns {{realUsers: Array<Object>, totalCount: number}} Object with the real users array and total count.
 */
function getRealUserArrayAndCount(users) {
  if (!isValidUserArray(users)) {
    return { realUsers: [], totalCount: 0 };
  }
  
  const { updatedUsers, placeholderCount } = extractPlaceholder(users);
  
  return {
    realUsers: updatedUsers,
    totalCount: updatedUsers.length + placeholderCount
  };
}

/**
 * Checks if the provided value is a valid array of users.
 * @param {any} users - The value to check.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidUserArray(users) {
  return Array.isArray(users);
}

/**
 * Extracts a placeholder count from the last user if it starts with '+' 
 * and returns the updated users array along with the placeholder count.
 * @param {Array<Object>} users - Array of user objects.
 * @returns {{ updatedUsers: Array<Object>, placeholderCount: number }} 
 *          Object with updated users array and the extracted placeholder count.
 */
function extractPlaceholder(users) {
  let placeholderCount = 0;
  let updatedUsers = users;
  const lastUser = users[users.length - 1];
  
  if (lastUser && typeof lastUser.name === 'string' && lastUser.name.trim().startsWith('+')) {
    const parsedCount = parseInt(lastUser.name.trim().replace('+', ''));
    if (!isNaN(parsedCount)) {
      placeholderCount = parsedCount;
      updatedUsers = users.slice(0, users.length - 1);
    }
  }
  
  return { updatedUsers, placeholderCount };
}


/**
 * Renders the user badges for a task.
 * @param {Array<Object>} users - Array of user objects.
 * @param {number} [maxToShow=3] - Maximum number of badges to display.
 * @returns {string} HTML string representing the badges.
 */
function renderUserBadges(users, maxToShow = 3) {
  const { realUsers, totalCount } = getRealUserArrayAndCount(users);
  let badges = '';
  realUsers.slice(0, maxToShow).forEach(u => {
    const initials = u.initials || '?';
    badges += `<div class="profile-badge-floating-${u.color || 'gray'}">${initials}</div>`;
  });
  if (totalCount > maxToShow) {
    badges += `<div class="profile-badge-floating-gray">+${totalCount - maxToShow}</div>`;
  }
  return badges;
}

/**
 * Updates the status of a subtask and adjusts the progress accordingly.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @param {boolean} newStatus - The new status (true = completed).
 */
function updateSubtaskStatus(taskId, subtaskIndex, newStatus) {
  if (!window.currentTask || window.currentTaskId !== taskId) return;
  window.currentTask.subtasks[subtaskIndex].completed = newStatus;
  const total = window.currentTask.subtasks.length;
  const completed = window.currentTask.subtasks.filter(st => st.completed).length;
  const newProgress = total ? (completed / total) * 100 : 0;
  const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${taskId}.json`;
  fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subtasks: window.currentTask.subtasks, progress: newProgress })
  }).then(r => {
    if (!r.ok) throw new Error("Error updating subtask status.");
  }).catch(() => {});
}

/**
 * Returns a textual label for the priority based on the icon path.
 * @param {string} iconPath - Path of the priority icon.
 * @returns {string} Priority label.
 */
function getPriorityLabel(iconPath) {
  if (!iconPath) return "Unknown";
  if (iconPath.includes("urgent")) return "Urgent";
  if (iconPath.includes("medium")) return "Medium";
  if (iconPath.includes("low")) return "Low";
  return "Unknown";
}

/**
 * Extracts the priority from the icon path.
 * @param {string} iconPath - Path of the priority icon.
 * @returns {string} Extracted priority.
 */
function extractPriority(iconPath) {
  if (!iconPath) return 'medium';
  const lower = iconPath.toLowerCase();
  if (lower.includes('urgent')) return 'urgent';
  if (lower.includes('medium')) return 'medium';
  if (lower.includes('low')) return 'low';
  return 'medium';
}
window.extractPriority = extractPriority;

/**
 * Sets the header area (category) in the modal.
 * @param {Object} task - Task data.
 * @param {HTMLElement} modal - The modal element.
 */
function setCategoryHeader(task, modal) {
  const cat = modal.querySelector('.main-section-task-overlay > div:first-child');
  const isTechnical = task.category.toLowerCase().includes('technical');
  cat.className = `card-label-${isTechnical ? 'technical-task' : 'user-story'}-modal w445`;
  cat.querySelector('h4').textContent = task.category;
}

/**
 * Fills the main fields in the modal.
 * @param {Object} task - Task data.
 */
function setModalFields(task) {
  document.getElementById('modalTitle').innerText = task.title || "No Title";
  document.getElementById('modalDescription').innerText = task.description || "No Description";
  document.getElementById('modalDueDate').innerText = task.dueDate || "No Date";
  document.getElementById('modalPriorityText').innerText = getPriorityLabel(task.priority);
  document.getElementById('modalPriorityIcon').src = task.priority || "";
}

/**
 * Renders the assigned users in the modal.
 * @param {Object} task - Task data.
 */
function setAssignedUsers(task) {
  const assign = document.getElementById('modalAssignedTo');
  if (task.users && Array.isArray(task.users)) {
    assign.innerHTML = task.users.map(u =>
      `<div class="flexrow profile-names">
         <div class="profile-badge-floating-${u.color || 'gray'}">${u.initials || '?'}</div>
         <span class="account-name">${u.name || 'Unknown'}</span>
       </div>`
    ).join("");
  } else {
    assign.innerHTML = "";
  }
}

/**
 * Renders the complete modal header.
 * @param {Object} task - Task data.
 * @param {HTMLElement} modal - The modal element.
 */
function renderModalHeader(task, modal) {
  setCategoryHeader(task, modal);
  setModalFields(task);
  setAssignedUsers(task);
}

/**
 * Clears the container for subtasks and returns it.
 * @returns {HTMLElement} The subtasks container.
 */
function clearSubtasksContainer() {
  const ms = document.getElementById("modalSubtasks");
  ms.innerHTML = "";
  return ms;
}

/**
 * Creates a single subtask element.
 * @param {Object} st - Subtask data.
 * @param {number} index - The index of the subtask.
 * @returns {HTMLElement} The subtask element.
 */
function createSubtaskElement(st, index) {
  const div = document.createElement("div");
  div.classList.add("subtask-container-div-item");
  div.innerHTML = `<div class="flexrow">
                     <input type="checkbox" class="subtask-checkbox" data-index="${index}" ${st.completed ? "checked" : ""}>
                     <span>${st.text}</span>
                   </div>`;
  return div;
}

/**
 * Adds change listeners to all subtask checkboxes.
 * @param {HTMLElement} container - The container of subtasks.
 */
function addSubtaskListeners(container) {
  container.querySelectorAll(".subtask-checkbox").forEach(cb => {
    cb.addEventListener("change", function () {
      updateSubtaskStatus(window.currentTaskId, parseInt(this.getAttribute("data-index"), 10), this.checked);
    });
  });
}

/**
 * Renders all subtasks in the modal.
 * @param {Object} task - Task data.
 */
function renderSubtasks(task) {
  const ms = clearSubtasksContainer();
  if (task.subtasks && Array.isArray(task.subtasks)) {
    task.subtasks.forEach((st, i) => {
      ms.appendChild(createSubtaskElement(st, i));
    });
    addSubtaskListeners(ms);
  }
}

/**
 * Opens the task modal and populates it with the task data.
 * @param {Object} task - The task to be opened.
 */
function openTaskModal(task) {
  window.currentTask = task;
  window.currentTaskId = task.firebaseKey || task.id;
  const modal = document.getElementById('toggleModalFloating');
  modal.dataset.taskId = window.currentTaskId;
  renderModalHeader(task, modal);
  renderSubtasks(task);
  modal.style.display = 'flex';
}

/**
 * Updates the column of a task in Firebase.
 * @param {string} taskId - The ID of the task.
 * @param {string} newColumn - The new column ID.
 * @returns {Promise<void>}
 */
async function updateTaskColumnInFirebase(taskId, newColumn) {
  try {
    const url = `https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/taskData/${taskId}.json`;
    const r = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column: newColumn })
    });
    if (!r.ok) throw new Error(`Error updating task column: ${r.statusText}`);
  } catch (e) {}
}

/**
 * Enables drag & drop functionality for tasks.
 */
function enableDragAndDrop() {
  document.querySelectorAll('.draggable-cards').forEach(card => {
    card.addEventListener('dragstart', () => card.classList.add('dragging'));
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });
  document.querySelectorAll('.task-board-container').forEach(col => {
    col.addEventListener('dragover', e => {
      e.preventDefault();
      const dragCard = document.querySelector('.dragging');
      if (dragCard) col.appendChild(dragCard);
    });
  });
}

/**
 * Calculates the progress (in %) and returns the numbers.
 * @param {Object} task - Task data.
 * @returns {{total: number, completed: number, progress: number}} Object with total, completed and progress.
 */
function calculateProgress(task) {
  const total = task.subtasks ? task.subtasks.length : 0;
  const completed = task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
  const progress = total ? (completed / total) * 100 : 0;
  return { total, completed, progress };
}

/**
 * Returns the priority image path based on the task's priority.
 * @param {Object} task - Task data.
 * @returns {string} The image path for the priority.
 */
function getPriorityImage(task) {
  const mapping = {
    urgent: "../img/icon-urgent.png",
    medium: "../img/priority-img/medium.png",
    low: "../img/icon-low.png"
  };
  let prio = extractPriority(task.priority);
  if (!mapping[prio]) prio = "medium";
  return mapping[prio];
}

/**
 * Creates the header HTML for the task card.
 * @param {Object} task - Task data.
 * @returns {string} HTML string for the header.
 */
function createHeader(task) {
  const labelType = task.category === "Technical task" ? "technical-task" : "user-story";
  const headerTitle = task.category === "Technical task" ? "Technical Task" : "User Story";
  return `
    <div class="card-label-${labelType} padding-left">
      <h4>${headerTitle}</h4>
      <img src="../img/drag-drop-icon.png" alt="drag-and-drop-icon" class="drag-drop-icon">
    </div>`;
}

/**
 * Creates the body HTML for the task card.
 * @param {Object} task - Task data.
 * @returns {string} HTML string for the body.
 */
function createBody(task) {
  return `
    <div><h5 class="card-label-user-story-h5 padding-left">${task.title}</h5></div>
    <div><h6 class="card-label-user-story-h6 padding-left">${task.description}</h6></div>`;
}

/**
 * Creates the progress section HTML for the task card.
 * @param {number} total - Total number of subtasks.
 * @param {number} completed - Number of completed subtasks.
 * @param {number} progress - Progress percentage.
 * @returns {string} HTML string for the progress section.
 */
function createProgressSection(total, completed, progress) {
  const progressStyle = total > 0 ? "" : "display: none;";
  return `
    <div class="task-progress" style="${progressStyle}">
      <div class="progress-main-container">
        <div class="progress-container">
          <div class="progress-bar" style="width: ${progress}%;"></div>
        </div>
      </div>
      <span class="progress-text">${completed} / ${total} tasks</span>
    </div>`;
}

/**
 * Creates the footer HTML for the task card.
 * @param {Object} task - Task data.
 * @returns {string} HTML string for the footer.
 */
function createFooter(task) {
  const userBadges = renderUserBadges(task.users, 3);
  const taskPriority = getPriorityImage(task);
  return `
    <div class="card-footer">
      <div class="padding-left profile-badge-container">
        ${userBadges}
      </div>
      <div class="priority-container-img">
        <img src="${taskPriority}" alt="Priority" 
             onerror="this.src='../img/priority-img/medium.png'" 
             class="priority-container-img">
      </div>
    </div>`;
}

/**
 * Creates the complete task card element.
 * @param {Object} task - Task data.
 * @returns {HTMLElement} The task element.
 */
function createTaskElement(task) {
  const { total, completed, progress } = calculateProgress(task);
  const el = document.createElement("div");
  el.classList.add("draggable-cards");
  el.id = task.firebaseKey || task.id;
  el.setAttribute("draggable", "true");
  el.dataset.title = task.title.toLowerCase();
  el.dataset.description = task.description.toLowerCase();
  el.innerHTML = `
    ${createHeader(task)}
    ${createBody(task)}
    ${createProgressSection(total, completed, progress)}
    ${createFooter(task)}
  `;
  return el;
}

/**
 * Attaches click and dragend listeners to the task element.
 * @param {Object} task - Task data.
 * @param {HTMLElement} taskEl - The task element.
 */
function attachTaskListeners(task, taskEl) {
  taskEl.addEventListener("click", () => openTaskModal(task));
  taskEl.addEventListener("dragend", async function () {
    const newCol = taskEl.closest(".task-board-container")?.id;
    if (newCol) await updateTaskColumnInFirebase(taskEl.id, newCol);
  });
}

function attachMoveDropdownListener(taskEl) {
    const ddIcon = taskEl.querySelector('.drag-drop-icon');
    if (!ddIcon) return;
    ddIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleMoveDropdown(taskEl, ddIcon);
    });
}
  
function toggleMoveDropdown(taskEl, ddIcon) {
    let dd = taskEl.querySelector(".move-to-dropdown");
    if (dd) {
      dd.classList.toggle("visible");
      return;
    }
    dd = createMoveDropdownMenu(ddIcon);
    taskEl.appendChild(dd);
    dd.classList.add("visible");
    attachMoveDropdownOptions(taskEl, dd);
}
  
function createMoveDropdownMenu(ddIcon) {
    const dd = document.createElement("div");
    dd.classList.add("move-to-dropdown");
    dd.innerHTML = `
      <div class="dropdown-header">Move To</div>
      <div class="dropdown-option" data-status="toDoColumn">To do</div>
      <div class="dropdown-option" data-status="inProgress">In Progress</div>
      <div class="dropdown-option" data-status="awaitFeedback">Await Feedback</div>
      <div class="dropdown-option" data-status="done">Done</div>
    `;
    const offsetTop = ddIcon.offsetTop + ddIcon.offsetHeight;
    const offsetLeft = ddIcon.offsetLeft;
    dd.style.position = "absolute";
    dd.style.top = `${offsetTop}px`;
    dd.style.left = `${offsetLeft}px`;
    dd.style.zIndex = 10;
    return dd;
}
  
function attachMoveDropdownOptions(taskEl, dd) {
    dd.querySelectorAll(".dropdown-option").forEach(option => {
      option.addEventListener("click", async function (ev) {
        ev.stopPropagation();
        const ns = option.dataset.status;
        await updateTaskColumnInFirebase(taskEl.id, ns);
        const newCol = document.getElementById(ns);
        if (newCol) newCol.appendChild(taskEl);
        dd.classList.remove("visible");
        checkColumns();
      });
    });
}
  
function generateTasks(tasksData) {
    tasksData.forEach(task => {
      if (!task || !task.title || !task.column) return;
      const taskEl = createTaskElement(task);
      const col = document.getElementById(task.column);
      if (col) col.appendChild(taskEl);
      attachTaskListeners(task, taskEl);
      attachMoveDropdownListener(taskEl);
    });
    checkColumns();
}
  
function readSubtasksFromEditModal() {
    const subtaskItems = document.querySelectorAll('#editSubtasksList .subtask-item');
    const subtasks = [];
    subtaskItems.forEach((item, index) => {
      const span = item.querySelector('span');
      if (span) {
        const text = span.innerText.replace('• ', '').trim();
        const completed = window.currentTask && window.currentTask.subtasks && window.currentTask.subtasks[index]
          ? window.currentTask.subtasks[index].completed
          : false;
        subtasks.push({ text, completed });
      }
    });
    return subtasks;
}
  
function editTaskFromOverlay(event) {
    event.stopPropagation();
    if (!currentTask) return;
    fillEditModal(currentTask);
    document.getElementById('toggleModalFloating').style.display = 'none';
    const modal = document.getElementById('editTaskModal');
    if (modal) modal.style.display = 'flex';
}
  
  
function createNewSubtask(text) {
    const newSubtask = document.createElement('div');
    newSubtask.className = 'subtask-item';
    newSubtask.innerHTML = `
      <span>• ${text}</span>
      <div class="subtask-actions">
        <img src="../img/pen.png" alt="Edit" class="subtask-edit-edit">
        <img src="../img/trash.png" alt="Delete" class="subtask-delete-edit">
      </div>`;
    newSubtask.dataset.index = window.currentTask.subtasks ? window.currentTask.subtasks.length : 0;
    return newSubtask;
}
  
function fillEditModal(task) {
    setTaskFields(task);
    setAssigneeBadges(task);
    setSubtasksList(task);
    loadContacts(task.users || []);
}
  
function setTaskFields(task) {
    document.getElementById('editTaskTitle').value = task.title || "";
    document.getElementById('editTaskDescription').value = task.description || "";
    document.getElementById('editDueDate').value = task.dueDate || "";
    const prio = extractPriority(task.priority);
    setEditPriority(prio);
    if (task.category === 'Technical task') {
      document.getElementById('editTaskCategory').value = 'technical';
    } else if (task.category === 'User Story') {
      document.getElementById('editTaskCategory').value = 'userstory';
    } else {
      document.getElementById('editTaskCategory').value = '';
    }
}
  
function setAssigneeBadges(task) {
  const badges = document.getElementById('assigneeBadges');
  if (badges && task.users && task.users.length > 0) {
    badges.innerHTML = generateAssigneeBadges(task.users);
  } else if (badges) {
    badges.innerHTML = "";
  }
}

function generateAssigneeBadges(users) {
  return users.map(user => createBadgeHTML(user)).join("");
}

function createBadgeHTML(user) {
  let colorValue = user.color || "default";
  if (colorValue.startsWith('#')) {
    colorValue = mapHexToColorName(colorValue);
  }
  const badgeClass = getBadgeClassFromAnyColor(colorValue);
  const initials = user.initials || getInitials(user.name);
  return `
    <div class="assignee-badge ${badgeClass}"
         data-contact-color="${colorValue}"
         data-contact-name="${user.name}">
      ${initials}
    </div>`;
}

function mapHexToColorName(hexColor) {
  switch (hexColor.toUpperCase()) {
    case '#F57C00': return 'orange';
    case '#E74C3C': return 'red';
    case '#5C6BC0': return 'blue';
    case '#4CAF50': return 'green';
    case '#8E44AD': return 'purple';
    case '#EE00FF': return 'pink';
    default: return "default";
  }
}

  
function setSubtasksList(task) {
    const list = document.getElementById('editSubtasksList');
    list.innerHTML = "";
    if (task.subtasks && Array.isArray(task.subtasks) && task.subtasks.length) {
      task.subtasks.forEach((subtask, index) => {
        const subtaskItem = createSubtaskItem(subtask);
        subtaskItem.dataset.index = index;
        list.appendChild(subtaskItem);
      });
    }
}
  
function createSubtaskContainer() {
    const container = document.createElement("div");
    container.className = "subtask-item";
    return container;
}
  
function createSubtaskCheckbox(subtask) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "subtask-edit-checkbox";
    checkbox.checked = subtask.completed;
    return checkbox;
}
  
function attachSubtaskEditListener(container, span, originalText, actionsDiv) {
    const editIcon = actionsDiv.querySelector('.subtask-edit-edit');
    editIcon.addEventListener('click', () => {
      replaceSpanWithInput(container, span, originalText);
    });
}
  
function createSubtaskItem(subtask) {
    const container = createSubtaskContainer();
    const checkbox = createSubtaskCheckbox(subtask);
    const span = createSubtaskTextSpan(subtask.text);
    const actionsDiv = createSubtaskActions();
    
    container.appendChild(checkbox);
    container.appendChild(span);
    container.appendChild(actionsDiv);
    
    attachSubtaskEditListener(container, span, subtask.text, actionsDiv);
    
    return container;
}





