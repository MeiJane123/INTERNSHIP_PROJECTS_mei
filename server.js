import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const PORT = process.env.PORT || 5000;

async function testDBConnection() {
    try {
        const [rows] = await db.query("SELECT 1");
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
}
testDBConnection();

app.get("/tasks", async (req, res) => {
    try {
        const [tasks] = await db.query("SELECT * FROM tasks");
        res.status(200).json(tasks);
    } catch (error) {
        console.error("❌ Error fetching tasks:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/tasks", async (req, res) => {
    console.log("📩 Received task:", req.body); // Debugging log

    let { title, due_date, priority, category } = req.body;

    if (!title || !due_date) {
        return res.status(400).json({ error: "❌ Title and due date are required" });
    }

    // Assign default values
    priority = priority || "Low Priority";
    category = category || "others";

    try {
        console.log(`📊 Inserting into DB: title=${title}, due_date=${due_date}, priority=${priority}, category=${category}`);
        
        await db.query(
            "INSERT INTO tasks (title, due_date, priority, category) VALUES (?, ?, ?, ?)",
            [title, due_date, priority, category]
        );

        res.status(201).json({ message: "✅ Task added successfully!" });
    } catch (error) {
        console.error("❌ Error adding task:", error);
        res.status(500).json({ error: "Failed to add task" });
    }
});

app.put("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    let { title, due_date, priority, category, description, start_time, end_time, status } = req.body;

    if (!id) {
        return res.status(400).json({ error: "❌ Task ID is required" });
    }

    // Assign default values if missing
    title = title || "Untitled Task";
    priority = priority || "Low Priority";
    category = category || "others";
    description = description || "";
    start_time = start_time || null;
    end_time = end_time || null;
    status = status || "pending";

    try {
        console.log(`📊 Updating task: id=${id}, title=${title}, due_date=${due_date}, priority=${priority}, category=${category}`);

        const [result] = await db.execute(
            `UPDATE tasks
            SET title = ?, due_date = ?, priority = ?, category = ?, description = ?, start_time = ?, end_time = ?, status = ?
            WHERE id = ?`,
            [title, due_date, priority, category, description, start_time, end_time, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "❌ Task not found" });
        }

        res.json({ message: "✅ Task updated successfully!" });

    } catch (error) {
        console.error("❌ Error updating task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.patch('/tasks/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "❌ Status is required" });
        }

        const [result] = await db.execute(
            `UPDATE tasks SET status = ? WHERE id = ?`,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "❌ Task not found" });
        }

        res.json({ message: "✅ Task status updated successfully!" });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put('/tasks/:id', async (req, res) => {
    const { title, due_date, start_time, end_time, category, description, status, priority } = req.body;
    const { id } = req.params;

    console.log("🛠 Updating task:", { id, title, due_date, start_time, end_time, category, description, status, priority });

    // Kung may undefined, gawin itong NULL
    const safeDueDate = due_date !== undefined ? due_date : null;

    try {
        const [result] = await pool.execute(
            `UPDATE tasks SET title=?, due_date=?, start_time=?, end_time=?, category=?, description=?, status=?, priority=?, updated_at=NOW() WHERE id=?`,
            [title, safeDueDate, start_time, end_time, category, description, status, priority, id]
        );

        res.json({ success: true, message: "Task updated successfully!" });
    } catch (error) {
        console.error("❌ Error updating task:", error);
        res.status(500).json({ success: false, message: "Failed to update task", error });
    }
});

app.delete("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute("DELETE FROM tasks WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found." });
        }

        res.status(200).json({ message: "✅ Task deleted successfully!" });
    } catch (error) {
        console.error("❌ Error deleting task:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/tasks/bulk-save", async (req, res) => {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        return res.status(400).json({ error: "Invalid task list." });
    }

    try {
        const values = tasks.map(task => [
            task.title,
            task.due_date,
            task.priority || "Low Priority",
            task.category || "others",
            task.description || "",
            task.start_time || null,
            task.end_time || null
        ]);

        const query = `
            INSERT INTO tasks (title, due_date, priority, category, description, start_time, end_time)
            VALUES ?
        `;

        await db.query(query, [values]);

        res.status(201).json({ message: "✅ Bulk tasks saved successfully!" });
    } catch (error) {
        console.error("❌ Error bulk-saving tasks:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
