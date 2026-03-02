import { UI } from './ui.js';
import { Storage } from './storage.js';

let currentView = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileMenu();
    initDragAndDrop();

    // Global bind for the new task button
    document.getElementById('btnNewTask').addEventListener('click', () => {
        UI.openTaskModal();
    });

    loadView(currentView);
});

window.refreshCurrentView = () => loadView(currentView);

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');

            currentView = e.currentTarget.getAttribute('data-view');
            loadView(currentView);

            const sidebar = document.querySelector('.sidebar');
            if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });
}

function initMobileMenu() {
    const menuToggle = document.getElementById('btnMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

function initDragAndDrop() {
    const contentView = document.getElementById('contentView');

    // Delegation for dynamic kanban columns
    contentView.addEventListener('dragover', (e) => {
        if (e.target.closest('.kanban-col')) {
            e.preventDefault();
            e.target.closest('.kanban-col').style.background = 'var(--bg-surface-active)';
        }
    });

    contentView.addEventListener('dragleave', (e) => {
        if (e.target.closest('.kanban-col')) {
            e.target.closest('.kanban-col').style.background = 'var(--bg-surface)';
        }
    });

    contentView.addEventListener('drop', (e) => {
        const col = e.target.closest('.kanban-col');
        if (col) {
            e.preventDefault();
            col.style.background = 'var(--bg-surface)';
            const taskId = e.dataTransfer.getData('text/plain');
            const newStatus = col.getAttribute('data-status');

            if (taskId && newStatus) {
                Storage.updateTask(taskId, { status: newStatus });
                refreshCurrentView();
            }
        }
    });
}

function loadView(viewName) {
    const contentView = document.getElementById('contentView');
    const pageTitle = document.getElementById('pageTitle');

    const titles = {
        'dashboard': 'Dashboard',
        'projects': 'Projects Board',
        'tasks': 'My Tasks'
    };
    pageTitle.textContent = titles[viewName] || 'Actask';

    if (viewName === 'dashboard') {
        UI.renderDashboard(contentView);
    } else if (viewName === 'projects') {
        UI.renderKanban(contentView);
    } else if (viewName === 'tasks') {
        // Simple list view for 'My Tasks'
        const tasks = Storage.getTasks();
        contentView.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                ${tasks.map(t => UI.createTaskListItem(t)).join('')}
            </div>
        `;
    } else {
        contentView.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: var(--space-12);">Coming Soon</div>`;
    }
}
