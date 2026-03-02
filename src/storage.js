// LocalStorage Wrapper for Tasks & Projects

const STORAGE_KEY = 'actask_data';

// Default data structure
const initialData = {
    user: { name: 'User', score: 85 },
    projects: [
        { id: 'p1', name: 'Personal', color: '#6366f1' },
        { id: 'p2', name: 'Work', color: '#10b981' }
    ],
    tasks: [
        { id: 't1', title: 'Welcome to Actask!', description: 'This is a progressive web app.', status: 'todo', projectId: 'p1', createdAt: Date.now() },
        { id: 't2', title: 'Try offline mode', description: 'Turn off your Wi-Fi and refresh.', status: 'in_progress', projectId: 'p1', createdAt: Date.now() - 10000 },
        { id: 't3', title: 'Explore Notion-like UI', description: 'A sleek dark mode UI.', status: 'done', projectId: 'p2', createdAt: Date.now() - 20000 }
    ]
};

export const Storage = {
    getData: () => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            Storage.saveData(initialData);
            return initialData;
        }
        return JSON.parse(raw);
    },

    saveData: (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    getTasks: () => Storage.getData().tasks,

    getProjects: () => Storage.getData().projects,

    addTask: (task) => {
        const data = Storage.getData();
        const newTask = {
            ...task,
            id: 't_' + Date.now(),
            createdAt: Date.now()
        };
        data.tasks.push(newTask);
        Storage.saveData(data);
        return newTask;
    },

    updateTask: (id, updates) => {
        const data = Storage.getData();

        if (!data.tasks) return;

        const index = data.tasks.findIndex(t => t.id === id);

        if (index > -1) {
            data.tasks[index] = { ...data.tasks[index], ...updates };
            Storage.saveData(data);
        }
    },

    deleteTask: (id) => {
        const data = Storage.getData();

        if (!data.tasks) return;

        data.tasks = data.tasks.filter(t => t.id !== id);
        Storage.saveData(data);
    },

    getStats: () => {
        const tasks = Storage.getTasks();
        const done = tasks.filter(t => t.status === 'done').length;
        const pending = tasks.length - done;
        return { total: tasks.length, done, pending };
    }
};
