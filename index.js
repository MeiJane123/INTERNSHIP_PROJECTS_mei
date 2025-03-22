import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/tasks", async (req, res) => {
    try {
        const [tasks] = await db.query("SELECT * FROM tasks");
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

app.post("/tasks", async (req, res) => {
    const { title, due_date, priority, category } = req.body;

    if (!title || !due_date) {
        return res.status(400).json({ error: "Title and due date required" });
    }

    try {
        await db.query("INSERT INTO tasks (title, due_date, priority, category) VALUES (?, ?, ?, ?)",
            [title, due_date, priority, category]);
        res.status(201).json({ message: "Task added successfully" });
    } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({ error: "Failed to add task" });
    }
});

app.put("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { title, due_date, priority, category } = req.body;

    try {
        await db.query("UPDATE tasks SET title=?, due_date=?, priority=?, category=? WHERE id=?",
            [title, due_date, priority, category, id]);
        res.json({ message: "Task updated successfully" });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
});

app.delete("/tasks/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM tasks WHERE id=?", [id]);
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
