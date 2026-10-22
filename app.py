import sqlite3
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Initialize SQLite Database & Table
def init_db():
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

# Run database setup on start
init_db()

# Helper function to connect to SQLite database
def get_db_connection():
    conn = sqlite3.connect('tasks.db')
    conn.row_factory = sqlite3.Row  # Enables column access by name
    return conn

# Route: Serve the main HTML page
@app.route("/")
def index():
    return render_template("index.html")

# API Route: Get all tasks (supports live search filtering)
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    search_query = request.args.get("search", "").strip()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if search_query:
        cursor.execute("SELECT * FROM tasks WHERE title LIKE ?", ('%' + search_query + '%',))
    else:
        cursor.execute("SELECT * FROM tasks")
        
    tasks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(tasks)

# API Route: Create a new task and save to database
@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json()
    
    if not data or "title" not in data or not data["title"].strip():
        return jsonify({"error": "Task title is required"}), 400

    title = data["title"].strip()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO tasks (title, completed) VALUES (?, 0)", (title,))
    conn.commit()
    task_id = cursor.lastrowid
    
    # Fetch and return the newly inserted task
    cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
    new_task = dict(cursor.fetchone())
    conn.close()
    
    return jsonify(new_task), 201

# API Route: Update a task's status (completed) or title
@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
    task = cursor.fetchone()
    
    if not task:
        conn.close()
        return jsonify({"error": "Task not found"}), 404

    completed = data.get("completed", task["completed"])
    title = data.get("title", task["title"])

    cursor.execute("UPDATE tasks SET title = ?, completed = ? WHERE id = ?", (title, int(completed), task_id))
    conn.commit()
    
    cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
    updated_task = dict(cursor.fetchone())
    conn.close()
    
    return jsonify(updated_task)

# API Route: Delete a single task by ID
@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Task not found"}), 404

    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Task deleted successfully"})

# API Route: Delete all tasks
@app.route("/api/tasks", methods=["DELETE"])
def delete_all_tasks():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks")
    conn.commit()
    conn.close()
    return jsonify({"message": "All tasks deleted successfully"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)