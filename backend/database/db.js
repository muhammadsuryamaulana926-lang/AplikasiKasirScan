require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database: ' + process.env.DB_NAME);
        connection.release();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('💡 Saran: Pastikan MySQL sudah menyala (XAMPP/Laragon) dan database "catatan_warung" sudah dibuat.');
    }
})();

module.exports = pool;
