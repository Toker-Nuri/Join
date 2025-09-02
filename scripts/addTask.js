function renderTemplate(templateId, containerId) {
    const template = document.getElementById(templateId);
    const container = document.getElementById(containerId);
    if (!template || !container) return;

    container.innerHTML = '';
    container.appendChild(template.content.cloneNode(true));
}

function onAddTaskMenuClick(menu) {
    menu.preventDefault();
    renderTemplate('addtask-template', 'addtask-container');
}

function loadingAddTask() {
    document.addEventListener('DOMContentLoaded', () => {
        const menuItem = document.getElementById('task-menu');
        if (!menuItem) {
            console.error('#task-menu nicht gefunden');
            return;
        }
        menuItem.addEventListener('click', onAddTaskMenuClick);
    });
}

loadingAddTask();
