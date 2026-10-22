const API = {
    // Fetch all tasks (supports live search filtering)
    async getTasks(query = '') {
        const url = query ? `/api/tasks?search=${encodeURIComponent(query)}` : '/api/tasks';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return await response.json();
    },

    // Add a new task to SQLite
    async addTask(title) {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        if (!response.ok) throw new Error('Failed to add task');
        return await response.json();
    },

    // Update task completion status or title
    async updateTask(id, updates) {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update task');
        return await response.json();
    },

    // Delete a single task
    async deleteTask(id) {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete task');
        return await response.json();
    },

    // Delete all tasks
    async deleteAllTasks() {
        const response = await fetch('/api/tasks', {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete all tasks');
        return await response.json();
    }
};