const SESSION_KEY = "actask_session";

export const Auth = {
    login: (username, password) => {
        const data = JSON.parse(localStorage.getItem("actask_users")) || [];

        const user = data.find(u => u.username === username && u.password === password);
        if (!user) return false;

        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return true;
    },

    logout: () => {
        localStorage.removeItem("actask_session");
        location.reload();
    },

    getUser: () => {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    },

    isLoggedIn: () => {
        return !!localStorage.getItem(SESSION_KEY);
    },

    register: (username, password) => {
        const users = JSON.parse(localStorage.getItem("actask_users")) || [];

        if (users.some(u => u.username === username))
            return { ok: false, msg: "Username sudah ada" };

        users.push({ username, password });
        localStorage.setItem("actask_users", JSON.stringify(users));
        return { ok: true };
    }
};