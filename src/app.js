import { UI } from './ui.js';
import { Storage } from './storage.js';
import { Auth } from './auth.js';

let currentView = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {

    // 🔒 AUTH CHECK
    if (!Auth.isLoggedIn()) {
        showLoginScreen();
        return;
    }

    initNavigation();
    initMobileMenu();
    initDragAndDrop();

    document.getElementById('btnNewTask').addEventListener('click', () => {
        UI.openTaskModal();
    });

    // avatar logout click
    document.addEventListener("click", e => {
        if (e.target.id === "logoutBtn") {
            Auth.logout();
        }
    });

    loadView(currentView);
});

window.refreshCurrentView = () => loadView(currentView);

/* ================= LOGIN SCREEN ================= */

function showLoginScreen() {
    document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#111;color:white;font-family:sans-serif;">
            <div style="background:#1a1a1a;padding:30px;border-radius:12px;width:300px;box-shadow:0 0 20px rgba(0,0,0,0.5)">
                <h2 style="margin-bottom:15px;text-align:center;">Actask Login</h2>

                <input id="loginUser" placeholder="Username" style="width:100%;padding:10px;margin-bottom:10px;">
                <input id="loginPass" type="password" placeholder="Password" style="width:100%;padding:10px;margin-bottom:15px;">

                <button id="btnLogin" style="width:100%;padding:10px;background:#6366f1;color:white;border:none;border-radius:6px;">Login</button>
                <button id="btnRegister" style="width:100%;padding:10px;margin-top:10px;background:#333;color:white;border:none;border-radius:6px;">Register</button>
            </div>
        </div>
    `;

    document.getElementById("btnLogin").onclick = () => {
        const u = loginUser.value.trim();
        const p = loginPass.value.trim();

        if (!Auth.login(u, p))
            return alert("Login gagal");

        location.reload();
    };

    document.getElementById("btnRegister").onclick = () => {
        const u = loginUser.value.trim();
        const p = loginPass.value.trim();

        if (!u || !p)
            return alert("Isi username & password");

        const res = Auth.register(u, p);

        if (!res.ok)
            return alert(res.msg);

        alert("Akun dibuat. Silakan login.");
    };
}

/* ================= NAVIGATION ================= */

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

/* ================= VIEW LOADER ================= */

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

        const tasks = Storage.getTasks();

        contentView.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                ${tasks.map(t => UI.createTaskListItem(t)).join('')}
            </div>
        `;

    } else {
        contentView.innerHTML =
            `<div style="text-align:center;color:var(--text-muted);padding:var(--space-12);">Coming Soon</div>`;
    }
}