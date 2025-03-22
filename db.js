import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default db;
async function initializeDB() {
    try {
        const connection = await db.getConnection();
        console.log("✅ Connected to the database!");
        
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                due_date DATE NOT NULL,
                priority ENUM('Low priority', 'Medium priority', 'High priority') NOT NULL,
                category ENUM('Work', 'Personal', 'Shopping', 'Health', 'Books to Read', 'Others') NOT NULL,
                description TEXT,
                status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending'
            );
        `);

        console.log("✅ Tasks table is ready.");
        connection.release();
    } catch (error) {
        console.error("❌ Database initialization failed:", error.message);
        process.exit(1);
    }
}
initializeDB();
