// Memuat variabel lingkungan dari file .env
require('dotenv').config();

// Import library MySQL dengan dukungan Promise (async/await)
const mysql = require('mysql2/promise');

// Membuat connection pool ke database MySQL
// Pool memungkinkan banyak koneksi sekaligus tanpa membuat koneksi baru setiap request
const pool = mysql.createPool({
    host: process.env.DB_HOST,         // Alamat server database (biasanya localhost)
    user: process.env.DB_USER,         // Username database
    password: process.env.DB_PASS,     // Password database
    database: process.env.DB_NAME,     // Nama database yang digunakan
    waitForConnections: true,          // Tunggu jika semua koneksi sedang dipakai
    connectionLimit: 10,               // Maksimal 10 koneksi bersamaan
    queueLimit: 0                      // Tidak ada batas antrian koneksi
});

// Tes koneksi saat pertama kali file ini dijalankan
(async () => {
    try {
        // Ambil satu koneksi dari pool untuk tes
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database: ' + process.env.DB_NAME);
        // Kembalikan koneksi ke pool setelah selesai dipakai
        connection.release();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('💡 Saran: Pastikan MySQL sudah menyala (XAMPP/Laragon) dan database "catatan_warung" sudah dibuat.');
    }
})();

// Ekspor pool agar bisa digunakan di semua file routes
module.exports = pool;
