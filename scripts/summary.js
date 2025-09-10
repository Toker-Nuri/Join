(function () {
    'use strict';

    const SUMMARY_CONFIG = {
        storageKey: 'taskData',
        dateLocale: 'en-US',
        pollIntervalMs: 1000,
        selectors: {
            countContainer: '.js-count-container',
            countLabel: '.counter-text-design',
            countValue: '.value',
            urgentValue: '.js-urgent-container .value',
            deadlineDate: '.js-deadline-date',
            userName: '.js-user-name'
        },
        labelTextToCounterKey: {
            'to do': 'todo',
            'done': 'done',
            'tasks in board': 'total',
            'tasks in progress': 'inProgress',
            'awaiting feedback': 'awaitFeedback'
        }
    };

    function parseJSONSafe(text) {
        try { return JSON.parse(text); } catch { return null; }
    }

    function fetchTasksFromStorage() {
        const rawJSON = localStorage.getItem(SUMMARY_CONFIG.storageKey);
        if (!rawJSON) return [];
        const storedObject = parseJSONSafe(rawJSON) || {};
        return Object.entries(storedObject).map(([taskId, taskData]) => ({ id: taskId, ...taskData }));
    }

    function derivePriority(value) {
        if (!value) return 'medium';
        const lower = String(value).toLowerCase();
        if (lower.includes('urgent')) return 'urgent';
        if (lower.includes('low')) return 'low';
        return 'medium';
    }

    function computeStatusCounts(tasks) {
        const statusCounts = { total: 0, todo: 0, inProgress: 0, awaitFeedback: 0, done: 0, urgent: 0 };
        for (const task of tasks) {
            statusCounts.total++;
            const columnId = String(task.column || '');
            if (columnId === 'toDoColumn') statusCounts.todo++;
            else if (columnId === 'inProgress') statusCounts.inProgress++;
            else if (columnId === 'awaitFeedback') statusCounts.awaitFeedback++;
            else if (columnId === 'done') statusCounts.done++;
            if (derivePriority(task.priority) === 'urgent') statusCounts.urgent++;
        }
        return statusCounts;
    }

    function parseDueDate(value) {
        if (!value) return null;
        const text = String(value).trim();
        let matches = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (matches) return new Date(+matches[1], +matches[2] - 1, +matches[3]);
        matches = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (matches) return new Date(+matches[3], +matches[2] - 1, +matches[1]);
        matches = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (matches) return new Date(+matches[3], +matches[2] - 1, +matches[1]);
        const parsed = new Date(text);
        return isNaN(parsed) ? null : parsed;
    }

    function findNextUpcomingDueDate(tasks) {
        const midnightToday = new Date();
        midnightToday.setHours(0, 0, 0, 0);
        const dueDates = tasks
            .map(task => parseDueDate(task.dueDate))
            .filter(date => date && date >= midnightToday)
            .sort((a, b) => a - b);
        return dueDates[0] || null;
    }

    function formatDateLong(date) {
        return date
            ? date.toLocaleDateString(SUMMARY_CONFIG.dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })
            : '—';
    }

    function normalizeSummaryLabel(text) {
        return String(text)
            .toLowerCase()
            .replace(/[-_]+/g, ' ')
            .replace(/[^\w ]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function renderStatusCounters(statusCounts) {
        document.querySelectorAll(SUMMARY_CONFIG.selectors.countContainer).forEach(container => {
            const labelElement = container.querySelector(SUMMARY_CONFIG.selectors.countLabel);
            const valueElement = container.querySelector(SUMMARY_CONFIG.selectors.countValue);
            if (!labelElement || !valueElement) return;
            const counterKey = SUMMARY_CONFIG.labelTextToCounterKey[normalizeSummaryLabel(labelElement.textContent)];
            if (counterKey) valueElement.textContent = statusCounts[counterKey];
        });
    }

    function renderUrgentCount(statusCounts) {
        const element = document.querySelector(SUMMARY_CONFIG.selectors.urgentValue);
        if (element) element.textContent = statusCounts.urgent;
    }

    function renderUpcomingDeadline(tasks) {
        const element = document.querySelector(SUMMARY_CONFIG.selectors.deadlineDate);
        if (element) element.textContent = formatDateLong(findNextUpcomingDueDate(tasks));
    }

    function renderUserNameFromStorage() {
        const element = document.querySelector(SUMMARY_CONFIG.selectors.userName);
        if (!element) return;
        const firstName = localStorage.getItem('firstName') || '';
        const lastName = localStorage.getItem('lastName') || '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) element.textContent = fullName;
    }

    function renderSummary(tasks) {
        const statusCounts = computeStatusCounts(tasks);
        renderStatusCounters(statusCounts);
        renderUrgentCount(statusCounts);
        renderUpcomingDeadline(tasks);
        renderUserNameFromStorage();
    }

    function updateSummaryFromStorage() {
        renderSummary(fetchTasksFromStorage());
    }

    window.addEventListener('storage', event => {
        if (event.key === SUMMARY_CONFIG.storageKey) updateSummaryFromStorage();
    });

    setInterval(updateSummaryFromStorage, SUMMARY_CONFIG.pollIntervalMs);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateSummaryFromStorage);
    } else {
        updateSummaryFromStorage();
    }
})();
