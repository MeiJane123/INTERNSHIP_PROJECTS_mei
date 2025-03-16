require("dotenv").config();  // Load environment variables
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8081;

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect(err => {
    if (err) {
        console.error("❌ MySQL Connection Failed:", err);
        process.exit(1);
    }
    console.log("✅ MySQL Connected...");
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// ROUTES DITO...
// (Siguraduhin mong wala kang duplicate na routes)

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ✅ GUMAWA NG TASKS TABLE KUNG WALA PA
db.query(
    `CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        deadline DATE,
        status ENUM('pending', 'completed') DEFAULT 'pending',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) console.error("❌ Error creating tasks table:", err);
    }
);

// ✅ REGISTER USER
app.post("/users", (req, res) => {
    console.log("📢 Received Data:", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, SHA2(?, 256))";
    db.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error("❌ Database Insert Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: result.insertId, username, email });
    });
});

// ✅ GET TASKS
app.get("/tasks/:user_id", (req, res) => {
    const { user_id } = req.params;
    db.query("SELECT * FROM tasks WHERE user_id = ?", [user_id], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// ✅ ADD TASK
app.post("/tasks", (req, res) => {
    const { user_id, title, deadline } = req.body;

    if (!user_id || !title) {
        return res.status(400).json({ error: "User ID and Task Title are required!" });
    }

    db.query("INSERT INTO tasks (user_id, title, deadline) VALUES (?, ?, ?)", 
        [user_id, title, deadline], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, user_id, title, deadline });
    });
});

// ✅ UPDATE TASK STATUS
app.put("/tasks/:id", (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    db.query("UPDATE tasks SET status = ? WHERE id = ?", [status, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, status });
    });
});

// ✅ DELETE TASK
app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM tasks WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id });
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

