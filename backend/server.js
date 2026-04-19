// Memuat variabel lingkungan dari file .env (PORT, DB_HOST, dll)
require('dotenv').config();

// Import library utama
const express = require('express');
const cors = require('cors');

// Import middleware penanganan error global
const errorHandler = require('./middleware/m_error_handler');

// Membuat instance aplikasi Express
const app = express();

// Menentukan port server, default 3001 jika tidak ada di .env
const PORT = process.env.PORT || 3001;

// Menginisialisasi koneksi ke database MySQL saat server pertama kali jalan
require('./database/db');

// ─── MIDDLEWARE ───────────────────────────────────────────────
// Mengizinkan request dari domain lain (React Native / browser)
app.use(cors());

// Mengizinkan body request berformat JSON dengan ukuran maksimal 50mb
app.use(express.json({ limit: '50mb' }));

// Mengizinkan body request berformat form-urlencoded dengan ukuran maksimal 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── ROUTES ───────────────────────────────────────────────────
// Mendaftarkan semua route API dengan prefix /api/...
app.use('/api/products', require('./routes/r_produk')());
app.use('/api/customers', require('./routes/r_pelanggan')());
app.use('/api/transactions', require('./routes/r_transaksi')());
app.use('/api/debts', require('./routes/r_hutang')());
app.use('/api/suppliers', require('./routes/r_pemasok')());
app.use('/api/employees', require('./routes/r_auth')());
app.use('/api/reports', require('./routes/r_dasbor')());

// ─── HEALTH CHECK ─────────────────────────────────────────────
// Endpoint untuk mengecek apakah server sedang berjalan
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'Catatan Warung API' });
});

// ─── ERROR HANDLER ────────────────────────────────────────────
// Middleware penanganan error global, harus dipasang paling akhir
app.use(errorHandler);

// ─── JALANKAN SERVER ──────────────────────────────────────────
// Menjalankan server dan mendengarkan semua interface jaringan (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Catatan Warung API running on http://localhost:${PORT}`);
    console.log(`📡 Database: ${process.env.DB_NAME}`);
});
