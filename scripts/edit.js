function toggleModalfloating() {
  const modal = document.getElementById('toggleModalFloating');
  if (!modal) return;
  modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function toggleModalEdit() {
  const modal = document.getElementById('editTaskModal');
  if (!modal) return;
  modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("editTaskModal");
  const modalContent = document.querySelector(".edit-modal-container");
  if (!modal || !modalContent) return;

  function toggleModalEdit() {
    modal.style.display = modal.style.display === "block" ? "none" : "block";
  }

  function closeModalEdit() {
    modal.style.display = "none";
  }

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeModalEdit();
    }
  });

  modalContent.addEventListener("click", event => {
    event.stopPropagation();
  });

  document.querySelectorAll(".edit-close-icon, .close-modal-btn").forEach(button => {
    button.addEventListener("click", closeModalEdit);
  });

  document.querySelectorAll(".open-modal-btn").forEach(button => {
    button.addEventListener("click", toggleModalEdit);
  });
});
