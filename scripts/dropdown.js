document.addEventListener('DOMContentLoaded', function () {
  const accountButton = document.querySelector('.account');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  if (!accountButton || !dropdownMenu) return;

  accountButton.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    dropdownMenu.classList.toggle('show');
  });

  document.addEventListener('click', function() {
    dropdownMenu.classList.remove('show');
  });
});