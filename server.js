require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json()); 
app.use(require("cors")());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Check Database Connection
db.connect((err) => {
  if (err) {
    console.error("MySQL Connection Error:", err);
    return;
  }
  console.log("Connected to MySQL Database!");
});

// ROUTES
app.get("/", (req, res) => {
  res.send("Todo List API is Running!");
});

// Get All Tasks
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add New Task
app.post("/tasks", (req, res) => {
  const { user_id, title, deadline, status } = req.body;
  db.query(
    "INSERT INTO tasks (user_id, title, deadline, status) VALUES (?, ?, ?, ?)",
    [user_id, title, deadline, status],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Task added!", id: result.insertId });
    }
  );
});

// Start Server
const PORT = process.env.PORT || 5001; // Palitan ng ibang port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
