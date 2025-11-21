import { render } from "preact";
import { useState, useEffect } from "preact/hooks";

import "./style.css";

const API_BASE = import.meta.env.VITE_API_URL ||"http://backend:3000";

export function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/listTasks`, { method: "GET" });
      const data = await res.json();
      setTasks((data || []).map((r) => ({ id: r.id, text: r.task ?? r.text })));
    } catch {
      alert("Failed to load tasks. Make sure API is running.");
    } finally {
      setLoading(false);
    }
  }

  async function addTask(e) {
    e.preventDefault();
    const value = task.trim();
    if (!value) return;

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: value })
      });
      const json = await res.json();
      if (json?.success) {
        setTask("");
        await fetchTasks();
      }
    } catch {
      alert("Failed to add task.");
    }
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json?.success) fetchTasks();
    } catch {
      alert("Failed to delete task.");
    }
  }

  function startEdit(taskObj) {
    setEditingId(taskObj.id);
    setEditText(taskObj.text);
  }

  async function updateTask(id) {
    const value = editText.trim();
    if (!value) return;

    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: value })
      });
      const json = await res.json();
      if (json?.success) {
        setEditingId(null);
        setEditText("");
        fetchTasks();
      }
    } catch {
      alert("Failed to update task.");
    }
  }

  return (
    <div class="container">
      <h1 class="title">Todo App</h1>

      <form class="form" onSubmit={addTask}>
        <input
          class="input"
          type="text"
          placeholder="Enter task..."
          value={task}
          onInput={(e) => setTask(e.currentTarget.value)}
        />
        <button class="btn add-btn" type="submit">Add</button>
        <button class="btn refresh-btn" type="button" onClick={fetchTasks}>
          Refresh
        </button>
      </form>

      {loading && <p class="loading">Loading...</p>}

      <ul class="task-list">
        {tasks.map((t) => (
          <li key={t.id} class="task-item">
            {editingId === t.id ? (
              <>
                <input
                  class="edit-input"
                  value={editText}
                  onInput={(e) => setEditText(e.currentTarget.value)}
                />
                <button class="btn save-btn" onClick={() => updateTask(t.id)}>Save</button>
                <button class="btn cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span class="task-text">{t.text}</span>
                <button class="btn edit-btn" onClick={() => startEdit(t)}>Edit</button>
                <button class="btn delete-btn" onClick={() => deleteTask(t.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

render(<App />, document.getElementById("app"));
