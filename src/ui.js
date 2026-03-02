import { Storage } from './storage.js';

export const UI = {
    renderDashboard: (container) => {
        const stats = Storage.getStats();
        const recentTasks = Storage.getTasks().sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

        container.innerHTML = `
            <div class="hello-widget" style="background: var(--bg-surface); padding: var(--space-6); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); margin-bottom: var(--space-6);">
                <h2 style="font-size: var(--font-size-xl); margin-bottom: var(--space-2);">Welcome back! 👋</h2>
                <p style="color: var(--text-secondary);">Here's an overview of your productivity today.</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
                <div class="stat-card">
                    <h3>Completed Tasks</h3>
                    <div class="val success">${stats.done}</div>
                </div>
                <div class="stat-card">
                    <h3>Pending</h3>
                    <div class="val warning">${stats.pending}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Projects</h3>
                    <div class="val primary">${Storage.getProjects().length}</div>
                </div>
            </div>

            <h3 style="margin-bottom: var(--space-4);">Recent Tasks</h3>
            <div class="task-list">
                ${recentTasks.map(t => UI.createTaskListItem(t)).join('')}
            </div>
        `;
    },

    renderKanban: (container) => {
        const tasks = Storage.getTasks();
        const today = new Date().toISOString().split('T')[0];

        // LOGIKA OTOMATIS: Deteksi task yang lewat deadline dan belum 'done'
        const isOverdue = (t) => (t.status !== 'done') && ((t.deadline && t.deadline < today) || t.status === 'overdue');

        const cols = [
            { id: 'todo', title: 'To Do', filter: t => t.status === 'todo' && !isOverdue(t) },
            { id: 'in_progress', title: 'In Progress', filter: t => t.status === 'in_progress' && !isOverdue(t) },
            { id: 'overdue', title: 'Past Deadline', filter: t => isOverdue(t) },
            { id: 'done', title: 'Done', filter: t => t.status === 'done' }
        ];

        container.innerHTML = `
            <div class="kanban-board" style="display: flex; gap: var(--space-4); height: 100%; overflow-x: auto; padding-bottom: var(--space-4);">
                ${cols.map(col => {
                    const colTasks = tasks.filter(col.filter);
                    return `
                    <div class="kanban-col" data-status="${col.id}" style="flex: 0 0 320px; background: var(--bg-surface); border-radius: var(--radius-md); padding: var(--space-3); display: flex; flex-direction: column;">
                        <h4 style="margin-bottom: var(--space-4); padding: 0 var(--space-2); display: flex; justify-content: space-between; color: ${col.id === 'overdue' ? 'var(--color-danger)' : 'inherit'};">
                            ${col.title} <span style="color: var(--text-muted);">${colTasks.length}</span>
                        </h4>
                        <div class="kanban-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-3);">
                            ${colTasks.map(t => UI.createTaskCard(t)).join('')}
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    createTaskListItem: (task) => {
        const today = new Date().toISOString().split('T')[0];
        const isOverdue = (task.status !== 'done') && ((task.deadline && task.deadline < today) || task.status === 'overdue');
        const displayStatus = isOverdue ? 'Overdue' : task.status.replace('_', ' ');
        const badgeColor = isOverdue ? 'background: var(--color-danger); color: white;' : 'background: var(--bg-surface-active); color: var(--text-primary);';

        return `
        <div class="task-item" style="background: var(--bg-surface); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: var(--space-2); display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: transform var(--transition-fast);" onclick="window.editTask('${task.id}')">
            <div>
                <div style="font-weight: 500;">${task.title}</div>
                <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${task.description || 'No description'}</div>
                ${task.deadline ? `<div style="font-size: var(--font-size-xs); color: ${isOverdue ? 'var(--color-danger)' : 'var(--text-muted)'}; margin-top: 4px; font-weight: 600;">Deadline: ${task.deadline}</div>` : ''}
            </div>
            <span class="badge" style="font-size: var(--font-size-xs); padding: 2px 8px; border-radius: var(--radius-full); ${badgeColor} text-transform: capitalize;">${displayStatus}</span>
        </div>
        `;
    },

    createTaskCard: (task) => {
        const today = new Date().toISOString().split('T')[0];
        const isOverdue = (task.status !== 'done') && ((task.deadline && task.deadline < today) || task.status === 'overdue');
        const borderColor = isOverdue ? 'var(--color-danger)' : 'var(--border-strong)';

        return `
        <div class="task-card" draggable="true" ondragstart="window.dragStart(event, '${task.id}')" onclick="window.editTask('${task.id}')" style="background: var(--bg-base); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid ${borderColor}; cursor: grab;">
            <div style="font-weight: 500; margin-bottom: var(--space-1);">${task.title}</div>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: var(--space-2);">${task.description || ''}</div>
            ${task.deadline ? `<div style="font-size: var(--font-size-xs); color: ${isOverdue ? 'var(--color-danger)' : 'var(--text-muted)'}; font-weight: 600; margin-top: var(--space-2);">Deadline: ${task.deadline}</div>` : ''}
        </div>
        `;
    },

    openTaskModal: (taskId = null) => {
        let task = taskId ? Storage.getTasks().find(t => t.id === taskId) : { title: '', description: '', status: 'todo', deadline: '' };

        const overlay = document.getElementById('modalOverlay');
        overlay.innerHTML = `
            <div class="modal-content" style="background: var(--bg-surface); width: 90%; max-width: 500px; margin: 10vh auto; border-radius: var(--radius-lg); padding: var(--space-6); box-shadow: var(--shadow-lg); border: 1px solid var(--border-strong);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
                    <h2 style="font-size: var(--font-size-lg);">${taskId ? 'Edit Task' : 'New Task'}</h2>
                    <button class="btn-icon" onclick="document.getElementById('modalOverlay').style.display='none'" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem;">&times;</button>
                </div>
                <input type="text" id="taskTitle" value="${task.title}" placeholder="Task Title" style="width: 100%; padding: var(--space-3); margin-bottom: var(--space-4); background: var(--bg-base); border: 1px solid var(--border-subtle); color: var(--text-primary); border-radius: var(--radius-md); font-size: var(--font-size-base); outline: none;" autofocus>
                
                <textarea id="taskDesc" placeholder="Description..." style="width: 100%; padding: var(--space-3); margin-bottom: var(--space-4); background: var(--bg-base); border: 1px solid var(--border-subtle); color: var(--text-primary); border-radius: var(--radius-md); min-height: 100px; resize: vertical; font-family: var(--font-family-body); outline: none;">${task.description}</textarea>
                
                <label for="taskDeadline" style="display:block; margin-bottom: 4px; font-size: var(--font-size-sm); color: var(--text-secondary);">Deadline</label>
                <input type="date" id="taskDeadline" value="${task.deadline || ''}" style="width: 100%; padding: var(--space-3); margin-bottom: var(--space-4); background: var(--bg-base); border: 1px solid var(--border-subtle); color: var(--text-primary); border-radius: var(--radius-md); outline: none;" title="Task Deadline">
                
                <label for="taskStatus" style="display:block; margin-bottom: 4px; font-size: var(--font-size-sm); color: var(--text-secondary);">Status</label>
                <select id="taskStatus" style="width: 100%; padding: var(--space-3); margin-bottom: var(--space-6); background: var(--bg-base); border: 1px solid var(--border-subtle); color: var(--text-primary); border-radius: var(--radius-md); outline: none;">
                    <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
                    <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                    <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
                </select>

                <div style="display: flex; justify-content: flex-end; gap: var(--space-3);">
                    ${taskId ? `<button class="btn" style="background: var(--color-danger); color: white;" onclick="window.deleteTask('${taskId}')">Delete</button>` : ''}
                    <button class="btn" onclick="document.getElementById('modalOverlay').style.display='none'">Cancel</button>
                    <button class="btn btn-primary" onclick="window.saveTask('${taskId || ''}')">Save</button>
                </div>
            </div>
        `;
        overlay.style.display = 'block';
    }
};

// Global handlers
window.editTask = UI.openTaskModal;
window.saveTask = (id) => {
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) return alert('Title is required');

    const updates = {
        title,
        description: document.getElementById('taskDesc').value.trim(),
        status: document.getElementById('taskStatus').value,
        deadline: document.getElementById('taskDeadline').value
    };

    if (id) {
        Storage.updateTask(id, updates);
    } else {
        Storage.addTask({ ...updates, projectId: 'p1' });
    }

    document.getElementById('modalOverlay').style.display = 'none';
    window.refreshCurrentView();
};

window.deleteTask = (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
        Storage.deleteTask(id);
        document.getElementById('modalOverlay').style.display = 'none';
        window.refreshCurrentView();
    }
};

window.dragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
};