function renderTemplate(templateId, containerId) {
    const template = document.getElementById(templateId);
    const container = document.getElementById(containerId);
    if (!template || !container) return;

    container.innerHTML = '';
    container.appendChild(template.content.cloneNode(true));

    const closeBtn = container.querySelector('#close-addtask-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => { container.innerHTML = ''; });
    }
}

function onAddTaskMenuClick(menu) {
    menu.preventDefault();
    renderTemplate('addtask-template', 'addtask-container');
}

function loadingAddTask() {
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('addtask-container');
        if (!container) return; // Nur auf add_task.html aktiv
        const menuItems = document.querySelectorAll('#task-menu');
        menuItems.forEach(menuItem => {
            menuItem.addEventListener('click', onAddTaskMenuClick);
        });
    });
}

loadingAddTask();
