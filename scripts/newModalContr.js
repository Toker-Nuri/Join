/**
 * Loads contacts from Firebase and populates the assignee dropdown.
 * @param {Array} [assignedUsers=[]] - Array of already assigned users.
 */
async function loadContacts(assignedUsers = []) {
  try {
    const response = await fetch('https://join-360-1d879-default-rtdb.europe-west1.firebasedatabase.app/contacts.json');
    const contacts = await response.json();
    populateAssigneeDropdown(contacts, assignedUsers);
  } catch (error) {
    // Fehlerbehandlung
  }
}

/**
 * Populates the assignee dropdown with contacts.
 * @param {Object} contacts - Das Kontakte-Objekt aus Firebase.
 * @param {Array} assignedUsers - Array bereits zugewiesener Benutzer.
 */
function populateAssigneeDropdown(contacts, assignedUsers) {
  const dropdownSelected = document.getElementById('assigneeDropdownSelected');
  const dropdownList = document.getElementById('assigneeDropdownList');
  const badgesContainer = document.getElementById('assigneeBadges');
  dropdownList.innerHTML = "";
  const assignedUserNames = new Set(
    assignedUsers.map(u => u.name.trim().toLowerCase())
  );
  const selectedContacts = new Set();
  Object.entries(contacts).forEach(([id, contact]) => {
    processContactEntry(id, contact, selectedContacts, assignedUserNames, badgesContainer, dropdownList);
  });
  setupDropdownToggle(dropdownSelected, dropdownList);
}

/**
 * Verarbeitet einen einzelnen Kontakt und fügt den entsprechenden Dropdown-Eintrag hinzu.
 * @param {string} id - Die Kontakt-ID.
 * @param {Object} contact - Das Kontakt-Objekt.
 * @param {Set} selectedContacts - Set der bereits ausgewählten Kontakt-IDs.
 * @param {Set} assignedUserNames - Set der Namen bereits zugewiesener Benutzer.
 * @param {HTMLElement} badgesContainer - Container für die Badges.
 * @param {HTMLElement} dropdownList - Das Dropdown-Element.
 */
function processContactEntry(id, contact, selectedContacts, assignedUserNames, badgesContainer, dropdownList) {
  const item = createDropdownItem(id, contact, selectedContacts, badgesContainer);
  dropdownList.appendChild(item);
  const contactName = contact.name.trim().toLowerCase();
  if (assignedUserNames.has(contactName)) {
    selectedContacts.add(id);
    item.classList.add('selected');
    const checkbox = item.querySelector('.custom-checkbox');
    checkbox.src = "../img/checkboxchecked.png";
    checkbox.style.filter = "brightness(0) invert(1)";
    createContactBadge(contact, id, badgesContainer, selectedContacts);
  }
}

/**
 * Richtet die Event-Listener ein, die das Dropdown umschalten.
 * @param {HTMLElement} dropdownSelected - Das Element, das den aktuell ausgewählten Kontakt anzeigt.
 * @param {HTMLElement} dropdownList - Das Dropdown-Listelement.
 */
function setupDropdownToggle(dropdownSelected, dropdownList) {
  dropdownSelected.addEventListener('click', event => {
    event.stopPropagation();
    dropdownList.style.display = dropdownList.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', event => {
    if (!dropdownList.contains(event.target) && !dropdownSelected.contains(event.target)) {
      dropdownList.style.display = 'none';
    }
  });
}

/**
 * Wandelt einen Farbwert in einen einfachen Farbnamen um.
 * @param {string} colorValue - Der Farbwert (Hex oder Name).
 * @returns {string} - Der einfache Farbname.
 */
function getSimpleColor(colorValue) {
  if (colorValue.startsWith('#')) {
    switch (colorValue.toUpperCase()) {
      case '#F57C00': return 'orange';
      case '#E74C3C': return 'red';
      case '#5C6BC0': return 'blue';
      case '#4CAF50': return 'green';
      case '#8E44AD': return 'purple';
      case '#EE00FF': return 'pink';
      default: return 'default';
    }
  }
  return colorValue;
}

/**
 * Creates a dropdown item for a contact.
 * @param {string} id - The contact ID.
 * @param {Object} contact - The contact object.
 * @param {Set} selectedContacts - Set of selected contact IDs.
 * @param {HTMLElement} badgesContainer - Container for the badges.
 * @returns {HTMLElement} - The dropdown item element.
 */
function createDropdownItem(id, contact, selectedContacts, badgesContainer) {
  const item = createDropdownItemContainer();
  item.innerHTML = generateDropdownItemHTML(contact);
  attachDropdownClickEvent(item, id, contact, selectedContacts, badgesContainer);
  return item;
}

/**
 * Creates the container element for the dropdown item.
 * @returns {HTMLElement} - The dropdown item container.
 */
function createDropdownItemContainer() {
  const item = document.createElement("div");
  item.classList.add("dropdown-item");
  return item;
}

/**
 * Generates the inner HTML for the dropdown item.
 * @param {Object} contact - The contact object.
 * @returns {string} - The HTML string for the dropdown item.
 */
function generateDropdownItemHTML(contact) {
  const initials = getInitials(contact.name);
  const colorValue = contact.color || "default";
  return `
    <div class="contact-info">
      <span class="initials-circle" style="background-color: ${colorValue};">
        ${initials}
      </span>
      <span class="contact-name">${contact.name}</span>
    </div>
    <img src="../img/chekbox.png" alt="checkbox" class="custom-checkbox">`;
}

/**
 * Attaches a click event to the dropdown item that handles selection.
 * @param {HTMLElement} item - The dropdown item element.
 * @param {string} id - The contact ID.
 * @param {Object} contact - The contact object.
 * @param {Set} selectedContacts - Set of selected contact IDs.
 * @param {HTMLElement} badgesContainer - Container for the badges.
 */
function attachDropdownClickEvent(item, id, contact, selectedContacts, badgesContainer) {
  item.addEventListener("click", event => {
    event.stopPropagation();
    handleDropdownSelection(item, id, contact, selectedContacts, badgesContainer);
  });
}


/**
 * Handles the selection of a dropdown item.
 * @param {HTMLElement} item - The dropdown item element.
 * @param {string} id - The contact ID.
 * @param {Object} contact - The contact object.
 * @param {Set} selectedContacts - Set of selected contact IDs.
 * @param {HTMLElement} badgesContainer - Container for the badges.
 */
function handleDropdownSelection(item, id, contact, selectedContacts, badgesContainer) {
  const checkbox = item.querySelector('.custom-checkbox');
  if (!selectedContacts.has(id)) {
    addDropdownSelection(item, id, contact, selectedContacts, badgesContainer, checkbox);
  } else {
    removeDropdownSelection(item, id, selectedContacts, badgesContainer, checkbox);
  }
}

/**
 * Adds a dropdown item selection.
 * @param {HTMLElement} item - The dropdown item element.
 * @param {string} id - The contact ID.
 * @param {Object} contact - The contact object.
 * @param {Set} selectedContacts - Set of selected contact IDs.
 * @param {HTMLElement} badgesContainer - Container for the badges.
 * @param {HTMLElement} checkbox - The checkbox element within the item.
 */
function addDropdownSelection(item, id, contact, selectedContacts, badgesContainer, checkbox) {
  selectedContacts.add(id);
  item.classList.add('selected');
  checkbox.src = "../img/checkboxchecked.png";
  checkbox.style.filter = "brightness(0) invert(1)";
  createContactBadge(contact, id, badgesContainer, selectedContacts);
}

/**
 * Removes a dropdown item selection.
 * @param {HTMLElement} item - The dropdown item element.
 * @param {string} id - The contact ID.
 * @param {Set} selectedContacts - Set of selected contact IDs.
 * @param {HTMLElement} badgesContainer - Container for the badges.
 * @param {HTMLElement} checkbox - The checkbox element within the item.
 */
function removeDropdownSelection(item, id, selectedContacts, badgesContainer, checkbox) {
  selectedContacts.delete(id);
  item.classList.remove('selected');
  checkbox.src = "../img/chekbox.png";
  checkbox.style.filter = "";
  const badge = badgesContainer.querySelector(`[data-contact-id="${id}"]`);
  if (badge) {
    badge.remove();
  }
}


/**
 * Erstellt ein Badge-Element mit der entsprechenden Klasse.
 * @param {string} badgeClass - Die CSS-Klasse des Badges.
 * @returns {HTMLElement} - Das erstellte Badge-Element.
 */
function buildBadgeElement(badgeClass) {
  const badge = document.createElement('div');
  badge.className = `assignee-badge ${badgeClass}`;
  return badge;
}

/**
 * Setzt die Datenattribute und den Text für ein Badge.
 * @param {HTMLElement} badge - Das Badge-Element.
 * @param {Object} contact - Das Kontakt-Objekt.
 * @param {string} id - Die Kontakt-ID.
 */
function setBadgeData(badge, contact, id) {
  badge.dataset.contactId = id;
  badge.dataset.contactName = contact.name;
  badge.dataset.contactColor = getSimpleColor(contact.color || "default");
  badge.textContent = getInitials(contact.name);
}

/**
 * Fügt dem Badge einen Klick-Listener hinzu, der das Badge entfernt.
 * @param {HTMLElement} badge - Das Badge-Element.
 * @param {Set} selectedContacts - Set der ausgewählten Kontakt-IDs.
 * @param {string} id - Die Kontakt-ID.
 */
function attachBadgeClickListener(badge, selectedContacts, id) {
  badge.addEventListener('click', () => {
    badge.remove();
    selectedContacts.delete(id);
  });
}

/**
 * Erstellt ein Kontakt-Badge und fügt es dem Container hinzu.
 * @param {Object} contact - Das Kontakt-Objekt.
 * @param {string} id - Die Kontakt-ID.
 * @param {HTMLElement} container - Der Container für das Badge.
 * @param {Set} selectedContacts - Set der ausgewählten Kontakt-IDs.
 */
function createContactBadge(contact, id, container, selectedContacts) {
  const simpleColor = getSimpleColor(contact.color || "default");
  const badgeClass = getBadgeClassFromAnyColor(simpleColor);
  if (container.querySelector(`[data-contact-id="${id}"]`)) return;
  const badge = buildBadgeElement(badgeClass);
  setBadgeData(badge, contact, id);
  attachBadgeClickListener(badge, selectedContacts, id);
  container.appendChild(badge);
}

/**
 * Reads the assignees from the badges.
 * @returns {Array<Object>} Array of user objects with name and color.
 */
function readAssigneesFromBadges() {
  const badges = document.querySelectorAll('#assigneeBadges .assignee-badge');
  const users = [];
  badges.forEach(badge => {
    users.push({
      name: badge.dataset.contactName || badge.textContent.trim(),
      color: badge.dataset.contactColor || "default"
    });
  });
  return users;
}

/**
 * Returns the currently selected priority.
 * @returns {string} - The selected priority.
 */
function getSelectedPriority() {
  if (document.querySelector('.edit-priority-urgent.active')) return 'urgent';
  if (document.querySelector('.edit-priority-medium.active')) return 'medium';
  if (document.querySelector('.edit-priority-low.active')) return 'low';
  return 'medium';
}

/**
 * Returns the priority image path based on the given priority.
 * @param {string} priority - The priority level.
 * @returns {string} - The image path for the priority.
 */
function getPriorityPath(priority) {
  switch (priority) {
    case 'urgent': return '../img/priority-img/urgent.png';
    case 'medium': return '../img/priority-img/medium.png';
    case 'low':    return '../img/priority-img/low.png';
    default:       return '../img/priority-img/medium.png';
  }
}

/**
 * Reads subtasks from the edit modal.
 * @returns {Array<Object>} Array of subtasks.
 */
function readSubtasksFromEditModal() {
  const subtaskItems = document.querySelectorAll('#editSubtasksList .subtask-item');
  const subtasks = [];
  subtaskItems.forEach(item => {
    const checkbox = item.querySelector('.subtask-edit-checkbox');
    const span = item.querySelector('span');
    if (span) {
      subtasks.push({
        text: span.innerText.replace('• ', '').trim(),
        completed: checkbox ? checkbox.checked : false
      });
    }
  });
  return subtasks;
}


