let contacts = [];
let selectedContact = null;

async function loadContacts() {
    const fetchedContacts = await firebaseGet('/contacts');
    if (fetchedContacts) {
        contacts = Object.entries(fetchedContacts).map(([id, data]) => ({
            id,
            ...data
        }));
    } else {
        contacts = [];
    }
    displayContacts();
};

function displayContacts() {
    const sortedContacts = contacts.sort((a, b) => a.name.localeCompare(b.name));
    const groupedContacts = {};
    sortedContacts.forEach(contact => {
        const firstLetter = contact.name[0].toUpperCase();
        if (!groupedContacts[firstLetter]) {
            groupedContacts[firstLetter] = [];
        }
        groupedContacts[firstLetter].push(contact);
    });
    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = '';
    let html = '';
    Object.keys(groupedContacts).forEach(letter => {
        html += `<div class = "contact-group">`;
        html += `<div class = "group-letter">${letter}</div>`;
        groupedContacts[letter].forEach(contact => {
            html += `<div class="contact-item" onclick="selectContact('${contact.id}')">`;
            const initials = getInitials(contact.name);
            const avatarClass = getAvatarClass(contact.name);
            html += `<div class="avatar-contact-circle ${avatarClass}">${initials}</div>`;
            html += `<div class="contact-info">`;
            html += `<div class="contact-name">${contact.name}</div>`;
            html += `<div class="contact-email">${contact.email}</div>`;
            html += `</div>`;
            html += `</div>`;
        });
        html += `</div>`;
    });
    contactsList.innerHTML = html;
};

function selectContact(id) {
    const allItems = document.querySelectorAll('.contact-item');
    allItems.forEach(item => item.classList.remove('selected'));
    const clickedItem = event.target.closest('.contact-item');
    if (clickedItem) {
        clickedItem.classList.add('selected');
    }
    selectedContact = contacts.find(contact => contact.id === id);
    displayContactDetails();
};

function displayContactDetails() {

    if (!selectedContact)
        return;
    const contactDetailsContent = document.getElementById('contactDetailsContent');
    const initials = getInitials(selectedContact.name);
    const avatarClass = getAvatarClass(selectedContact.name);
    contactDetailsContent.innerHTML = '';
    let html = '';
    html += `<div class="contact-details-content">`;
    html += `<div class="contact-details-content-header">`;
    html += `<div class="contact-avatar-large">`;
    html += `<div class="avatar-circle ${avatarClass}">${initials}</div>`;
    html += `</div>`;
    html += `<div class="contact-info-section">`;
    html += `<h2 class="contact-name-large">${selectedContact.name}</h2>`;
    html += `<div class="contact-actions">`;
    html += `<button class="edit-contact-btn" onclick="editContact('${selectedContact.id}')"><img src="../img/edit-contacts.png" alt="edit" class="edit-icon"></button>`;
    html += `<button class="delete-contact-btn" onclick="deleteContact('${selectedContact.id}')"><img src="../img/delete-contacts.png" alt="edit" class="delete-icon"></button>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
    html += `<div class="contact-information-text">`;
    html += `<h3>Contact Information</h3>`;
    html += `</div>`;
    html += `<div class="contact-information-details">`;
    html += `<div class="contact-detail-email"><h4>Email</h4><span>${selectedContact.email}</span></div>`;
    html += `<div class="contact-detail-phone"><h4>Phone</h4><span>${selectedContact.phone}</span></div>`;
    html += `</div>`;
    html += `</div>`;
    contactDetailsContent.innerHTML = html;

};

function openAddContactModal() {
    document.getElementById('addContactModal').style.display = 'block';

};

function closeContactModal() {
    document.getElementById('addContactModal').style.display = 'none';
    document.getElementById('contactModal').style.display = 'none';
};

function cancelAddContact() {
    document.getElementById('addContactModal').style.display = 'none';
}

function editContact(contactId) {
    selectedContact = contacts.find(c => c.id === contactId);
    document.getElementById('contactModal').style.display = 'block';
    document.getElementById('editContactName').value = selectedContact.name;
    document.getElementById('editContactEmail').value = selectedContact.email;
    document.getElementById('editContactPhone').value = selectedContact.phone;
    const modalAvatar = document.getElementById('ModalAvatar');
    const initials = getInitials(selectedContact.name);
    const avatarClass = getAvatarClass(selectedContact.name);
    modalAvatar.innerHTML = `<div class="avatar-circle ${avatarClass}">${initials}</div>`;
}


async function deleteContact(contactId) {
    await firebaseDelete(`/contacts/${contactId}`);
    selectedContact = null;
    document.getElementById('contactDetailsContent').innerHTML = '';
    loadContacts();
    closeContactModal();
}

async function editDeleteContact() {
   await deleteContact(selectedContact.id);
    loadContacts();
    closeContactModal();
}

async function saveContact() {
        const name = document.getElementById('editContactName').value.trim();
        const email = document.getElementById('editContactEmail').value.trim();
        const phone = document.getElementById('editContactPhone').value.trim();
        if (!name || !email || !phone) {
            alert('Bitte alle Felder ausfüllen');
            return;
        }
        const updatedContact = {
            name: name,
            email: email,
            phone: phone
        };
        await firebasePut(`/contacts/${selectedContact.id}`, updatedContact);
        selectedContact.name = name;
        selectedContact.email = email;
        selectedContact.phone = phone;
        loadContacts();
        displayContactDetails();
        closeContactModal();
    }


async function createAddContact() {
    const name = document.getElementById('addInputName').value.trim();
    const email = document.getElementById('addInputEmail').value.trim();
    const phone = document.getElementById('addInputPhone').value.trim();
    if (!name || !email || !phone) {
        alert('Bitte alle Felder ausfüllen');
        return;
    }
    const contact = {
        name: name,
        email: email,
        phone: phone
    };
    await firebasePost('/contacts', contact);
    loadContacts();
    closeContactModal();
    document.getElementById('addInputName').value = '';
    document.getElementById('addInputEmail').value = '';
    document.getElementById('addInputPhone').value = '';
}

