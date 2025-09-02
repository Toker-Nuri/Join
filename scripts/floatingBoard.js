function setPriorityFloatingEdit(priority) {
  const allButtons = document.querySelectorAll(
    '.priority-button-urgentFloating, .priority-button-mediumFloating, .priority-button-lowFloating'
  );
  const selectedButtons = document.querySelectorAll(`.priority-button-${priority}`);
  if (selectedButtons.length === 0) {
    return;
  }
  const selectedButton = selectedButtons[0];
  if (selectedButton.classList.contains('active')) {
    selectedButton.classList.remove('active');
  } else {
    allButtons.forEach(button => button.classList.remove('active'));
    selectedButton.classList.add('active');
  }
}

function deleteTaskFromFirebase() {
  if (!currentTaskId) return;
  try {
    const raw = localStorage.getItem('taskData');
    const obj = raw ? JSON.parse(raw) : {};
    const key = currentTaskId;
    if (obj[key]) {
      delete obj[key];
      localStorage.setItem('taskData', JSON.stringify(obj));
    }
  } catch (_) {}
  const card = document.getElementById(currentTaskId);
  if (card && card.parentElement) card.parentElement.removeChild(card);
  const modal = document.getElementById("toggleModalFloating");
  if (modal) modal.style.display = "none";
  if (typeof checkColumns === 'function') checkColumns();
}
