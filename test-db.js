import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0) {
    console.error(`❌ Missing environment variables: ${missingEnv.join(", ")}`);
    process.exit(1);
}

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        const connection = await db.getConnection();
        console.log("✅ Successfully connected to the database!");

        connection.release();

        await fetchTasks();
        
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
}
async function fetchTasks() {
    try {
        const [rows] = await db.query("SELECT * FROM tasks LIMIT 5");

        if (rows.length === 0) {
            console.log("ℹ️ No tasks found in the database.");
        } else {
            console.log("📌 Sample Tasks Data:", rows);
        }
    } catch (error) {
        console.error("❌ Error fetching tasks:", error.message);
    }
}

testConnection();
