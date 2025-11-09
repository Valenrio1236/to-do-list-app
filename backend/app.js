const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let todos = [];
let nextId = 1;

app.get("/api/todos", (req, res) => {
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const { task } = req.body;
  if (!task || task.trim() === "") {
    return res.status(400).json({ message: "Task is required" });
  }

  const newTodo = { id: nextId++, task: task.trim(), done: false };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { done } = req.body;

  const todo = todos.find((t) => t.id === parseInt(id));
  if (!todo) return res.status(404).json({ message: "Not found" });

  todo.done = done !== undefined ? done : !todo.done;
  res.json(todo);
});

app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex((t) => t.id === parseInt(id));
  if (index === -1) return res.status(404).json({ message: "Not found" });

  todos.splice(index, 1);
  res.json({ message: "Deleted" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});