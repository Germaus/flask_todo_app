document.addEventListener('DOMContentLoaded', () => {
    const tasksContainer = document.getElementById('tasks-container');
    const searchInput = document.getElementById('search-input');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const refreshBtn = document.getElementById('refresh-btn');

    // Fetch and display tasks in the DOM
    async function loadTasks(searchQuery = '') {
        try {
            const tasks = await API.getTasks(searchQuery);
            tasksContainer.innerHTML = '';

            if (tasks.length === 0) {
                tasksContainer.innerHTML = `<p style="text-align: center; color: gray; padding: 15px;">No tasks found.</p>`;
                return;
            }

            tasks.forEach(task => {
                const taskEl = document.createElement('div');
                taskEl.className = 'task-item';

                taskEl.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="task-title ${task.completed ? 'done' : ''}">${escapeHtml(task.title)}</span>
                    <button class="task-delete" data-id="${task.id}">✕</button>
                `;

                tasksContainer.appendChild(taskEl);
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    // Function to add a task
    async function handleAddTask() {
        const title = newTaskInput.value.trim();
        if (!title) return;

        try {
            await API.addTask(title);
            newTaskInput.value = '';
            loadTasks(searchInput.value.trim());
        } catch (err) {
            console.error('Failed to add task:', err);
        }
    }

    // Add task on button click
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', handleAddTask);
    }

    // Add task on pressing Enter in input field
    if (newTaskInput) {
        newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAddTask();
            }
        });
    }

    // Toggle completion status (checkbox)
    tasksContainer.addEventListener('change', async (e) => {
        if (e.target.classList.contains('task-checkbox')) {
            const id = e.target.dataset.id;
            const completed = e.target.checked;
            try {
                await API.updateTask(id, { completed });
                loadTasks(searchInput.value.trim());
            } catch (err) {
                console.error('Failed to update status:', err);
            }
        }
    });

    // Delete single task click handler
    tasksContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('task-delete')) {
            const id = e.target.dataset.id;
            try {
                await API.deleteTask(id);
                loadTasks(searchInput.value.trim());
            } catch (err) {
                console.error('Failed to delete task:', err);
            }
        }
    });

    // Delete all tasks
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete all tasks?')) {
                try {
                    await API.deleteAllTasks();
                    loadTasks();
                } catch (err) {
                    console.error('Failed to delete all tasks:', err);
                }
            }
        });
    }

    // Live search input filtering
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            loadTasks(e.target.value.trim());
        });
    }

    // Refresh button click handler
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadTasks(searchInput.value.trim());
        });
    }

    // Helper function to escape HTML string to prevent XSS attacks
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initial load on page start
    loadTasks();
});