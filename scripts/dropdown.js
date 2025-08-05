document.addEventListener('DOMContentLoaded', function () {
  const accountButton = document.querySelector('.account');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  const logoutLink = dropdownMenu?.querySelector('a[href*="##"]');// link einfügen!!
  if (!accountButton || !dropdownMenu) {
    return;
}

/**
 * Toggles the visibility of the dropdown menu
 * when the account button is clicked.
 * @param {MouseEvent} event
 */
accountButton.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    dropdownMenu.classList.toggle('show');
  });

/**
 * Closes the dropdown menu when clicking outside of it.
 */
window.onload = function() {
  var accountButton = document.querySelector('.account');
  var dropdownMenu = document.querySelector('.dropdown-menu');
    accountButton.outerHTML = accountButton.outerHTML;
    accountButton = document.querySelector('.account');
    accountButton.addEventListener('click', function(event) {
      event.stopPropagation();
      event.preventDefault();
        if (dropdownMenu.style.display === 'block') {
          dropdownMenu.style.display = 'none';
        } else {
          dropdownMenu.style.display = 'block';
    }
});

document.addEventListener('click', function() {
    dropdownMenu.style.display = 'none';
});
};
});