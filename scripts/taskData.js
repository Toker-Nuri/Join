
window.closeModalAndReload = closeModalAndReload;

let tasks = [];

function getInitials(fullName) {
  const parts = fullName.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

function getRandomColor() {
  const colors = ["red", "green", "blue", "pink", "orange", "purple"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function enrichTasksWithUserData(tasks) {
  tasks.forEach(task => {
    if (!task.users) return;
    task.users.forEach(user => {
      if (!user.initials) user.initials = getInitials(user.name);
      if (!user.color) user.color = getRandomColor();
    });
  });
}

function getTasksFromLocalStorage() {
  try {
    const raw = localStorage.getItem('taskData');
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return Object.entries(obj).map(([key, value]) => ({ firebaseKey: key, ...value }));
  } catch (_) {
    return null;
  }
}

function provideSampleTasks() {
  return [
    {
      firebaseKey: 'sample-1',
      id: 'sample-1',
      column: 'toDoColumn',
      title: 'Sample Task',
      description: 'Beispielbeschreibung',
      dueDate: new Date().toLocaleDateString('de-DE'),
      priority: '../img/priority-img/medium.png',
      progress: 0,
      category: 'Technical task',
      users: [ { name: 'Max Mustermann', color: 'green' } ],
      subtasks: [ { text: 'Teilaufgabe', completed: false } ]
    }
  ];
}

async function loadTasksFromFirebase() {
  const url = "####";// hier link einfügen!!
  const lsFirst = getTasksFromLocalStorage();
  if (lsFirst && lsFirst.length) {
    enrichTasksWithUserData(lsFirst);
    return lsFirst;
  }
  const shouldUseFallback = !url || url.includes('#');
  if (shouldUseFallback) {
    const data = provideSampleTasks();
    enrichTasksWithUserData(data);
    return data;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error loading tasks");
    let data = await response.json();
    if (!data || typeof data !== "object") return [];
    let tasksArray = Object.entries(data)
      .filter(([key]) => key !== "null" && key !== "task-3")
      .map(([key, value]) => ({ firebaseKey: key, ...value }));
    enrichTasksWithUserData(tasksArray);
    return tasksArray;
  } catch (error) {
    const ls = getTasksFromLocalStorage();
    const data = (ls && ls.length) ? ls : provideSampleTasks();
    enrichTasksWithUserData(data);
    return data;
  }
}

document.addEventListener("click", function() {
  document.querySelectorAll(".move-to-dropdown.visible").forEach(function(dropdown) {
    dropdown.classList.remove("visible");
  });
});

function filterTasks(searchTerm) {
  const tasksElements = document.querySelectorAll(".draggable-cards");
  let found = false;
  tasksElements.forEach(task => {
    const title = task.dataset.title || "";
    const description = task.dataset.description || "";
    if (title.includes(searchTerm) || description.includes(searchTerm)) {
      task.style.display = "flex";
      found = true;
    } else {
      task.style.display = "none";
    }
  });
  document.getElementById("errorTaskFound").style.display = found ? "none" : "block";
}

function enableDragAndDrop() {
  attachDragListenersToCards();
  attachDragOverListenersToColumns();
}

function attachDragListenersToCards() {
  const cards = document.querySelectorAll('.draggable-cards');
  cards.forEach(card => {
    card.addEventListener('dragstart', () => {
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });
}

function attachDragOverListenersToColumns() {
  const columns = document.querySelectorAll('.task-board-container');
  columns.forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingCard = document.querySelector('.dragging');
      if (draggingCard) {
        column.appendChild(draggingCard);
      }
    });
  });
}


document.addEventListener("DOMContentLoaded", async () => {
  tasks = await loadTasksFromFirebase();
  generateTasks(tasks);
  enableDragAndDrop();
  checkColumns();
  document.getElementById("searchInput").addEventListener("input", function () {
    filterTasks(this.value.trim().toLowerCase());
  });
});

function closeModalAndReload() {
  const modal = document.getElementById('toggleModalFloating');
  if (modal) {
    modal.style.display = 'none';
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const floatingModal = document.getElementById('toggleModalFloating');
  const modalContent = document.querySelector('.main-section-task-overlay');
  if (floatingModal && modalContent) {
    floatingModal.addEventListener('click', function(event) {
      if (event.target === floatingModal) {
        floatingModal.style.display = 'none';
      }
    });
    modalContent.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  }
});

function reloadPage() {}
