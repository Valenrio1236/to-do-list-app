import React, { useState, useEffect, useCallback } from "react";

// Move API_URL outside component — it's static
const API_URL =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api/todos`
    : "http://localhost:5000/api/todos";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");

  // Fetch all tasks
  const getTasks = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  }, []); // Empty array — API_URL is stable

  // Add new task
  const addTask = useCallback(async () => {
    if (!newTask.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTask }),
      });

      if (!res.ok) throw new Error("Failed to add task");

      const newTodo = await res.json();
      setTodos((prev) => [...prev, newTodo]);
      setNewTask("");
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  }, [newTask]); // Only depends on newTask

  // Toggle task completion
  const toggleDone = useCallback(
    async (id) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ done: !todo.done }),
        });

        if (!res.ok) throw new Error("Failed to update");

        const updated = await res.json();
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch (err) {
        console.error("Failed to update:", err);
      }
    },
    [todos] // Re-create only if todos array changes
  );

  // Delete task
  const deleteTask = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }, []);

  // Load tasks on mount
  useEffect(() => {
    getTasks();
  }, [getTasks]);

  return (
    <div className="container">
      <h1>To Do App</h1>

      <div className="input-group">
        <input
          type="text"
          placeholder="Enter a task here"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
        />
        <button className="save" onClick={addTask}>
          SAVE!!!
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Todo item</th>
              <th>Status</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {todos.length > 0 ? (
              todos.map((todo, index) => (
                <tr key={todo.id}>
                  <td>{index + 1}</td>
                  <td>
                    {todo.done && (
                      <span className="check-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                    {todo.task}
                  </td>
                  <td className={todo.done ? "status finished" : "status"}>
                    {todo.done ? "Finished" : "In progress"}
                  </td>
                  <td className="actions">
                    <button
                      className="delete"
                      onClick={() => deleteTask(todo.id)}
                    >
                      DELETE!
                    </button>
                    <button
                      className="finish"
                      onClick={() => toggleDone(todo.id)}
                    >
                      {todo.done ? "UNDO" : "FINISHED"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty">
                  No tasks yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}